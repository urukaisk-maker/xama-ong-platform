
---

## 2. Script de datos de prueba

```bash
cat > ~/setup-seed.sh <<'SCRIPT_EOF'
#!/usr/bin/env bash
set -e

ROOT="$HOME/proyectos/xama-ong-platform"
cd "$ROOT"

mkdir -p backend/scripts
touch backend/scripts/__init__.py

cat > backend/scripts/seed.py <<'PYEOF'
"""Script de datos de prueba para XAMA-ONG Platform.

Uso:
    docker compose exec xama-api python -m scripts.seed
"""
import asyncio
import random
import uuid
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.modules.families.models import Delivery, Family
from app.modules.inventory.models import Batch, Product
from app.modules.nevera.models import Derivation, NeveraRation
from app.modules.users.models import Role, User
from app.modules.volunteers.models import Shift, ShiftAssignment

random.seed(42)

# ─── Datos realistas ───
PRODUCTOS = [
    ("Manzanas", "fruta", "kg"),
    ("Plátanos", "fruta", "kg"),
    ("Naranjas", "fruta", "kg"),
    ("Tomates", "verdura", "kg"),
    ("Lechuga", "verdura", "unidad"),
    ("Zanahorias", "verdura", "kg"),
    ("Patatas", "verdura", "kg"),
    ("Cebollas", "verdura", "kg"),
    ("Pan de molde", "panaderia", "unidad"),
    ("Baguettes", "panaderia", "unidad"),
    ("Croissants", "bolleria", "unidad"),
    ("Leche entera", "lacteos", "litro"),
    ("Yogur natural", "lacteos", "unidad"),
    ("Queso tierno", "lacteos", "kg"),
    ("Arroz", "granos", "kg"),
    ("Pasta", "granos", "kg"),
    ("Lentejas", "legumbres", "kg"),
    ("Garbanzos", "legumbres", "kg"),
    ("Atún en lata", "conservas", "unidad"),
    ("Aceite de oliva", "aceites", "litro"),
]

ORIGENES = [
    "comercio_local",
    "donacion_corporativa",
    "excedente_agricola",
    "comida_cocinada",
    "campana_solidaria",
]

NOMBRES = [
    "Ana", "María", "Carmen", "Lucía", "Sofía", "Marta", "Laura", "Elena",
    "Javier", "Carlos", "Miguel", "David", "José", "Antonio", "Pablo", "Sergio",
    "Nuria", "Cristina", "Patricia", "Isabel", "Rocío", "Silvia", "Raquel", "Beatriz",
]

APELLIDOS = [
    "García", "Martínez", "López", "Sánchez", "Rodríguez", "Fernández", "Gómez",
    "Ruiz", "Díaz", "Torres", "Vázquez", "Ramos", "Moreno", "Jiménez", "Álvarez",
    "Romero", "Hernández", "Castro", "Ortega", "Rubio",
]

CALLES = [
    "Carrer Major", "Avinguda de Roma", "Carrer de Sant Joan", "Rambla Nova",
    "Carrer de l'Estació", "Plaça Prim", "Carrer Ample", "Carrer de la Pau",
    "Avinguda de la Pau", "Carrer Nou",
]


def random_name() -> str:
    return f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"


async def seed():
    async with SessionLocal() as db:
        # Verificar si ya hay datos
        existing = await db.scalar(select(User).limit(1))
        if existing is not None:
            print("⚠️  Ya hay datos en la DB. Abortando para no duplicar.")
            print("   Para empezar limpio: docker compose down -v")
            return

        print("→ Creando roles...")
        roles_map = {}
        for name in [
            "junta",
            "coordinador_reus",
            "coordinador_tarragona",
            "voluntario",
            "servicios_sociales",
        ]:
            r = Role(name=name)
            db.add(r)
            await db.flush()
            roles_map[name] = r.id
        await db.commit()
        print(f"  ✓ {len(roles_map)} roles")

        # ─── Usuarios ───
        print("→ Creando usuarios...")
        users = []

        admin = User(
            email="admin@xama.local",
            password_hash=hash_password("admin1234"),
            full_name="Administrador XAMA",
            role_id=roles_map["junta"],
            site=None,
            active=True,
        )
        db.add(admin)
        users.append(admin)

        coord_reus = User(
            email="coord.reus@xama.local",
            password_hash=hash_password("coord1234"),
            full_name="Coordinador Reus",
            role_id=roles_map["coordinador_reus"],
            site="reus",
            active=True,
        )
        coord_tgn = User(
            email="coord.tarragona@xama.local",
            password_hash=hash_password("coord1234"),
            full_name="Coordinador Tarragona",
            role_id=roles_map["coordinador_tarragona"],
            site="tarragona",
            active=True,
        )
        ss = User(
            email="ss@xama.local",
            password_hash=hash_password("ss1234"),
            full_name="Servicios Sociales",
            role_id=roles_map["servicios_sociales"],
            site=None,
            active=True,
        )
        db.add_all([coord_reus, coord_tgn, ss])
        await db.commit()

        # 31 voluntarios: 16 Reus + 15 Tarragona
        for i in range(16):
            u = User(
                email=f"vol.reus{i + 1}@xama.local",
                password_hash=hash_password("vol1234"),
                full_name=random_name(),
                role_id=roles_map["voluntario"],
                site="reus",
                active=True,
            )
            db.add(u)
            users.append(u)

        for i in range(15):
            u = User(
                email=f"vol.tgn{i + 1}@xama.local",
                password_hash=hash_password("vol1234"),
                full_name=random_name(),
                role_id=roles_map["voluntario"],
                site="tarragona",
                active=True,
            )
            db.add(u)
            users.append(u)

        await db.commit()
        print(f"  ✓ {len(users) + 3} usuarios (admin, 2 coord, 1 ss, 31 voluntarios)")

        # ─── Productos y lotes ───
        print("→ Creando productos y lotes...")
        products = []
        for name, cat, unit in PRODUCTOS:
            p = Product(name=name, category=cat, unit=unit)
            db.add(p)
            products.append(p)
        await db.commit()

        batches = []
        today = date.today()
        for _ in range(80):
            p = random.choice(products)
            days_offset = random.choice([2, 3, 5, 7, 10, 14, 20, 30, 45, 60])
            b = Batch(
                product_id=p.id,
                origin=random.choice(ORIGENES),
                quantity=round(random.uniform(1, 40), 2),
                expiry_date=today + timedelta(days=days_offset),
                status="disponible",
            )
            db.add(b)
            batches.append(b)
        await db.commit()
        print(f"  ✓ {len(products)} productos, {len(batches)} lotes")

        # ─── Familias ───
        print("→ Creando familias...")
        familias = []
        for i in range(30):
            site = "reus" if i < 15 else "tarragona"
            fam = Family(
                reference_code=f"FAM-{100 + i:03d}",
                address=f"{random.choice(CALLES)} {random.randint(1, 150)}, {site.capitalize()}",
                phone=f"6{random.randint(10000000, 99999999)}",
                adults=random.randint(1, 4),
                minors=random.randint(0, 4),
                site=site,
                active=True,
                dietary_restrictions=random.choice(
                    [None, None, None, "Sin gluten", "Sin lactosa", "Vegetariana", "Alergia a frutos secos"]
                ),
            )
            db.add(fam)
            familias.append(fam)
        await db.commit()
        print(f"  ✓ {len(familias)} familias")

        # ─── Entregas de los últimos 7 días ───
        print("→ Creando entregas...")
        deliveries = []
        for days_ago in range(7):
            target_date = today - timedelta(days=days_ago)
            for fam in random.sample(familias, random.randint(4, 10)):
                status = "entregada" if days_ago > 0 or random.random() > 0.4 else "pendiente"
                d = Delivery(
                    family_id=fam.id,
                    delivery_date=target_date,
                    site=fam.site,
                    status=status,
                    checked_in_at=datetime.now(timezone.utc) if status == "entregada" else None,
                )
                db.add(d)
                deliveries.append(d)
        await db.commit()
        print(f"  ✓ {len(deliveries)} entregas")

        # ─── Raciones Nevera de los últimos 14 días ───
        print("→ Creando raciones Nevera...")
        for days_ago in range(14):
            target_date = today - timedelta(days=days_ago)
            target = 20
            served = random.randint(14, 22)
            n = NeveraRation(
                date=target_date,
                target_rations=target,
                served_rations=served,
            )
            db.add(n)
        await db.commit()
        print("  ✓ 14 días de raciones")

        # ─── Derivaciones ───
        print("→ Creando derivaciones...")
        origenes = ["servicios_sociales", "policia_local", "cruz_roja", "voluntario", "otro"]
        for i in range(10):
            status = random.choice(["pendiente", "servida", "servida", "servida"])
            d = Derivation(
                reference_code=f"DER-{200 + i:03d}",
                person_name=random.choice([None, random_name()]),
                origin=random.choice(origenes),
                reason=random.choice(
                    ["Persona sin hogar", "Urgencia familiar", "Caso derivado SS", "Atención puntual"]
                ),
                rations=random.randint(1, 4),
                status=status,
                served_at=datetime.now(timezone.utc) if status == "servida" else None,
            )
            db.add(d)
        await db.commit()
        print("  ✓ 10 derivaciones")

        # ─── Turnos de la semana ───
        print("→ Creando turnos...")
        roles_turno = ["vehiculo", "clasificacion", "cestas", "puerta"]
        turns = []
        for days_offset in range(0, 7):
            shift_date = today + timedelta(days=days_offset)
            for site in ["reus", "tarragona"]:
                for role in roles_turno:
                    s = Shift(
                        shift_date=shift_date,
                        site=site,
                        role=role,
                        start_time=time(9, 0),
                        end_time=time(13, 0),
                        capacity=random.randint(2, 4),
                    )
                    db.add(s)
                    turns.append(s)
        await db.commit()
        print(f"  ✓ {len(turns)} turnos")

        # ─── Asignaciones de algunos turnos ───
        print("→ Asignando voluntarios...")
        vol_reus = [u for u in users if u.site == "reus"]
        vol_tgn = [u for u in users if u.site == "tarragona"]
        assigned = 0
        for s in turns:
            pool = vol_reus if s.site == "reus" else vol_tgn
            num = random.randint(0, min(s.capacity, len(pool)))
            for u in random.sample(pool, num):
                a = ShiftAssignment(
                    shift_id=s.id,
                    user_id=u.id,
                    hours=round(random.uniform(2, 4), 1) if random.random() > 0.5 else None,
                    attended=random.random() > 0.4,
                )
                db.add(a)
                assigned += 1
        await db.commit()
        print(f"  ✓ {assigned} asignaciones")

        print()
        print("=" * 60)
        print("  ✅ DATOS DE PRUEBA CREADOS")
        print("=" * 60)
        print()
        print("Credenciales:")
        print("  admin@xama.local           / admin1234    (junta)")
        print("  coord.reus@xama.local      / coord1234    (coordinador_reus)")
        print("  coord.tarragona@xama.local / coord1234    (coordinador_tarragona)")
        print("  ss@xama.local              / ss1234       (servicios_sociales)")
        print("  vol.reus1@xama.local       / vol1234      (voluntario Reus)")
        print("  vol.tgn1@xama.local        / vol1234      (voluntario Tarragona)")
        print()


if __name__ == "__main__":
    asyncio.run(seed())
PYEOF

echo "✅ Script seed creado"
SCRIPT_EOF

chmod +x ~/setup-seed.sh
bash ~/setup-seed.sh

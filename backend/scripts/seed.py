"""Script de datos de prueba para XAMA-ONG Platform.

Uso:
    docker compose exec xama-api python -m scripts.seed
"""
import asyncio
import random
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.modules.families.models import Delivery, Family
from app.modules.inventory.models import Batch, Product
from app.modules.nevera.models import Derivation, NeveraRation
from app.modules.users.models import Role, User
from app.modules.volunteers.models import Shift, ShiftAssignment

random.seed(42)

PRODUCTOS = [
    ("Manzanas", "fruta", "kg"), ("Plátanos", "fruta", "kg"),
    ("Naranjas", "fruta", "kg"), ("Tomates", "verdura", "kg"),
    ("Lechuga", "verdura", "unidad"), ("Zanahorias", "verdura", "kg"),
    ("Patatas", "verdura", "kg"), ("Cebollas", "verdura", "kg"),
    ("Pan de molde", "panaderia", "unidad"), ("Baguettes", "panaderia", "unidad"),
    ("Croissants", "bolleria", "unidad"), ("Leche entera", "lacteos", "litro"),
    ("Yogur natural", "lacteos", "unidad"), ("Queso tierno", "lacteos", "kg"),
    ("Arroz", "granos", "kg"), ("Pasta", "granos", "kg"),
    ("Lentejas", "legumbres", "kg"), ("Garbanzos", "legumbres", "kg"),
    ("Atún en lata", "conservas", "unidad"), ("Aceite de oliva", "aceites", "litro"),
]

ORIGENES = ["comercio_local", "donacion_corporativa", "excedente_agricola",
            "comida_cocinada", "campana_solidaria"]

NOMBRES = ["Ana", "María", "Carmen", "Lucía", "Sofía", "Marta", "Laura", "Elena",
           "Javier", "Carlos", "Miguel", "David", "José", "Antonio", "Pablo",
           "Sergio", "Nuria", "Cristina", "Patricia", "Isabel", "Rocío", "Silvia"]

APELLIDOS = ["García", "Martínez", "López", "Sánchez", "Rodríguez", "Fernández",
             "Gómez", "Ruiz", "Díaz", "Torres", "Vázquez", "Ramos", "Moreno",
             "Jiménez", "Álvarez", "Romero", "Hernández", "Castro"]

CALLES = ["Carrer Major", "Avinguda de Roma", "Carrer de Sant Joan", "Rambla Nova",
          "Carrer de l'Estació", "Plaça Prim", "Carrer Ample", "Carrer de la Pau"]


def random_name():
    return f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"


async def get_or_create_role(db, name: str) -> int:
    """Devuelve el ID del rol, creándolo si no existe."""
    existing = await db.scalar(select(Role).where(Role.name == name))
    if existing is not None:
        return existing.id
    r = Role(name=name)
    db.add(r)
    await db.flush()
    return r.id


async def seed():
    async with SessionLocal() as db:
        # Solo abortar si hay usuarios (además del admin auto-creado)
        existing_users = await db.scalar(
            select(func.count(User.id)).where(User.email != "admin@xama.local")
        )
        if existing_users and existing_users > 0:
            print("⚠  Ya hay datos. Para resetear: docker compose down -v && docker compose up -d")
            return

        print("→ Roles...")
        roles_map = {}
        for name in ["junta", "coordinador_reus", "coordinador_tarragona",
                     "voluntario", "servicios_sociales"]:
            roles_map[name] = await get_or_create_role(db, name)
        await db.commit()
        print(f"  ✓ {len(roles_map)} roles")

        print("→ Usuarios...")
        # Admin ya existe (auto-creado), no lo tocamos
        admin = await db.scalar(select(User).where(User.email == "admin@xama.local"))
        if admin is None:
            admin = User(email="admin@xama.local", password_hash=hash_password("admin1234"),
                         full_name="Administrador XAMA", role_id=roles_map["junta"])
            db.add(admin)
            await db.flush()

        # Otros usuarios: comprobar si existen
        async def ensure_user(email, password, full_name, role_id, site=None):
            u = await db.scalar(select(User).where(User.email == email))
            if u is not None:
                return u
            u = User(email=email, password_hash=hash_password(password),
                     full_name=full_name, role_id=role_id, site=site)
            db.add(u)
            await db.flush()
            return u

        await ensure_user("coord.reus@xama.local", "coord1234",
                          "Coordinador Reus", roles_map["coordinador_reus"], "reus")
        await ensure_user("coord.tarragona@xama.local", "coord1234",
                          "Coordinador Tarragona", roles_map["coordinador_tarragona"], "tarragona")
        await ensure_user("ss@xama.local", "ss1234",
                          "Servicios Sociales", roles_map["servicios_sociales"])
        await db.commit()

        users = [admin]
        for i in range(16):
            u = await ensure_user(f"vol.reus{i+1}@xama.local", "vol1234",
                                  random_name(), roles_map["voluntario"], "reus")
            users.append(u)
        for i in range(15):
            u = await ensure_user(f"vol.tgn{i+1}@xama.local", "vol1234",
                                  random_name(), roles_map["voluntario"], "tarragona")
            users.append(u)
        await db.commit()
        print(f"  ✓ {len(users) + 3} usuarios")

        print("→ Productos y lotes...")
        existing_products = await db.scalar(select(func.count(Product.id)))
        if existing_products and existing_products > 0:
            print("  ⏭  Ya hay productos, saltando")
        else:
            products = []
            for name, cat, unit in PRODUCTOS:
                p = Product(name=name, category=cat, unit=unit)
                db.add(p); products.append(p)
            await db.commit()

            today = date.today()
            for _ in range(80):
                p = random.choice(products)
                db.add(Batch(product_id=p.id, origin=random.choice(ORIGENES),
                             quantity=round(random.uniform(1, 40), 2),
                             expiry_date=today + timedelta(days=random.choice([2, 3, 5, 7, 10, 14, 20, 30, 45, 60])),
                             status="disponible"))
            await db.commit()
            print("  ✓ 20 productos, 80 lotes")

        print("→ Familias...")
        existing_fams = await db.scalar(select(func.count(Family.id)))
        if existing_fams and existing_fams > 0:
            print("  ⏭  Ya hay familias, saltando")
            familias = list((await db.execute(select(Family))).scalars().all())
        else:
            familias = []
            for i in range(30):
                site = "reus" if i < 15 else "tarragona"
                fam = Family(reference_code=f"FAM-{100+i:03d}",
                             address=f"{random.choice(CALLES)} {random.randint(1,150)}, {site}",
                             phone=f"6{random.randint(10000000, 99999999)}",
                             adults=random.randint(1, 4), minors=random.randint(0, 4),
                             site=site, active=True,
                             dietary_restrictions=random.choice([None, None, None, "Sin gluten", "Sin lactosa", "Vegetariana"]))
                db.add(fam); familias.append(fam)
            await db.commit()
            print("  ✓ 30 familias")

        print("→ Entregas...")
        existing_del = await db.scalar(select(func.count(Delivery.id)))
        if existing_del and existing_del > 0:
            print("  ⏭  Ya hay entregas, saltando")
        else:
            today = date.today()
            n_del = 0
            for days_ago in range(7):
                target = today - timedelta(days=days_ago)
                for fam in random.sample(familias, random.randint(4, 10)):
                    status = "entregada" if days_ago > 0 or random.random() > 0.4 else "pendiente"
                    db.add(Delivery(family_id=fam.id, delivery_date=target, site=fam.site,
                                    status=status,
                                    checked_in_at=datetime.now(timezone.utc) if status == "entregada" else None))
                    n_del += 1
            await db.commit()
            print(f"  ✓ {n_del} entregas")

        print("→ Raciones Nevera (14 días)...")
        existing_rat = await db.scalar(select(func.count(NeveraRation.id)))
        if existing_rat and existing_rat > 0:
            print("  ⏭  Ya hay raciones, saltando")
        else:
            today = date.today()
            for days_ago in range(14):
                db.add(NeveraRation(date=today - timedelta(days=days_ago), target_rations=20,
                                    served_rations=random.randint(14, 22)))
            await db.commit()
            print("  ✓ 14 días")

        print("→ Derivaciones...")
        existing_der = await db.scalar(select(func.count(Derivation.id)))
        if existing_der and existing_der > 0:
            print("  ⏭  Ya hay derivaciones, saltando")
        else:
            for i in range(10):
                status = random.choice(["pendiente", "servida", "servida", "servida"])
                db.add(Derivation(reference_code=f"DER-{200+i:03d}",
                                  person_name=random.choice([None, random_name()]),
                                  origin=random.choice(["servicios_sociales", "policia_local", "cruz_roja", "voluntario"]),
                                  reason="Persona sin hogar",
                                  rations=random.randint(1, 4), status=status,
                                  served_at=datetime.now(timezone.utc) if status == "servida" else None))
            await db.commit()
            print("  ✓ 10 derivaciones")

        print("→ Turnos (7 días x 2 sedes x 4 roles)...")
        existing_shifts = await db.scalar(select(func.count(Shift.id)))
        if existing_shifts and existing_shifts > 0:
            print("  ⏭  Ya hay turnos, saltando")
            turns = list((await db.execute(select(Shift))).scalars().all())
        else:
            today = date.today()
            turns = []
            for days_offset in range(7):
                for site in ["reus", "tarragona"]:
                    for role in ["vehiculo", "clasificacion", "cestas", "puerta"]:
                        s = Shift(shift_date=today + timedelta(days=days_offset),
                                  site=site, role=role, start_time=time(9, 0),
                                  end_time=time(13, 0), capacity=random.randint(2, 4))
                        db.add(s); turns.append(s)
            await db.commit()
            print(f"  ✓ {len(turns)} turnos")

        print("→ Asignaciones...")
        existing_asg = await db.scalar(select(func.count(ShiftAssignment.id)))
        if existing_asg and existing_asg > 0:
            print("  ⏭  Ya hay asignaciones, saltando")
        else:
            vol_reus = [u for u in users if u.site == "reus"]
            vol_tgn = [u for u in users if u.site == "tarragona"]
            n_asg = 0
            for s in turns:
                pool = vol_reus if s.site == "reus" else vol_tgn
                for u in random.sample(pool, random.randint(0, min(s.capacity, len(pool)))):
                    db.add(ShiftAssignment(shift_id=s.id, user_id=u.id,
                                           hours=round(random.uniform(2, 4), 1) if random.random() > 0.5 else None,
                                           attended=random.random() > 0.4))
                    n_asg += 1
            await db.commit()
            print(f"  ✓ {n_asg} asignaciones")

        print()
        print("=" * 60)
        print("  ✅ SEED COMPLETADO")
        print("=" * 60)
        print("  admin@xama.local           / admin1234")
        print("  coord.reus@xama.local      / coord1234")
        print("  coord.tarragona@xama.local / coord1234")
        print("  ss@xama.local              / ss1234")
        print("  vol.reus1@xama.local       / vol1234")
        print("  vol.tgn1@xama.local        / vol1234")


if __name__ == "__main__":
    asyncio.run(seed())

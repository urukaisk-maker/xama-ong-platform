# 🏗 Arquitectura

## Visión general

    ┌─────────────────────────────────────────────────────────┐
    │                    USUARIO FINAL                        │
    │           (navegador · móvil · tablet)                  │
    └──────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
    ┌─────────────────────────────────────────────────────────┐
    │              FRONTEND (Next.js 14)                      │
    │  ┌────────────────┐  ┌─────────────────────────────┐    │
    │  │ Portada pública│  │ App interna (SSR + CSR)     │    │
    │  │ SSG + ISR      │  │ Dashboard, Inventario...    │    │
    │  └────────────────┘  └─────────────────────────────┘    │
    └──────────────────────┬──────────────────────────────────┘
                           │ REST API (JWT)
                           ▼
    ┌─────────────────────────────────────────────────────────┐
    │              BACKEND (FastAPI + async)                  │
    │                                                         │
    │  Routers → Services → Models (SQLAlchemy 2.0)           │
    │                                                         │
    │  Módulos: auth · inventory · families · volunteers      │
    │           nevera · metrics · donations · notifications  │
    │           audit · admin · public                        │
    └──────┬───────────────────┬──────────────────────────────┘
           │                   │
           ▼                   ▼
      ┌─────────┐         ┌─────────┐
      │PostgreSQL│         │  Redis  │
      │    16    │         │    7    │
      └─────────┘         └─────────┘

## Decisiones técnicas

### ¿Por qué FastAPI?

- Async nativo (SQLAlchemy 2.0 async)
- Tipado fuerte con Pydantic v2
- OpenAPI automático → Swagger gratis
- Rendimiento comparable a Node.js

### ¿Por qué SQLAlchemy 2.0 async?

- SQL tipado y moderno (Mapped, mapped_column)
- Compatible con Alembic
- Migración desde 1.x transparente

### ¿Por qué Next.js 14 App Router?

- Server Components por defecto
- SSG + ISR nativo (portada pública)
- React 18 con Suspense
- Tailwind CSS integrado

### ¿Por qué PostgreSQL?

- UUID nativo, JSON, arrays
- Rendimiento probado
- Extensiones útiles (uuid-ossp)
- Backups sencillos

### ¿Por qué Redis?

- Cache de sesiones y estadísticas
- Colas para tareas (alertas de caducidad)
- Muy ligero (alpine)

### ¿Por qué Docker Compose?

- Un solo comando levanta todo
- Reproducible en cualquier sistema
- Fácil de desplegar en VPS

## Estructura de módulos backend

Cada módulo sigue el mismo patrón:

    modulo/
    ├── __init__.py
    ├── models.py       # Modelos SQLAlchemy
    ├── schemas.py      # Pydantic (validación)
    ├── service.py      # Lógica de negocio
    ├── router.py       # Endpoints FastAPI
    └── exporters/      # (opcional) PDF, Excel, CSV

**Regla:** los routers no contienen lógica. Delegan en servicios.

## Modelo de datos (simplificado)

    users ───┬── role
             └── site

    families ──────┬── deliveries
                   └── dietary_restrictions

    products ──── batches (lotes con caducidad)

    shifts ──── shift_assignments ──── users

    nevera_rations
    derivations

    audit_log (histórico de acciones)

## Flujos clave

### 1. Entrada de alimentos

    Donación → Lote (con caducidad) → FeFo activo
                        │
                        ├─ Si caduca pronto → Alerta por email
                        ├─ Si entra en cesta → Descuenta stock
                        └─ Si va a Nevera → Deriva a cocina

### 2. Reparto a familias

    Familia → Cita asignada → Entrega → Check-in en puerta → Completada

### 3. Turno de voluntariado

    Junta/Coord crea turno → Voluntario se apunta → Check-in asistencia
                                                  → Cuenta horas → Certificado

### 4. Donación económica

    Donante → Portada pública → Bizum o transferencia → ONG recibe
                                                        │
                                                        └─ Genera certificado fiscal

## Seguridad

- **JWT** firmado con HS256, expiración 30 min
- **Hash bcrypt** para contraseñas (rounds: 12)
- **Roles** con validación por endpoint (require_role)
- **CORS** configurado para el dominio del frontend
- **HTTPS** obligatorio en producción (Cloudflare Tunnel o Nginx)
- **No hay datos sensibles en el repositorio** (backups excluidos)

## Testing

- **SQLite en memoria** para tests (rápido)
- **PostgreSQL real** en desarrollo y producción
- Los tests usan la misma app con overrides de dependencias
- 32 tests cubriendo los endpoints principales

## CI

GitHub Actions ejecuta en cada push:

1. **Backend**: instalar deps → ruff → pytest
2. **Frontend**: npm install → next build

Si algo falla, el PR no se puede mergear.

---

**Última actualización:** 27 de septiembre de 2026

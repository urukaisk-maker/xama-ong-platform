from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.modules.admin.maintenance import router as maintenance_router
from app.modules.admin.router import router as admin_router
from app.modules.audit.router import router as audit_router
from app.modules.auth.router import router as auth_router
from app.modules.auth.service import ensure_default_admin
from app.modules.families.router import router as families_router
from app.modules.inventory.router import router as inventory_router
from app.modules.metrics.router import router as metrics_router
from app.modules.nevera.router import router as nevera_router
from app.modules.public.router import router as public_router
from app.modules.volunteers.router import router as volunteers_router

# importar modelos ANTES de create_all para que Base los conozca
from app.modules.users import models as _users_models  # noqa: F401
from app.modules.families import models as _families_models  # noqa: F401
from app.modules.inventory import models as _inventory_models  # noqa: F401
from app.modules.volunteers import models as _volunteers_models  # noqa: F401
from app.modules.nevera import models as _nevera_models  # noqa: F401
from app.modules.audit import models as _audit_models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as db:
        await ensure_default_admin(db)
    yield
    await engine.dispose()


app = FastAPI(title="XAMA-ONG API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(families_router)
app.include_router(volunteers_router)
app.include_router(nevera_router)
app.include_router(metrics_router)
app.include_router(public_router)
app.include_router(audit_router)
app.include_router(admin_router)
app.include_router(maintenance_router)


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok", "env": settings.environment}


@app.get("/", tags=["system"])
async def root() -> dict:
    return {"msg": "XAMA API", "docs": "/docs"}

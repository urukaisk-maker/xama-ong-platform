from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.modules.families.router import router as families_router
from app.modules.inventory.router import router as inventory_router

# importar modelos ANTES de create_all para que Base los conozca
from app.modules.users import models as _users_models  # noqa: F401
from app.modules.families import models as _families_models  # noqa: F401
from app.modules.inventory import models as _inventory_models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="XAMA-ONG API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3100"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory_router)
app.include_router(families_router)


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok", "env": settings.environment}


@app.get("/", tags=["system"])
async def root() -> dict:
    return {"msg": "XAMA API", "docs": "/docs"}

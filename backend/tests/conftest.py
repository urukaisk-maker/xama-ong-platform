import os
import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Forzar SQLite en memoria para tests ANTES de importar la app
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("SECRET_KEY", "test_secret_key_no_usar_en_prod")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("ENVIRONMENT", "test")

from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.modules.auth.service import ensure_default_admin  # noqa: E402
from app.modules.families import models as _families_models  # noqa: E402,F401
from app.modules.inventory import models as _inventory_models  # noqa: E402,F401
from app.modules.nevera import models as _nevera_models  # noqa: E402,F401

# importar todos los modelos para que Base los conozca
from app.modules.users import models as _users_models  # noqa: E402,F401
from app.modules.users.models import Role  # noqa: E402
from app.modules.volunteers import models as _volunteers_models  # noqa: E402,F401

# Engine único compartido para todos los tests
_test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    echo=False,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    _test_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_database():
    """Crea tablas + roles + admin antes de cada test. Limpia al terminar."""
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Roles base
    async with TestSessionLocal() as db:
        for name in [
            "junta",
            "coordinador_reus",
            "coordinador_tarragona",
            "voluntario",
            "servicios_sociales",
        ]:
            db.add(Role(name=name))
        await db.commit()
        await ensure_default_admin(db)

    yield

    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"email": "admin@xama.local", "password": "admin1234"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def admin_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest_asyncio.fixture
async def volunteer_headers(client: AsyncClient, admin_headers: dict) -> dict:
    email = f"vol_{uuid.uuid4().hex[:8]}@xama.local"
    resp = await client.post(
        "/api/auth/users",
        headers=admin_headers,
        json={
            "email": email,
            "password": "vol1234",
            "full_name": "Voluntario Test",
            "site": "reus",
            "role_id": 4,
        },
    )
    assert resp.status_code == 201, resp.text

    login = await client.post(
        "/api/auth/login", json={"email": email, "password": "vol1234"}
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

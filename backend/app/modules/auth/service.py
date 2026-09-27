import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.modules.auth import schemas
from app.modules.users.models import Role, User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await db.get(User, user_id)


async def authenticate(
    db: AsyncSession, email: str, password: str
) -> User | None:
    user = await get_user_by_email(db, email)
    if user is None or not user.active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def create_user(db: AsyncSession, data: schemas.UserCreate) -> User:
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role_id=data.role_id,
        site=data.site,
        active=data.active,
    )
    db.add(user)
    await db.commit()
    return user


async def update_user(
    db: AsyncSession, user_id: uuid.UUID, data: schemas.UserUpdate
) -> User | None:
    user = await db.get(User, user_id)
    if user is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    if "password" in payload and payload["password"]:
        user.password_hash = hash_password(payload.pop("password"))
    else:
        payload.pop("password", None)
    for field, value in payload.items():
        setattr(user, field, value)
    await db.commit()
    return user


async def list_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User).order_by(User.created_at))
    return list(result.scalars().all())


async def list_roles(db: AsyncSession) -> list[Role]:
    result = await db.execute(select(Role).order_by(Role.id))
    return list(result.scalars().all())


async def get_role_name(db: AsyncSession, role_id: int | None) -> str | None:
    if role_id is None:
        return None
    role = await db.get(Role, role_id)
    return role.name if role else None


async def ensure_default_admin(db: AsyncSession) -> None:
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none() is not None:
        return

    result = await db.execute(select(Role).where(Role.name == "junta"))
    junta = result.scalar_one_or_none()
    if junta is None:
        junta = Role(name="junta")
        db.add(junta)
        await db.commit()
        await db.refresh(junta)

    admin = User(
        email="admin@xama.local",
        password_hash=hash_password("admin1234"),
        full_name="Administrador XAMA",
        role_id=junta.id,
        site=None,
        active=True,
    )
    db.add(admin)
    await db.commit()

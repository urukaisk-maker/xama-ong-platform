from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.db.session import get_db
from app.modules.auth import schemas, service
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.users.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
async def login(
    payload: schemas.LoginRequest, db: AsyncSession = Depends(get_db)
):
    user = await service.authenticate(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = create_access_token(subject=str(user.id))
    return schemas.TokenResponse(access_token=token)


@router.get("/me", response_model=schemas.UserMe)
async def me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    role_name = await service.get_role_name(db, user.role_id)
    return schemas.UserMe(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        site=user.site,
        role_id=user.role_id,
        active=user.active,
        created_at=user.created_at,
        role_name=role_name,
    )


@router.post(
    "/register",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_role("junta")),
):
    existing = await service.get_user_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return await service.create_user(db, payload)

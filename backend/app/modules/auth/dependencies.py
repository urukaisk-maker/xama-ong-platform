import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.modules.auth import service
from app.modules.users.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
    except ValueError as e:
        raise credentials_error from e

    sub = payload.get("sub")
    if not sub:
        raise credentials_error

    try:
        user_id = uuid.UUID(sub)
    except ValueError as e:
        raise credentials_error from e

    user = await service.get_user_by_id(db, user_id)
    if user is None or not user.active:
        raise credentials_error
    return user


def require_role(*allowed_roles: str):
    async def checker(
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        role_name = await service.get_role_name(db, user.role_id)
        if role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requiere uno de los roles: {', '.join(allowed_roles)}",
            )
        return user

    return checker

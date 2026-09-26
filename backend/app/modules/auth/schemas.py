import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    email: str
    full_name: str
    site: str | None = None
    role_id: int | None = None
    active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=4)


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime


class UserMe(UserRead):
    role_name: str | None = None

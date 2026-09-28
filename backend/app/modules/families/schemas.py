import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


# ─── Family ───
class FamilyBase(BaseModel):
    reference_code: str = Field(..., min_length=1, max_length=50)
    address: str | None = None
    phone: str | None = None
    adults: int = Field(0, ge=0)
    minors: int = Field(0, ge=0)
    dietary_restrictions: str | None = None
    notes: str | None = None
    site: str = Field(..., pattern="^(reus|tarragona)$")
    active: bool = True


class FamilyCreate(FamilyBase):
    pass


class FamilyUpdate(BaseModel):
    address: str | None = None
    phone: str | None = None
    adults: int | None = Field(None, ge=0)
    minors: int | None = Field(None, ge=0)
    dietary_restrictions: str | None = None
    notes: str | None = None
    site: str | None = Field(None, pattern="^(reus|tarragona)$")
    active: bool | None = None


class FamilyRead(FamilyBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime


# ─── Delivery ───
class DeliveryBase(BaseModel):
    family_id: uuid.UUID
    delivery_date: date
    site: str = Field(..., pattern="^(reus|tarragona)$")
    volunteer_id: uuid.UUID | None = None
    notes: str | None = None


class DeliveryCreate(DeliveryBase):
    pass


class DeliveryUpdate(BaseModel):
    delivery_date: date | None = None
    site: str | None = Field(None, pattern="^(reus|tarragona)$")
    volunteer_id: uuid.UUID | None = None
    status: str | None = None
    notes: str | None = None


class DeliveryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    family_id: uuid.UUID
    delivery_date: date
    site: str
    volunteer_id: uuid.UUID | None
    status: str
    notes: str | None
    checked_in_at: datetime | None
    created_at: datetime


class DeliveryCheckIn(BaseModel):
    volunteer_id: uuid.UUID | None = None
    notes: str | None = None


class FamilySummary(BaseModel):
    total_families: int
    active_families: int
    reus_families: int
    tarragona_families: int
    total_people: int


# ─── Import CSV ───
class ImportRow(BaseModel):
    line: int
    reference_code: str
    status: str
    message: str | None = None
    data: dict | None = None


class ImportPreview(BaseModel):
    total_rows: int
    valid: int
    invalid: int
    duplicates: int
    imported: int
    errors: list[str]
    rows: list[ImportRow]

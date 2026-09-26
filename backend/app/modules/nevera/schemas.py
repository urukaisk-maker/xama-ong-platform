import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


# ─── Rations ───
class RationBase(BaseModel):
    date: date
    target_rations: int = Field(20, ge=0, le=500)
    served_rations: int = Field(0, ge=0, le=500)
    notes: str | None = None


class RationCreate(RationBase):
    pass


class RationUpdate(BaseModel):
    target_rations: int | None = Field(None, ge=0, le=500)
    served_rations: int | None = Field(None, ge=0, le=500)
    notes: str | None = None


class RationRead(RationBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime


class RationSummary(BaseModel):
    total_days: int
    total_served: int
    avg_served: float
    target_total: int
    compliance_pct: float


# ─── Derivations ───
class DerivationBase(BaseModel):
    reference_code: str = Field(..., min_length=1, max_length=50)
    person_name: str | None = None
    origin: str = Field(..., min_length=1, max_length=100)
    reason: str | None = None
    rations: int = Field(1, ge=1, le=50)
    notes: str | None = None


class DerivationCreate(DerivationBase):
    pass


class DerivationRead(DerivationBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    status: str
    served_at: datetime | None
    created_at: datetime

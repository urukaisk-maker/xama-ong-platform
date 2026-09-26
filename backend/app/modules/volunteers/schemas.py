import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field


VALID_ROLES = ("vehiculo", "clasificacion", "cestas", "puerta")


class ShiftBase(BaseModel):
    shift_date: date
    site: str = Field(..., pattern="^(reus|tarragona)$")
    role: str = Field(..., pattern="^(vehiculo|clasificacion|cestas|puerta)$")
    start_time: time
    end_time: time
    capacity: int = Field(1, ge=1, le=50)
    notes: str | None = None


class ShiftCreate(ShiftBase):
    pass


class ShiftUpdate(BaseModel):
    shift_date: date | None = None
    site: str | None = Field(None, pattern="^(reus|tarragona)$")
    role: str | None = Field(
        None, pattern="^(vehiculo|clasificacion|cestas|puerta)$"
    )
    start_time: time | None = None
    end_time: time | None = None
    capacity: int | None = Field(None, ge=1, le=50)
    notes: str | None = None


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    shift_id: uuid.UUID
    user_id: uuid.UUID
    hours: float | None
    attended: bool
    notes: str | None
    created_at: datetime


class ShiftRead(ShiftBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    assignments: list[AssignmentRead] = []


class AssignMe(BaseModel):
    user_id: uuid.UUID | None = None
    notes: str | None = None


class MarkAttendance(BaseModel):
    attended: bool
    hours: float | None = Field(None, ge=0, le=24)


class VolunteerHours(BaseModel):
    user_id: uuid.UUID
    full_name: str
    total_hours: float
    total_shifts: int
    shifts_attended: int


class HoursSummary(BaseModel):
    total_volunteers: int
    total_hours: float
    total_shifts_assigned: int
    ranking: list[VolunteerHours]

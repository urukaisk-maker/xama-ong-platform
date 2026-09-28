import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Site, VolunteerShiftRole


class ShiftBase(BaseModel):
    shift_date: date
    site: Site
    role: VolunteerShiftRole
    start_time: time
    end_time: time
    capacity: int = Field(1, ge=1, le=50)
    notes: str | None = None


class ShiftCreate(ShiftBase):
    pass


class ShiftUpdate(BaseModel):
    shift_date: date | None = None
    site: Site | None = None
    role: VolunteerShiftRole | None = None
    start_time: time | None = None
    end_time: time | None = None
    capacity: int | None = Field(None, ge=1, le=50)
    notes: str | None = None


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    shift_id: uuid.UUID
    user_id: uuid.UUID
    user_name: str | None = None
    user_email: str | None = None
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

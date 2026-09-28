import uuid
from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import DerivationStatus, ReferralSource


class NeveraRation(Base):
    __tablename__ = "nevera_rations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    target_rations: Mapped[int] = mapped_column(Integer, default=20)
    served_rations: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        CheckConstraint("target_rations >= 0", name="ck_nevera_target_pos"),
        CheckConstraint("served_rations >= 0", name="ck_nevera_served_pos"),
    )


class Derivation(Base):
    __tablename__ = "derivations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reference_code: Mapped[str] = mapped_column(String(50), unique=True)
    person_name: Mapped[str | None] = mapped_column(String(255))
    origin: Mapped[ReferralSource] = mapped_column(
        SAEnum(
            ReferralSource, native_enum=False, length=100, validate_strings=True
        ),
        nullable=False,
    )
    reason: Mapped[str | None] = mapped_column(Text)
    rations: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[DerivationStatus] = mapped_column(
        SAEnum(
            DerivationStatus, native_enum=False, length=20, validate_strings=True
        ),
        default=DerivationStatus.PENDIENTE,
        nullable=False,
    )
    served_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        CheckConstraint("rations >= 1", name="ck_derivations_rations_pos"),
        CheckConstraint(
            "origin IN ('servicios_sociales', 'policia_local', 'cruz_roja', 'otro')",
            name="ck_derivations_origin",
        ),
        CheckConstraint(
            "status IN ('pendiente', 'servida', 'cancelada')",
            name="ck_derivations_status",
        ),
    )

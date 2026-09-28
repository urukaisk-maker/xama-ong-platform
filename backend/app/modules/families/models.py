import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DeliveryStatus, Site


SITE_CHECK = "site IN ('reus', 'tarragona')"
STATUS_CHECK = "status IN ('pendiente', 'entregada', 'cancelada')"


class Family(Base):
    __tablename__ = "families"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reference_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(20))
    adults: Mapped[int] = mapped_column(Integer, default=0)
    minors: Mapped[int] = mapped_column(Integer, default=0)
    dietary_restrictions: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    site: Mapped[Site] = mapped_column(
        SAEnum(Site, native_enum=False, length=50, validate_strings=True),
        nullable=False,
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="family", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("adults >= 0", name="ck_families_adults_positive"),
        CheckConstraint("minors >= 0", name="ck_families_minors_positive"),
        CheckConstraint(SITE_CHECK, name="ck_families_site"),
    )


class Delivery(Base):
    __tablename__ = "deliveries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    family_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("families.id", ondelete="CASCADE")
    )
    delivery_date: Mapped[date] = mapped_column(Date, nullable=False)
    site: Mapped[Site] = mapped_column(
        SAEnum(Site, native_enum=False, length=50, validate_strings=True),
        nullable=False,
    )
    volunteer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    status: Mapped[DeliveryStatus] = mapped_column(
        SAEnum(DeliveryStatus, native_enum=False, length=20, validate_strings=True),
        default=DeliveryStatus.PENDIENTE,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text)
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    family: Mapped[Family] = relationship(back_populates="deliveries")

    __table_args__ = (
        CheckConstraint(SITE_CHECK, name="ck_deliveries_site"),
        CheckConstraint(STATUS_CHECK, name="ck_deliveries_status"),
    )

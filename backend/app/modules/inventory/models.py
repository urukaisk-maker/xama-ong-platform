import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import (
    BatchOrigin,
    BatchStatus,
    ProductCategory,
    ProductUnit,
)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[ProductCategory | None] = mapped_column(
        SAEnum(
            ProductCategory, native_enum=False, length=100, validate_strings=True
        ),
        nullable=True,
    )
    unit: Mapped[ProductUnit] = mapped_column(
        SAEnum(ProductUnit, native_enum=False, length=20, validate_strings=True),
        default=ProductUnit.KG,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    batches: Mapped[list["Batch"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE")
    )
    origin: Mapped[BatchOrigin] = mapped_column(
        SAEnum(BatchOrigin, native_enum=False, length=100, validate_strings=True),
        nullable=False,
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[BatchStatus] = mapped_column(
        SAEnum(BatchStatus, native_enum=False, length=20, validate_strings=True),
        default=BatchStatus.DISPONIBLE,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    product: Mapped[Product] = relationship(back_populates="batches")

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_batches_quantity_positive"),
    )

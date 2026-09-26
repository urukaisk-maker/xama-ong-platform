import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ─── Product ───
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str | None = None
    unit: str = "kg"


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


# ─── Batch ───
class BatchBase(BaseModel):
    product_id: uuid.UUID
    origin: str = Field(..., min_length=1, max_length=100)
    quantity: Decimal = Field(..., gt=0)
    expiry_date: date
    status: str = "disponible"


class BatchCreate(BatchBase):
    pass


class BatchRead(BatchBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class BatchConsume(BaseModel):
    quantity: Decimal = Field(..., gt=0)


# ─── Summary / KPIs ───
class InventorySummary(BaseModel):
    total_products: int
    total_batches: int
    total_quantity_kg: float
    expiring_soon_count: int
    expiring_soon_kg: float

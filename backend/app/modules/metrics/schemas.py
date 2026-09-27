from pydantic import BaseModel


class ImpactMetrics(BaseModel):
    # Inventario
    total_products: int
    total_batches: int
    total_kg_recovered: float
    expiring_soon_kg: float

    # Familias
    total_families: int
    active_families: int
    total_people: int
    reus_families: int
    tarragona_families: int

    # Entregas
    total_deliveries: int
    deliveries_done: int
    deliveries_pending: int

    # Nevera
    nevera_served: int
    nevera_target: int
    nevera_compliance_pct: float
    derivations_total: int
    derivations_served: int

    # Voluntariado
    total_volunteers: int
    total_volunteer_hours: float
    total_shifts: int

    # Impacto ambiental
    co2_avoided_kg: float

    # Metadata
    generated_at: str


class MonthlyPoint(BaseModel):
    month: int
    year: int
    kg_recovered: float
    deliveries: int
    nevera_served: int
    volunteer_hours: float


class MonthlySeries(BaseModel):
    year: int
    points: list[MonthlyPoint]


# ─── Analytics ───
class AnalyticsMonthlyPoint(BaseModel):
    month: int
    year: int
    kg_recovered: float
    deliveries: int
    nevera_served: int
    volunteer_hours: float


class AnalyticsSiteComparison(BaseModel):
    site: str
    families: int
    people: int
    deliveries_done: int
    deliveries_pending: int


class AnalyticsVolunteer(BaseModel):
    user_id: str
    full_name: str
    hours: float
    shifts: int


class AnalyticsDeliveryStatus(BaseModel):
    status: str
    count: int


class AnalyticsResponse(BaseModel):
    year: int
    monthly: list[AnalyticsMonthlyPoint]
    sites: list[AnalyticsSiteComparison]
    top_volunteers: list[AnalyticsVolunteer]
    delivery_status: list[AnalyticsDeliveryStatus]

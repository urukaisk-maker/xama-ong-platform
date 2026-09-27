from pydantic import BaseModel


class PublicStats(BaseModel):
    total_kg_recovered: float
    co2_avoided_kg: float
    nevera_served: int
    total_families: int
    total_people: int
    total_volunteers: int
    total_volunteer_hours: float
    active_families: int
    reus_families: int
    tarragona_families: int

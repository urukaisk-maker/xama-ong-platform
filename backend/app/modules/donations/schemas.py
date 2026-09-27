from datetime import date

from pydantic import BaseModel, Field


class DonationCertificateRequest(BaseModel):
    donor_name: str = Field(..., min_length=2, max_length=200)
    donor_tax_id: str = Field(..., min_length=5, max_length=20)  # DNI/NIE/CIF
    amount: float = Field(..., gt=0, le=100000)
    donation_date: date
    concept: str | None = Field(None, max_length=200)
    donor_address: str | None = Field(None, max_length=300)
    donor_email: str | None = Field(None, max_length=200)
    recurring: bool = False

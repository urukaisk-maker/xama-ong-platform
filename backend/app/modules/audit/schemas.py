from pydantic import BaseModel


class AuditEntry(BaseModel):
    id: str
    user_email: str | None
    action: str
    resource_type: str
    resource_id: str | None
    description: str | None
    created_at: str | None

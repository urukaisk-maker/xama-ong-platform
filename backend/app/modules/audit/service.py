import json
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.audit.models import AuditLog
from app.modules.users.models import User


async def log_action(
    db: AsyncSession,
    user: User | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    description: str | None = None,
    data_before: dict[str, Any] | None = None,
) -> None:
    """Registra una acción en el log de auditoría.

    No hace commit — se hace junto con la operación principal.
    """
    entry = AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        description=description,
        data_before=json.dumps(data_before, default=str) if data_before else None,
    )
    db.add(entry)

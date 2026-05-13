from datetime import UTC, datetime
from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def record_audit_log(
    db: Session,
    *,
    action: str,
    entity_type: str,
    actor_id: UUID | None = None,
    entity_id: UUID | None = None,
    metadata: dict[str, object] | None = None,
    request: Request | None = None,
) -> None:
    client_host = request.client.host if request is not None and request.client else None
    user_agent = request.headers.get("user-agent") if request is not None else None

    db.add(
        AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_json=metadata or {},
            ip_address=client_host,
            user_agent=user_agent,
            created_at=datetime.now(UTC),
        )
    )

from datetime import UTC, datetime
from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit import AuditLog

SENSITIVE_METADATA_KEYS = (
    "aadhaar",
    "authorization",
    "jwt",
    "otp",
    "password",
    "secret",
    "token",
)


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
            metadata_json=sanitize_audit_metadata(metadata or {}),
            ip_address=client_host,
            user_agent=user_agent,
            created_at=datetime.now(UTC),
        )
    )


def sanitize_audit_metadata(metadata: dict[str, object]) -> dict[str, object]:
    return {key: _sanitize_value(key, value) for key, value in metadata.items()}


def _sanitize_value(key: str, value: object) -> object:
    if _is_sensitive_key(key):
        return "[REDACTED]"

    if isinstance(value, dict):
        return {
            nested_key: _sanitize_value(nested_key, nested_value)
            for nested_key, nested_value in value.items()
        }

    if isinstance(value, list):
        return [_sanitize_value(key, item) for item in value]

    return value


def _is_sensitive_key(key: str) -> bool:
    normalized = key.lower().replace("-", "_")
    return any(marker in normalized for marker in SENSITIVE_METADATA_KEYS)

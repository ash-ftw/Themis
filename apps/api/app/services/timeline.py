from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.case import CaseTimelineEvent


def add_case_timeline_event(
    db: Session,
    *,
    case_id: UUID,
    actor_id: UUID | None,
    event_type: str,
    title: str,
    description: str | None = None,
    metadata: dict[str, object] | None = None,
) -> CaseTimelineEvent:
    event = CaseTimelineEvent(
        case_id=case_id,
        actor_id=actor_id,
        event_type=event_type,
        title=title,
        description=description,
        metadata_json=metadata or {},
        created_at=datetime.now(UTC),
    )
    db.add(event)
    return event

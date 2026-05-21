from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import NotificationChannel, NotificationStatus
from app.models.notification import Notification, NotificationPreference


def create_notification(
    db: Session,
    *,
    user_id: UUID,
    notification_type: str,
    title: str,
    message: str,
    idempotency_key: str,
    metadata: dict[str, object] | None = None,
    channel: NotificationChannel = NotificationChannel.IN_APP,
    deliver: bool = True,
) -> Notification:
    existing = db.scalar(
        select(Notification).where(Notification.idempotency_key == idempotency_key)
    )
    if existing is not None:
        return existing

    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        channel=channel,
        status=NotificationStatus.PENDING,
        idempotency_key=idempotency_key,
        metadata_json=metadata or {},
        created_at=datetime.now(UTC),
    )
    db.add(notification)
    db.flush()
    if deliver:
        notification.status = NotificationStatus.SENT
        notification.sent_at = datetime.now(UTC)
    return notification


def get_or_create_preferences(db: Session, user_id: UUID) -> NotificationPreference:
    preferences = db.scalar(
        select(NotificationPreference).where(NotificationPreference.user_id == user_id)
    )
    if preferences is not None:
        return preferences

    preferences = NotificationPreference(user_id=user_id)
    db.add(preferences)
    db.flush()
    return preferences


def mark_notification_read(db: Session, notification: Notification) -> Notification:
    if notification.read_at is None:
        notification.read_at = datetime.now(UTC)
    return notification


def notification_response_metadata(notification: Notification) -> dict[str, object]:
    return notification.metadata_json

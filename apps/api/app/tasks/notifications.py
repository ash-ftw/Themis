from datetime import UTC, datetime
from uuid import UUID

from app.core.database import SessionLocal
from app.models.enums import NotificationStatus
from app.models.notification import Notification
from app.tasks.celery_app import celery_app


@celery_app.task(name="notifications.deliver")
def deliver_notification(notification_id: str) -> dict[str, str]:
    try:
        notification_uuid = UUID(notification_id)
    except ValueError:
        return {"notification_id": notification_id, "status": "failed"}

    with SessionLocal() as db:
        notification = db.get(Notification, notification_uuid)
        if notification is None:
            return {"notification_id": notification_id, "status": "not_found"}

        notification.status = NotificationStatus.SENT
        notification.sent_at = datetime.now(UTC)
        db.commit()
        return {"notification_id": notification_id, "status": "sent"}

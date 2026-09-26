import smtplib
from email.message import EmailMessage
from datetime import UTC, datetime
from uuid import UUID

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.enums import NotificationStatus
from app.models.notification import Notification
from app.models.user import User
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

        recipient = db.get(User, notification.user_id)
        if recipient is not None and recipient.email:
            _send_email_via_smtp(
                recipient_email=recipient.email,
                subject=notification.title,
                body=notification.message,
            )

        notification.status = NotificationStatus.SENT
        notification.sent_at = datetime.now(UTC)
        db.commit()
        return {"notification_id": notification_id, "status": "sent"}


def _send_email_via_smtp(recipient_email: str, subject: str, body: str) -> bool:
    """Send email via local Mailpit / configured SMTP server."""
    settings = get_settings()
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.smtp_sender
        msg["To"] = recipient_email
        msg.set_content(body)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=2.0) as server:
            server.send_message(msg)
        return True
    except Exception:
        # Fallback gracefully if SMTP server is unavailable during local dev execution
        return False


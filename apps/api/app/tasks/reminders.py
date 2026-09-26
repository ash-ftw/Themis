from uuid import UUID
from app.core.database import SessionLocal
from app.models.case import Case, Hearing
from app.services.notifications import create_notification
from app.tasks.celery_app import celery_app


@celery_app.task(name="hearings.send_reminder")
def send_hearing_reminder(hearing_id: str, reminder_key: str) -> dict[str, str]:
    try:
        hearing_uuid = UUID(hearing_id)
    except ValueError:
        return {"hearing_id": hearing_id, "reminder_key": reminder_key, "status": "failed"}

    with SessionLocal() as db:
        hearing = db.get(Hearing, hearing_uuid)
        if hearing is None:
            return {"hearing_id": hearing_id, "reminder_key": reminder_key, "status": "not_found"}

        case = db.get(Case, hearing.case_id)
        if case is None:
            return {"hearing_id": hearing_id, "reminder_key": reminder_key, "status": "case_not_found"}

        # Create notification for citizen
        create_notification(
            db,
            user_id=case.citizen_id,
            notification_type="hearing.reminder",
            title=f"Hearing Reminder: {case.title}",
            message=f"Upcoming hearing scheduled on {hearing.hearing_date} at {hearing.court}.",
            idempotency_key=f"hearing:{hearing.id}:{reminder_key}:citizen",
            metadata={"hearing_id": str(hearing.id), "case_id": str(case.id)},
        )

        # If assigned lawyer exists, send notification to lawyer as well
        if case.lawyer_id is not None:
            create_notification(
                db,
                user_id=case.lawyer_id,
                notification_type="hearing.reminder",
                title=f"Hearing Reminder: {case.title}",
                message=f"Upcoming hearing scheduled on {hearing.hearing_date} at {hearing.court}.",
                idempotency_key=f"hearing:{hearing.id}:{reminder_key}:lawyer",
                metadata={"hearing_id": str(hearing.id), "case_id": str(case.id)},
            )

        hearing.reminder_status = "sent"
        db.commit()
        return {"hearing_id": hearing_id, "reminder_key": reminder_key, "status": "sent"}


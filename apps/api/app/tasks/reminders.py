from app.tasks.celery_app import celery_app


@celery_app.task(name="hearings.send_reminder")
def send_hearing_reminder(hearing_id: str, reminder_key: str) -> dict[str, str]:
    return {"hearing_id": hearing_id, "reminder_key": reminder_key, "status": "queued"}

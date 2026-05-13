from app.tasks.celery_app import celery_app


@celery_app.task(name="notifications.deliver")
def deliver_notification(notification_id: str) -> dict[str, str]:
    return {"notification_id": notification_id, "status": "queued"}

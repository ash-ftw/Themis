from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "themis",
    broker=settings.rabbitmq_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.document_ocr",
        "app.tasks.exports",
        "app.tasks.notifications",
        "app.tasks.reminders",
    ],
)

celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
    timezone="Asia/Kolkata",
)

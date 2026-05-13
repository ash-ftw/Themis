from app.tasks.celery_app import celery_app


@celery_app.task(name="exports.render_pdf")
def render_pdf_export(draft_id: str, draft_type: str) -> dict[str, str]:
    return {"draft_id": draft_id, "draft_type": draft_type, "status": "queued"}

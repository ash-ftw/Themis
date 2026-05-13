from app.tasks.celery_app import celery_app


@celery_app.task(name="documents.run_ocr")
def run_document_ocr(document_id: str) -> dict[str, str]:
    return {"document_id": document_id, "status": "queued"}

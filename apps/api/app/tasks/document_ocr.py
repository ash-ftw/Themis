from uuid import UUID

from app.core.database import SessionLocal
from app.models.document import Document
from app.models.enums import OcrStatus
from app.tasks.celery_app import celery_app


@celery_app.task(name="documents.run_ocr")
def run_document_ocr(document_id: str) -> dict[str, str]:
    try:
        document_uuid = UUID(document_id)
    except ValueError:
        return {"document_id": document_id, "status": "failed"}

    with SessionLocal() as db:
        document = db.get(Document, document_uuid)
        if document is None or document.deleted_at is not None:
            return {"document_id": document_id, "status": "not_found"}

        document.ocr_status = OcrStatus.PROCESSING
        db.commit()
        db.refresh(document)

        seed_text = document.metadata_json.get("extracted_text_seed")
        updated_metadata = dict(document.metadata_json)
        if isinstance(seed_text, str) and seed_text.strip():
            document.ocr_text = seed_text.strip()
            document.ocr_status = OcrStatus.COMPLETED
            updated_metadata.pop("ocr_error", None)
            status = "completed"
        else:
            document.ocr_status = OcrStatus.FAILED
            updated_metadata["ocr_error"] = (
                "No extractable text was available to the local OCR worker."
            )
            status = "failed"

        document.metadata_json = updated_metadata
        db.commit()
        return {"document_id": document_id, "status": status}

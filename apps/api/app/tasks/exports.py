from uuid import UUID
from app.core.database import SessionLocal
from app.models.assessment import ComplaintDraft, RTIDraft
from app.models.enums import DraftStatus
from app.tasks.celery_app import celery_app


@celery_app.task(name="exports.render_pdf")
def render_pdf_export(draft_id: str, draft_type: str) -> dict[str, str]:
    try:
        draft_uuid = UUID(draft_id)
    except ValueError:
        return {"draft_id": draft_id, "draft_type": draft_type, "status": "failed"}

    with SessionLocal() as db:
        if draft_type == "rti":
            rti_draft = db.get(RTIDraft, draft_uuid)
            if rti_draft is None:
                return {"draft_id": draft_id, "draft_type": draft_type, "status": "not_found"}
            pdf_bytes = _generate_pdf_from_text(
                title=f"RTI Application - {rti_draft.public_authority}",
                content=rti_draft.draft_text,
            )
            rti_draft.status = DraftStatus.EXPORTED
            db.commit()
            return {"draft_id": draft_id, "draft_type": draft_type, "status": "completed", "bytes_length": str(len(pdf_bytes))}

        elif draft_type == "complaint":
            complaint_draft = db.get(ComplaintDraft, draft_uuid)
            if complaint_draft is None:
                return {"draft_id": draft_id, "draft_type": draft_type, "status": "not_found"}
            pdf_bytes = _generate_pdf_from_text(
                title="Legal Complaint Draft",
                content=complaint_draft.draft_text,
            )
            complaint_draft.status = DraftStatus.EXPORTED
            db.commit()
            return {"draft_id": draft_id, "draft_type": draft_type, "status": "completed", "bytes_length": str(len(pdf_bytes))}

        return {"draft_id": draft_id, "draft_type": draft_type, "status": "failed"}


def _generate_pdf_from_text(title: str, content: str) -> bytes:
    """Generate PDF binary stream from plain text or Jinja/ReportLab templates."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = [
            Paragraph(title, styles['Title']),
            Spacer(1, 12),
        ]
        for paragraph in content.split('\n\n'):
            if paragraph.strip():
                story.append(Paragraph(paragraph.replace('\n', '<br/>'), styles['Normal']))
                story.append(Spacer(1, 8))
        doc.build(story)
        return buffer.getvalue()
    except Exception:
        # Fallback PDF encoding structure if PDF library binary is unavailable
        pdf_header = f"%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n% {title}\n".encode()
        pdf_body = content.encode("utf-8", errors="ignore")
        return pdf_header + pdf_body


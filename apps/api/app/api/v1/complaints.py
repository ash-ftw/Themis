from hashlib import sha256
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.assessments import (
    _assessment_response,
    _case_from_assessment,
    _get_owned_assessment,
)
from app.core.database import get_db
from app.core.security import AuthenticatedUser, require_roles
from app.domain.assessment_rules import build_complaint_draft
from app.models.assessment import AssessmentSession, ComplaintDraft
from app.models.case import Case
from app.models.document import Document
from app.models.enums import CaseStatus, DraftStatus, UserRole
from app.schemas.assessment import (
    CaseSummaryResponse,
    ComplaintDraftResponse,
    ComplaintDraftUpdateRequest,
    ComplaintExportResponse,
    ComplaintGenerateRequest,
    SaveAssessmentToCaseRequest,
)
from app.services.audit import record_audit_log
from app.services.timeline import add_case_timeline_event
from app.tasks.exports import render_pdf_export

router = APIRouter(prefix="/complaints", tags=["complaint drafts"])


@router.post(
    "/generate",
    response_model=ComplaintDraftResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def generate_complaint(
    payload: ComplaintGenerateRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> ComplaintDraftResponse:
    assessment: AssessmentSession | None = None
    assessment_result: dict[str, object] | None = None
    fields = payload.structured_fields.model_dump(exclude_none=True)

    if payload.assessment_id is not None:
        assessment = _get_owned_assessment(db, payload.assessment_id, citizen.id)
        assessment_response = _assessment_response(assessment)
        assessment_result = {
            "section_suggestions": [
                item.model_dump() for item in assessment_response.section_suggestions
            ],
            "evidence_checklist": [
                item.model_dump() for item in assessment_response.evidence_checklist
            ],
        }
        fields = _fields_from_assessment(assessment, fields, citizen.email, citizen.phone)

    draft_text = build_complaint_draft(fields=fields, assessment_result=assessment_result)
    draft = ComplaintDraft(
        user_id=citizen.id,
        case_id=assessment.case_id if assessment is not None else None,
        assessment_id=assessment.id if assessment is not None else None,
        draft_text=draft_text,
        structured_fields=fields,
        status=DraftStatus.DRAFT,
    )
    db.add(draft)
    db.flush()
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="complaint.generated",
        entity_type="complaint_draft",
        entity_id=draft.id,
        metadata={"assessment_id": str(assessment.id) if assessment is not None else None},
        request=request,
    )
    db.commit()
    db.refresh(draft)

    return ComplaintDraftResponse.model_validate(draft)


@router.get("/{draft_id}", response_model=ComplaintDraftResponse, response_model_by_alias=False)
def get_complaint_draft(
    draft_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
) -> ComplaintDraftResponse:
    return ComplaintDraftResponse.model_validate(_get_owned_draft(db, draft_id, citizen.id))


@router.patch("/{draft_id}", response_model=ComplaintDraftResponse, response_model_by_alias=False)
def update_complaint_draft(
    draft_id: UUID,
    payload: ComplaintDraftUpdateRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> ComplaintDraftResponse:
    draft = _get_owned_draft(db, draft_id, citizen.id)
    if payload.draft_text is not None:
        draft.draft_text = payload.draft_text
    if payload.structured_fields is not None:
        draft.structured_fields = payload.structured_fields.model_dump(exclude_none=True)

    db.flush()
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="complaint.updated",
        entity_type="complaint_draft",
        entity_id=draft.id,
        metadata={"status": draft.status.value},
        request=request,
    )
    db.commit()
    db.refresh(draft)

    return ComplaintDraftResponse.model_validate(draft)


@router.post(
    "/{draft_id}/export-pdf",
    response_model=ComplaintExportResponse,
    response_model_by_alias=False,
)
def export_complaint_pdf(
    draft_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> ComplaintExportResponse:
    draft = _get_owned_draft(db, draft_id, citizen.id)
    export = render_pdf_export(str(draft.id), "complaint")
    document = _document_for_draft(
        db,
        draft=draft,
        uploaded_by=citizen.id,
        object_key=f"exports/complaint_drafts/{draft.id}.pdf",
        mime_type="application/pdf",
        document_type="complaint_draft_pdf",
    )
    draft.pdf_document_id = document.id
    draft.status = DraftStatus.EXPORTED
    db.flush()
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="complaint.export_queued",
        entity_type="complaint_draft",
        entity_id=draft.id,
        metadata={"document_id": str(document.id), "export_status": export["status"]},
        request=request,
    )
    db.commit()
    db.refresh(draft)

    return ComplaintExportResponse(
        draft=ComplaintDraftResponse.model_validate(draft),
        document_id=document.id,
        status=export["status"],
        object_key=document.object_key,
    )


@router.post(
    "/{draft_id}/save-to-case",
    response_model=CaseSummaryResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def save_complaint_to_case(
    draft_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> CaseSummaryResponse:
    draft = _get_owned_draft(db, draft_id, citizen.id)
    case = _case_for_draft(db, draft, citizen.id)
    draft.case_id = case.id
    draft.status = DraftStatus.SAVED_TO_CASE
    case.status = CaseStatus.COMPLAINT_PREPARED
    _document_for_draft(
        db,
        draft=draft,
        uploaded_by=citizen.id,
        object_key=f"case_documents/complaint_drafts/{draft.id}.txt",
        mime_type="text/plain",
        document_type="complaint_draft",
    )
    db.flush()
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=citizen.id,
        event_type="complaint.saved_to_case",
        title="Complaint draft saved to case",
        metadata={"draft_id": str(draft.id)},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="complaint.saved_to_case",
        entity_type="case",
        entity_id=case.id,
        metadata={"draft_id": str(draft.id)},
        request=request,
    )
    db.commit()
    db.refresh(case)

    return CaseSummaryResponse(
        id=case.id,
        title=case.title,
        category=case.category,
        status=case.status.value,
        created_at=case.created_at,
    )


def _get_owned_draft(db: Session, draft_id: UUID, user_id: UUID) -> ComplaintDraft:
    draft = db.get(ComplaintDraft, draft_id)
    if draft is None or draft.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Complaint draft not found."
        )
    return draft


def _fields_from_assessment(
    assessment: AssessmentSession,
    fields: dict[str, Any],
    email: str,
    phone: str | None,
) -> dict[str, Any]:
    answers = assessment.answers
    merged = {
        "email": email,
        "phone": phone,
        "incident_date_time": answers.get("incident_date"),
        "incident_location": answers.get("incident_location"),
        "incident_description": answers.get("description"),
        "possible_sections": assessment.suggested_sections,
        "place": assessment.district or assessment.state,
    }
    merged.update({key: value for key, value in fields.items() if value not in (None, "", [])})
    return merged


def _case_for_draft(db: Session, draft: ComplaintDraft, user_id: UUID) -> Case:
    if draft.case_id is not None:
        existing_case = db.get(Case, draft.case_id)
        if existing_case is not None and existing_case.citizen_id == user_id:
            return existing_case

    assessment = db.get(AssessmentSession, draft.assessment_id) if draft.assessment_id else None
    if assessment is not None and assessment.user_id == user_id:
        case = _case_from_assessment(
            assessment,
            user_id,
            SaveAssessmentToCaseRequest(
                title="Complaint draft case",
                description=draft.draft_text[:1000],
            ),
        )
        db.add(case)
        db.flush()
        assessment.case_id = case.id
        return case

    fields = draft.structured_fields
    possible_sections = fields.get("possible_sections", [])
    case = Case(
        citizen_id=user_id,
        title=str(fields.get("authority_name") or "Complaint draft case"),
        category="complaint",
        state="Unknown",
        district=str(fields.get("place") or "Unknown"),
        sections=[str(item) for item in possible_sections]
        if isinstance(possible_sections, list)
        else [],
        description=draft.draft_text[:1000],
        metadata_json={"complaint_draft_id": str(draft.id)},
    )
    db.add(case)
    db.flush()
    return case


def _document_for_draft(
    db: Session,
    *,
    draft: ComplaintDraft,
    uploaded_by: UUID,
    object_key: str,
    mime_type: str,
    document_type: str,
) -> Document:
    document = db.scalar(select(Document).where(Document.object_key == object_key))
    if document is not None:
        return document

    encoded = draft.draft_text.encode()
    document = Document(
        case_id=draft.case_id,
        uploaded_by=uploaded_by,
        original_file_name=f"{document_type}-{draft.id}",
        object_key=object_key,
        mime_type=mime_type,
        file_size=len(encoded),
        file_hash=sha256(encoded).hexdigest(),
        document_type=document_type,
        metadata_json={"complaint_draft_id": str(draft.id)},
    )
    db.add(document)
    db.flush()
    return document

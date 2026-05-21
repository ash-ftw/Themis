from hashlib import sha256
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.api.v1.cases import get_owned_case
from app.core.database import get_db
from app.core.security import AuthenticatedUser, require_roles
from app.domain.rti_generator import RTIDraftInput, build_rti_draft
from app.models.assessment import RTIDraft
from app.models.case import Case
from app.models.document import Document
from app.models.enums import CaseStatus, CaseUrgency, DraftStatus, UserRole
from app.schemas.assessment import CaseSummaryResponse
from app.schemas.rti import (
    RTIDraftResponse,
    RTIExportResponse,
    RTIGenerateRequest,
    RTIListResponse,
    RTISaveToCaseRequest,
    RTISaveToCaseResponse,
    RTIUpdateRequest,
)
from app.services.audit import record_audit_log
from app.services.notifications import create_notification
from app.services.timeline import add_case_timeline_event
from app.tasks.exports import render_pdf_export

router = APIRouter(prefix="/rti", tags=["rti drafts"])


@router.post(
    "/generate",
    response_model=RTIDraftResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def generate_rti(
    payload: RTIGenerateRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> RTIDraftResponse:
    if payload.case_id is not None:
        get_owned_case(db, payload.case_id, citizen.id)

    structured_fields = payload.model_dump(exclude_none=True)
    draft_text = build_rti_draft(_draft_input(payload))
    draft = RTIDraft(
        user_id=citizen.id,
        case_id=payload.case_id,
        public_authority=payload.public_authority,
        department=payload.department,
        information_requested=payload.information_requested,
        time_period=payload.time_period,
        preferred_response_format=payload.preferred_response_format,
        bpl_status=payload.bpl_status,
        draft_text=draft_text,
        structured_fields=structured_fields,
        status=DraftStatus.DRAFT,
    )
    db.add(draft)
    db.flush()
    create_notification(
        db,
        user_id=citizen.id,
        notification_type="rti.generated",
        title="RTI draft generated",
        message=f"Your RTI draft for {draft.public_authority} is ready to review.",
        idempotency_key=f"rti:{draft.id}:generated",
        metadata={"draft_id": str(draft.id)},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="rti.generated",
        entity_type="rti_draft",
        entity_id=draft.id,
        metadata={"case_id": str(payload.case_id) if payload.case_id is not None else None},
        request=request,
    )
    db.commit()
    db.refresh(draft)
    return RTIDraftResponse.model_validate(draft)


@router.get("", response_model=RTIListResponse, response_model_by_alias=False)
def list_rti_drafts(
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> RTIListResponse:
    stmt = select(RTIDraft).where(RTIDraft.user_id == citizen.id)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    drafts = db.scalars(stmt.order_by(desc(RTIDraft.created_at)).limit(limit).offset(offset)).all()
    return RTIListResponse(
        total=total,
        drafts=[RTIDraftResponse.model_validate(item) for item in drafts],
    )


@router.get("/{draft_id}", response_model=RTIDraftResponse, response_model_by_alias=False)
def get_rti_draft(
    draft_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
) -> RTIDraftResponse:
    return RTIDraftResponse.model_validate(_get_owned_rti_draft(db, draft_id, citizen.id))


@router.patch("/{draft_id}", response_model=RTIDraftResponse, response_model_by_alias=False)
def update_rti_draft(
    draft_id: UUID,
    payload: RTIUpdateRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> RTIDraftResponse:
    draft = _get_owned_rti_draft(db, draft_id, citizen.id)
    update_data = payload.model_dump(exclude_unset=True)
    structured_fields = update_data.pop("structured_fields", None)
    for key, value in update_data.items():
        setattr(draft, key, value)
    if structured_fields is not None:
        draft.structured_fields = structured_fields
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="rti.updated",
        entity_type="rti_draft",
        entity_id=draft.id,
        metadata={"fields": sorted(payload.model_dump(exclude_unset=True).keys())},
        request=request,
    )
    db.commit()
    db.refresh(draft)
    return RTIDraftResponse.model_validate(draft)


@router.post(
    "/{draft_id}/export-pdf",
    response_model=RTIExportResponse,
    response_model_by_alias=False,
)
def export_rti_pdf(
    draft_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> RTIExportResponse:
    draft = _get_owned_rti_draft(db, draft_id, citizen.id)
    export = render_pdf_export(str(draft.id), "rti")
    document = _document_for_rti(
        db,
        draft=draft,
        uploaded_by=citizen.id,
        object_key=f"exports/rti_drafts/{draft.id}.pdf",
        mime_type="application/pdf",
        document_type="rti_draft_pdf",
    )
    draft.pdf_document_id = document.id
    draft.status = DraftStatus.EXPORTED
    create_notification(
        db,
        user_id=citizen.id,
        notification_type="rti.export_queued",
        title="RTI export queued",
        message=f"PDF export was queued for {draft.public_authority}.",
        idempotency_key=f"rti:{draft.id}:export",
        metadata={"draft_id": str(draft.id), "document_id": str(document.id)},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="rti.export_queued",
        entity_type="rti_draft",
        entity_id=draft.id,
        metadata={"document_id": str(document.id), "export_status": export["status"]},
        request=request,
    )
    db.commit()
    db.refresh(draft)
    return RTIExportResponse(
        draft=RTIDraftResponse.model_validate(draft),
        document_id=document.id,
        status=export["status"],
        object_key=document.object_key,
    )


@router.post(
    "/{draft_id}/save-to-case",
    response_model=RTISaveToCaseResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def save_rti_to_case(
    draft_id: UUID,
    payload: RTISaveToCaseRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> RTISaveToCaseResponse:
    draft = _get_owned_rti_draft(db, draft_id, citizen.id)
    case = _case_for_rti(db, draft, citizen.id, payload)
    draft.case_id = case.id
    draft.status = DraftStatus.SAVED_TO_CASE
    document = _document_for_rti(
        db,
        draft=draft,
        uploaded_by=citizen.id,
        object_key=f"case_documents/rti_drafts/{draft.id}.txt",
        mime_type="text/plain",
        document_type="rti_application",
    )
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=citizen.id,
        event_type="rti.saved_to_case",
        title="RTI draft saved to case",
        metadata={"draft_id": str(draft.id), "document_id": str(document.id)},
    )
    create_notification(
        db,
        user_id=citizen.id,
        notification_type="rti.saved_to_case",
        title="RTI saved to case",
        message=f"RTI draft for {draft.public_authority} was saved to {case.title}.",
        idempotency_key=f"rti:{draft.id}:saved_to_case",
        metadata={"draft_id": str(draft.id), "case_id": str(case.id)},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="rti.saved_to_case",
        entity_type="case",
        entity_id=case.id,
        metadata={"draft_id": str(draft.id), "document_id": str(document.id)},
        request=request,
    )
    db.commit()
    db.refresh(case)
    return RTISaveToCaseResponse(
        case=CaseSummaryResponse(
            id=case.id,
            title=case.title,
            category=case.category,
            status=case.status.value,
            created_at=case.created_at,
        ),
        document_id=document.id,
    )


def _get_owned_rti_draft(db: Session, draft_id: UUID, user_id: UUID) -> RTIDraft:
    draft = db.get(RTIDraft, draft_id)
    if draft is None or draft.user_id != user_id:
        raise HTTPException(status_code=404, detail="RTI draft not found.")
    return draft


def _draft_input(payload: RTIGenerateRequest) -> RTIDraftInput:
    return RTIDraftInput(
        public_authority=payload.public_authority,
        department=payload.department,
        information_requested=payload.information_requested,
        time_period=payload.time_period,
        preferred_response_format=payload.preferred_response_format,
        bpl_status=payload.bpl_status,
        applicant_name=payload.applicant_name,
        applicant_address=payload.applicant_address,
    )


def _case_for_rti(
    db: Session,
    draft: RTIDraft,
    user_id: UUID,
    payload: RTISaveToCaseRequest,
) -> Case:
    if payload.case_id is not None:
        return get_owned_case(db, payload.case_id, user_id)
    if draft.case_id is not None:
        return get_owned_case(db, draft.case_id, user_id)

    case = Case(
        citizen_id=user_id,
        title=payload.title or f"RTI application - {draft.public_authority}",
        category="rti_request",
        state="Unknown",
        district="Unknown",
        urgency=CaseUrgency.LOW,
        status=CaseStatus.COMPLAINT_PREPARED,
        sections=["Right to Information Act, 2005"],
        description=payload.description or draft.draft_text[:1000],
        metadata_json={"rti_draft_id": str(draft.id)},
    )
    db.add(case)
    db.flush()
    return case


def _document_for_rti(
    db: Session,
    *,
    draft: RTIDraft,
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
        metadata_json={"rti_draft_id": str(draft.id)},
    )
    db.add(document)
    db.flush()
    return document

import re
from datetime import UTC, datetime
from pathlib import PurePath
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.api.v1.cases import case_access_level
from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.core.object_storage import presign_object_url
from app.core.security import AuthenticatedUser, get_current_user, require_role
from app.models.case import Case
from app.models.document import Document
from app.models.enums import DocumentAccessLevel, MalwareScanStatus, OcrStatus, UserRole
from app.schemas.document import (
    DocumentCompleteUploadRequest,
    DocumentDownloadUrlResponse,
    DocumentListResponse,
    DocumentOcrResponse,
    DocumentPresignUploadRequest,
    DocumentPresignUploadResponse,
    DocumentResponse,
    DocumentUploadMetadata,
)
from app.services.audit import record_audit_log
from app.services.timeline import add_case_timeline_event
from app.tasks.document_ocr import run_document_ocr

documents_router = APIRouter(prefix="/documents", tags=["documents"])
case_documents_router = APIRouter(prefix="/cases", tags=["case documents"])

ALLOWED_MIME_TYPES = {
    "application/msword",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
}
FILE_HASH_PATTERN = re.compile(r"^[a-fA-F0-9]{64,128}$")


@documents_router.post(
    "/presign-upload",
    response_model=DocumentPresignUploadResponse,
    response_model_by_alias=False,
)
def presign_upload(
    payload: DocumentPresignUploadRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
    request: Request,
) -> DocumentPresignUploadResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER, UserRole.ADMIN})
    validate_document_upload_metadata(payload, settings)
    _case_for_upload(db, payload.case_id, current_user)
    object_key = build_upload_object_key(payload, current_user.id)
    presigned = presign_object_url(
        settings=settings,
        method="PUT",
        object_key=object_key,
    )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="document.upload_presigned",
        entity_type="document",
        metadata={
            "case_id": str(payload.case_id) if payload.case_id is not None else None,
            "object_key": object_key,
            "mime_type": payload.mime_type,
            "file_size": payload.file_size,
        },
        request=request,
    )
    db.commit()
    return DocumentPresignUploadResponse(
        upload_url=presigned.url,
        method="PUT",
        object_key=object_key,
        expires_at=presigned.expires_at,
        headers={"Content-Type": payload.mime_type},
        max_file_size=settings.document_max_file_size_bytes,
    )


@documents_router.post(
    "/complete-upload",
    response_model=DocumentResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def complete_upload(
    payload: DocumentCompleteUploadRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
    request: Request,
) -> DocumentResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER, UserRole.ADMIN})
    validate_document_upload_metadata(payload, settings)
    case = _case_for_upload(db, payload.case_id, current_user)
    _validate_object_key(payload.object_key, current_user.id)

    existing = db.scalar(select(Document).where(Document.object_key == payload.object_key))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Document object already exists.")

    metadata = dict(payload.metadata)
    if payload.extracted_text:
        metadata["extracted_text_seed"] = payload.extracted_text

    document = Document(
        case_id=payload.case_id,
        uploaded_by=current_user.id,
        original_file_name=payload.original_file_name,
        object_key=payload.object_key,
        mime_type=payload.mime_type,
        file_size=payload.file_size,
        file_hash=payload.file_hash.lower(),
        document_type=payload.document_type,
        ocr_status=OcrStatus.NOT_STARTED,
        access_level=payload.access_level,
        malware_scan_status=MalwareScanStatus.NOT_SCANNED,
        metadata_json=metadata,
    )
    db.add(document)
    db.flush()
    if case is not None:
        add_case_timeline_event(
            db,
            case_id=case.id,
            actor_id=current_user.id,
            event_type="document.uploaded",
            title="Document uploaded",
            description=payload.original_file_name,
            metadata={"document_id": str(document.id), "document_type": document.document_type},
        )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="document.upload_completed",
        entity_type="document",
        entity_id=document.id,
        metadata={
            "case_id": str(payload.case_id) if payload.case_id is not None else None,
            "object_key": payload.object_key,
            "mime_type": payload.mime_type,
            "file_size": payload.file_size,
        },
        request=request,
    )
    db.commit()
    run_document_ocr(str(document.id))
    db.refresh(document)
    return document_response(document)


@case_documents_router.get(
    "/{case_id}/documents",
    response_model=DocumentListResponse,
    response_model_by_alias=False,
)
def list_case_documents(
    case_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DocumentListResponse:
    case = _get_case_for_document_access(db, case_id, current_user)
    stmt = select(Document).where(Document.case_id == case.id, Document.deleted_at.is_(None))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    documents = db.scalars(stmt.order_by(desc(Document.created_at))).all()
    accessible_documents = [
        document_response(document)
        for document in documents
        if can_access_document(document, case, current_user)
    ]
    return DocumentListResponse(
        case_id=case.id,
        total=total,
        documents=accessible_documents,
    )


@documents_router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    response_model_by_alias=False,
)
def get_document(
    document_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> DocumentResponse:
    document, _case = _get_accessible_document(db, document_id, current_user)
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="document.viewed",
        entity_type="document",
        entity_id=document.id,
        metadata={"case_id": str(document.case_id) if document.case_id is not None else None},
        request=request,
    )
    db.commit()
    return document_response(document)


@documents_router.get(
    "/{document_id}/download-url",
    response_model=DocumentDownloadUrlResponse,
    response_model_by_alias=False,
)
def get_download_url(
    document_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
    request: Request,
) -> DocumentDownloadUrlResponse:
    document, _case = _get_accessible_document(db, document_id, current_user)
    presigned = presign_object_url(settings=settings, method="GET", object_key=document.object_key)
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="document.download_url_issued",
        entity_type="document",
        entity_id=document.id,
        metadata={"object_key": document.object_key},
        request=request,
    )
    db.commit()
    return DocumentDownloadUrlResponse(
        document_id=document.id,
        download_url=presigned.url,
        method="GET",
        expires_at=presigned.expires_at,
    )


@documents_router.post(
    "/{document_id}/ocr",
    response_model=DocumentOcrResponse,
    response_model_by_alias=False,
)
def request_ocr(
    document_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> DocumentOcrResponse:
    document, _case = _get_accessible_document(db, document_id, current_user)
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="document.ocr_requested",
        entity_type="document",
        entity_id=document.id,
        metadata={},
        request=request,
    )
    db.commit()
    result = run_document_ocr(str(document.id))
    db.refresh(document)
    return DocumentOcrResponse(document=document_response(document), status=result["status"])


@documents_router.delete(
    "/{document_id}",
    response_model=DocumentResponse,
    response_model_by_alias=False,
)
def delete_document(
    document_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> DocumentResponse:
    document, case = _get_accessible_document(db, document_id, current_user)
    if not _can_delete_document(document, case, current_user):
        raise HTTPException(status_code=403, detail="User cannot delete this document.")

    document.deleted_at = datetime.now(UTC)
    if case is not None:
        add_case_timeline_event(
            db,
            case_id=case.id,
            actor_id=current_user.id,
            event_type="document.deleted",
            title="Document deleted",
            description=document.original_file_name,
            metadata={"document_id": str(document.id)},
        )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="document.deleted",
        entity_type="document",
        entity_id=document.id,
        metadata={"case_id": str(document.case_id) if document.case_id is not None else None},
        request=request,
    )
    db.commit()
    db.refresh(document)
    return document_response(document)


def validate_document_upload_metadata(payload: DocumentUploadMetadata, settings: Settings) -> None:
    if payload.mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported document MIME type.")
    if payload.file_size > settings.document_max_file_size_bytes:
        raise HTTPException(status_code=400, detail="Document exceeds maximum upload size.")
    if FILE_HASH_PATTERN.fullmatch(payload.file_hash) is None:
        raise HTTPException(status_code=400, detail="Document hash must be hex encoded.")


def build_upload_object_key(payload: DocumentUploadMetadata, user_id: UUID) -> str:
    safe_name = _safe_file_name(payload.original_file_name)
    date_path = datetime.now(UTC).strftime("%Y/%m/%d")
    case_segment = str(payload.case_id) if payload.case_id is not None else "unassigned"
    return (
        f"documents/{user_id}/{case_segment}/{date_path}/"
        f"{payload.file_hash.lower()[:16]}-{safe_name}"
    )


def can_access_document(
    document: Document,
    case: Case | None,
    user: AuthenticatedUser,
) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    if document.uploaded_by == user.id:
        return True
    if document.access_level == DocumentAccessLevel.ADMIN_REVIEW:
        return False
    if case is None:
        return False
    if document.access_level == DocumentAccessLevel.LAWYER_PRIVATE:
        return user.role == UserRole.LAWYER and case.lawyer_id == user.id
    return case_access_level(case, user) is not None


def document_response(document: Document) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        case_id=document.case_id,
        uploaded_by=document.uploaded_by,
        original_file_name=document.original_file_name,
        object_key=document.object_key,
        mime_type=document.mime_type,
        file_size=document.file_size,
        file_hash=document.file_hash,
        document_type=document.document_type,
        ocr_status=document.ocr_status,
        ocr_text=document.ocr_text,
        access_level=document.access_level,
        malware_scan_status=document.malware_scan_status,
        metadata=document.metadata_json,
        deleted_at=document.deleted_at,
        created_at=document.created_at,
        updated_at=document.updated_at,
    )


def _get_accessible_document(
    db: Session,
    document_id: UUID,
    user: AuthenticatedUser,
) -> tuple[Document, Case | None]:
    document = db.get(Document, document_id)
    if document is None or document.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Document not found.")
    case = db.get(Case, document.case_id) if document.case_id is not None else None
    if not can_access_document(document, case, user):
        raise HTTPException(status_code=404, detail="Document not found.")
    return document, case


def _case_for_upload(db: Session, case_id: UUID | None, user: AuthenticatedUser) -> Case | None:
    if case_id is None:
        return None
    return _get_case_for_document_access(db, case_id, user)


def _get_case_for_document_access(db: Session, case_id: UUID, user: AuthenticatedUser) -> Case:
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found.")
    if user.role != UserRole.ADMIN and case_access_level(case, user) is None:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


def _validate_object_key(object_key: str, user_id: UUID) -> None:
    expected_prefix = f"documents/{user_id}/"
    if not object_key.startswith(expected_prefix):
        raise HTTPException(status_code=400, detail="Upload object key is not valid.")


def _can_delete_document(
    document: Document,
    case: Case | None,
    user: AuthenticatedUser,
) -> bool:
    if user.role == UserRole.ADMIN or document.uploaded_by == user.id:
        return True
    return user.role == UserRole.CITIZEN and case is not None and case.citizen_id == user.id


def _safe_file_name(file_name: str) -> str:
    name = PurePath(file_name).name.strip()
    safe = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip(".-")
    return safe[:120] or "document"

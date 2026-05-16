from uuid import UUID

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.v1.documents import (
    build_upload_object_key,
    can_access_document,
    validate_document_upload_metadata,
)
from app.core.config import Settings
from app.core.security import AuthenticatedUser
from app.main import app
from app.models.case import Case
from app.models.document import Document
from app.models.enums import (
    CaseStatus,
    CaseUrgency,
    DocumentAccessLevel,
    MalwareScanStatus,
    OcrStatus,
    UserRole,
)
from app.schemas.document import DocumentUploadMetadata

OWNER_ID = UUID("00000000-0000-0000-0000-000000000001")
LAWYER_ID = UUID("00000000-0000-0000-0000-000000000002")
OTHER_ID = UUID("00000000-0000-0000-0000-000000000003")
CASE_ID = UUID("00000000-0000-0000-0000-000000000010")
FILE_HASH = "a" * 64


def test_document_routes_reject_missing_auth() -> None:
    client = TestClient(app)
    document_id = "00000000-0000-0000-0000-000000000020"

    assert client.post("/api/v1/documents/presign-upload", json={}).status_code == 401
    assert client.post("/api/v1/documents/complete-upload", json={}).status_code == 401
    assert client.get(f"/api/v1/documents/{document_id}").status_code == 401
    assert client.get(f"/api/v1/documents/{document_id}/download-url").status_code == 401
    assert client.post(f"/api/v1/documents/{document_id}/ocr").status_code == 401
    assert client.get(f"/api/v1/cases/{CASE_ID}/documents").status_code == 401


def test_document_metadata_validation_allows_supported_file() -> None:
    validate_document_upload_metadata(_metadata(), Settings(document_max_file_size_bytes=100))


def test_document_metadata_validation_rejects_unsupported_mime() -> None:
    payload = _metadata(mime_type="application/x-msdownload")

    with pytest.raises(HTTPException):
        validate_document_upload_metadata(payload, Settings(document_max_file_size_bytes=100))


def test_document_metadata_validation_rejects_oversized_file() -> None:
    payload = _metadata(file_size=101)

    with pytest.raises(HTTPException):
        validate_document_upload_metadata(payload, Settings(document_max_file_size_bytes=100))


def test_upload_object_key_is_scoped_to_user_and_sanitized() -> None:
    key = build_upload_object_key(_metadata(original_file_name="../Court Notice.pdf"), OWNER_ID)

    assert key.startswith(f"documents/{OWNER_ID}/{CASE_ID}/")
    assert key.endswith("-Court-Notice.pdf")


def test_document_access_allows_case_owner_assigned_lawyer_and_admin() -> None:
    case = _case()
    document = _document()

    assert can_access_document(document, case, _user(OWNER_ID, UserRole.CITIZEN))
    assert can_access_document(document, case, _user(LAWYER_ID, UserRole.LAWYER))
    assert can_access_document(document, case, _user(OTHER_ID, UserRole.ADMIN))


def test_document_access_blocks_unrelated_user() -> None:
    assert not can_access_document(
        _document(),
        _case(),
        _user(OTHER_ID, UserRole.CITIZEN),
    )


def test_lawyer_private_document_blocks_case_owner() -> None:
    document = _document(access_level=DocumentAccessLevel.LAWYER_PRIVATE, uploaded_by=LAWYER_ID)

    assert not can_access_document(document, _case(), _user(OWNER_ID, UserRole.CITIZEN))
    assert can_access_document(document, _case(), _user(LAWYER_ID, UserRole.LAWYER))


def _metadata(
    *,
    original_file_name: str = "fir-copy.pdf",
    mime_type: str = "application/pdf",
    file_size: int = 10,
) -> DocumentUploadMetadata:
    return DocumentUploadMetadata(
        case_id=CASE_ID,
        original_file_name=original_file_name,
        mime_type=mime_type,
        file_size=file_size,
        file_hash=FILE_HASH,
        document_type="evidence",
    )


def _case() -> Case:
    return Case(
        id=CASE_ID,
        citizen_id=OWNER_ID,
        lawyer_id=LAWYER_ID,
        title="Consumer refund",
        category="consumer_complaint",
        state="Maharashtra",
        district="Mumbai",
        urgency=CaseUrgency.MEDIUM,
        status=CaseStatus.LAWYER_ASSIGNED,
        sections=[],
        description="Refund dispute",
        metadata_json={},
    )


def _document(
    *,
    access_level: DocumentAccessLevel = DocumentAccessLevel.CASE_PRIVATE,
    uploaded_by: UUID = OWNER_ID,
) -> Document:
    return Document(
        case_id=CASE_ID,
        uploaded_by=uploaded_by,
        original_file_name="fir-copy.pdf",
        object_key=f"documents/{uploaded_by}/{CASE_ID}/fir-copy.pdf",
        mime_type="application/pdf",
        file_size=10,
        file_hash=FILE_HASH,
        document_type="evidence",
        ocr_status=OcrStatus.NOT_STARTED,
        access_level=access_level,
        malware_scan_status=MalwareScanStatus.NOT_SCANNED,
        metadata_json={},
    )


def _user(user_id: UUID, role: UserRole) -> AuthenticatedUser:
    return AuthenticatedUser(
        id=user_id,
        external_auth_id=f"external-{user_id}",
        email=f"{user_id}@example.test",
        role=role,
        is_active=True,
        is_verified=True,
    )

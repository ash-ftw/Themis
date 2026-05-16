from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import DocumentAccessLevel, MalwareScanStatus, OcrStatus


class DocumentUploadMetadata(BaseModel):
    case_id: UUID | None = None
    original_file_name: str = Field(min_length=1, max_length=255)
    mime_type: str = Field(min_length=1, max_length=120)
    file_size: int = Field(gt=0)
    file_hash: str = Field(min_length=64, max_length=128)
    document_type: str = Field(min_length=1, max_length=100)
    access_level: DocumentAccessLevel = DocumentAccessLevel.CASE_PRIVATE
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentPresignUploadRequest(DocumentUploadMetadata):
    pass


class DocumentCompleteUploadRequest(DocumentUploadMetadata):
    object_key: str = Field(min_length=1, max_length=512)
    extracted_text: str | None = Field(default=None, max_length=50_000)


class DocumentResponse(BaseModel):
    id: UUID
    case_id: UUID | None
    uploaded_by: UUID
    original_file_name: str
    object_key: str
    mime_type: str
    file_size: int
    file_hash: str
    document_type: str
    ocr_status: OcrStatus
    ocr_text: str | None
    access_level: DocumentAccessLevel
    malware_scan_status: MalwareScanStatus
    metadata: dict[str, Any]
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime


class DocumentPresignUploadResponse(BaseModel):
    upload_url: str
    method: str
    object_key: str
    expires_at: datetime
    headers: dict[str, str]
    max_file_size: int


class DocumentDownloadUrlResponse(BaseModel):
    document_id: UUID
    download_url: str
    method: str
    expires_at: datetime


class DocumentListResponse(BaseModel):
    case_id: UUID
    total: int
    documents: list[DocumentResponse]


class DocumentOcrResponse(BaseModel):
    document: DocumentResponse
    status: str

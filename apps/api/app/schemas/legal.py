from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import LawReviewStatus


class LawSectionBase(BaseModel):
    act_name: str = Field(min_length=1, max_length=180)
    section_number: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=240)
    original_text: str | None = None
    plain_language: str = Field(min_length=1)
    example_scenarios: list[str] = Field(default_factory=list)
    punishment: str | None = None
    is_bailable: bool | None = None
    is_cognizable: bool | None = None
    ipc_mapping: str | None = Field(default=None, max_length=80)
    related_sections: list[str] = Field(default_factory=list)
    category_tags: list[str] = Field(default_factory=list)
    jurisdiction_notes: str | None = None
    source_reference: str | None = None
    review_status: LawReviewStatus = LawReviewStatus.DRAFT


class LawSectionCreate(LawSectionBase):
    pass


class LawSectionUpdate(BaseModel):
    act_name: str | None = Field(default=None, min_length=1, max_length=180)
    section_number: str | None = Field(default=None, min_length=1, max_length=80)
    title: str | None = Field(default=None, min_length=1, max_length=240)
    original_text: str | None = None
    plain_language: str | None = Field(default=None, min_length=1)
    example_scenarios: list[str] | None = None
    punishment: str | None = None
    is_bailable: bool | None = None
    is_cognizable: bool | None = None
    ipc_mapping: str | None = Field(default=None, max_length=80)
    related_sections: list[str] | None = None
    category_tags: list[str] | None = None
    jurisdiction_notes: str | None = None
    source_reference: str | None = None
    review_status: LawReviewStatus | None = None


class LawSectionResponse(LawSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    last_reviewed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class LawSearchResult(BaseModel):
    law_section: LawSectionResponse
    rank: float | None = None


class LawSearchResponse(BaseModel):
    query: str | None
    total: int
    limit: int
    offset: int
    results: list[LawSearchResult]


class BookmarkResponse(BaseModel):
    id: UUID
    law_section_id: UUID
    created_at: datetime


class LegalSeedItem(LawSectionBase):
    metadata: dict[str, Any] = Field(default_factory=dict)

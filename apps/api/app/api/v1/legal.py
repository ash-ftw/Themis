from datetime import UTC, datetime
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import Select, desc, func, or_, select, update
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.core.database import get_db
from app.core.security import AuthenticatedUser, get_current_user, require_roles
from app.models.enums import LawReviewStatus, UserRole
from app.models.legal import Bookmark, LawSection
from app.schemas.legal import (
    BookmarkResponse,
    LawSearchResponse,
    LawSearchResult,
    LawSectionCreate,
    LawSectionResponse,
    LawSectionUpdate,
)
from app.services.audit import record_audit_log

router = APIRouter(prefix="/laws", tags=["legal knowledge"])
admin_router = APIRouter(prefix="/admin/laws", tags=["admin legal content"])


@router.get("/search", response_model=LawSearchResponse, response_model_by_alias=False)
def search_laws(
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    q: Annotated[str | None, Query(min_length=1, max_length=160)] = None,
    act_name: Annotated[str | None, Query(max_length=180)] = None,
    section_number: Annotated[str | None, Query(max_length=80)] = None,
    category: Annotated[str | None, Query(max_length=80)] = None,
    is_bailable: bool | None = None,
    is_cognizable: bool | None = None,
    review_status: LawReviewStatus | None = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> LawSearchResponse:
    base_stmt = _filtered_law_query(
        q=q,
        act_name=act_name,
        section_number=section_number,
        category=category,
        is_bailable=is_bailable,
        is_cognizable=is_cognizable,
        review_status=review_status,
    )
    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total = db.scalar(count_stmt) or 0

    rank = _rank_expression(q)
    rank_column = rank.label("rank") if rank is not None else func.null().label("rank")
    stmt = base_stmt.add_columns(rank_column)
    if rank is not None:
        stmt = stmt.order_by(desc("rank"), LawSection.act_name, LawSection.section_number)
    else:
        stmt = stmt.order_by(LawSection.act_name, LawSection.section_number)

    rows = db.execute(stmt.limit(limit).offset(offset)).all()

    return LawSearchResponse(
        query=q,
        total=total,
        limit=limit,
        offset=offset,
        results=[
            LawSearchResult(
                law_section=LawSectionResponse.model_validate(row[0]),
                rank=float(row[1]) if row[1] is not None else None,
            )
            for row in rows
        ],
    )


@router.get("/{section_id}", response_model=LawSectionResponse, response_model_by_alias=False)
def get_law_section(
    section_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LawSectionResponse:
    law_section = db.get(LawSection, section_id)
    if law_section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Law section not found.")

    return LawSectionResponse.model_validate(law_section)


@router.post(
    "/{section_id}/bookmark",
    response_model=BookmarkResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def bookmark_law_section(
    section_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BookmarkResponse:
    law_section = db.get(LawSection, section_id)
    if law_section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Law section not found.")

    existing = db.scalar(
        select(Bookmark).where(
            Bookmark.user_id == current_user.id,
            Bookmark.law_section_id == section_id,
        )
    )
    if existing is not None:
        return BookmarkResponse(
            id=existing.id,
            law_section_id=existing.law_section_id,
            created_at=existing.created_at,
        )

    bookmark = Bookmark(
        user_id=current_user.id,
        law_section_id=section_id,
        created_at=datetime.now(UTC),
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)

    return BookmarkResponse(
        id=bookmark.id,
        law_section_id=bookmark.law_section_id,
        created_at=bookmark.created_at,
    )


@admin_router.post(
    "",
    response_model=LawSectionResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def create_law_section(
    payload: LawSectionCreate,
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> LawSectionResponse:
    law_section = LawSection(**payload.model_dump())
    if payload.review_status == LawReviewStatus.REVIEWED:
        law_section.last_reviewed_at = datetime.now(UTC)

    db.add(law_section)
    db.flush()
    _refresh_search_vector(db, law_section.id)
    record_audit_log(
        db,
        actor_id=admin.id,
        action="legal_content.created",
        entity_type="law_section",
        entity_id=law_section.id,
        metadata={"act_name": law_section.act_name, "section_number": law_section.section_number},
        request=request,
    )
    db.commit()
    db.refresh(law_section)

    return LawSectionResponse.model_validate(law_section)


@admin_router.put(
    "/{section_id}",
    response_model=LawSectionResponse,
    response_model_by_alias=False,
)
def update_law_section(
    section_id: UUID,
    payload: LawSectionUpdate,
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> LawSectionResponse:
    law_section = db.get(LawSection, section_id)
    if law_section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Law section not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(law_section, key, value)

    if update_data.get("review_status") == LawReviewStatus.REVIEWED:
        law_section.last_reviewed_at = datetime.now(UTC)

    db.flush()
    _refresh_search_vector(db, law_section.id)
    record_audit_log(
        db,
        actor_id=admin.id,
        action="legal_content.updated",
        entity_type="law_section",
        entity_id=law_section.id,
        metadata={"updated_fields": sorted(update_data.keys())},
        request=request,
    )
    db.commit()
    db.refresh(law_section)

    return LawSectionResponse.model_validate(law_section)


def _filtered_law_query(
    *,
    q: str | None,
    act_name: str | None,
    section_number: str | None,
    category: str | None,
    is_bailable: bool | None,
    is_cognizable: bool | None,
    review_status: LawReviewStatus | None,
) -> Select[tuple[LawSection]]:
    stmt = select(LawSection)

    if q:
        like = f"%{q}%"
        ts_query = func.plainto_tsquery("english", q)
        stmt = stmt.where(
            or_(
                LawSection.search_vector.op("@@")(ts_query),
                LawSection.act_name.ilike(like),
                LawSection.section_number.ilike(like),
                LawSection.title.ilike(like),
                LawSection.plain_language.ilike(like),
            )
        )

    if act_name:
        stmt = stmt.where(LawSection.act_name.ilike(f"%{act_name}%"))
    if section_number:
        stmt = stmt.where(LawSection.section_number.ilike(f"%{section_number}%"))
    if category:
        stmt = stmt.where(LawSection.category_tags.contains([category]))
    if is_bailable is not None:
        stmt = stmt.where(LawSection.is_bailable.is_(is_bailable))
    if is_cognizable is not None:
        stmt = stmt.where(LawSection.is_cognizable.is_(is_cognizable))
    if review_status is not None:
        stmt = stmt.where(LawSection.review_status == review_status)

    return stmt


def _rank_expression(q: str | None) -> ColumnElement[Any] | None:
    if q is None:
        return None

    return func.ts_rank_cd(LawSection.search_vector, func.plainto_tsquery("english", q))


def _refresh_search_vector(db: Session, section_id: UUID) -> None:
    db.execute(
        update(LawSection)
        .where(LawSection.id == section_id)
        .values(search_vector=_search_vector_expression())
    )


def _search_vector_expression() -> ColumnElement[Any]:
    return (
        func.setweight(func.to_tsvector("english", func.coalesce(LawSection.act_name, "")), "A")
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(LawSection.section_number, "")), "A"
            )
        )
        .op("||")(
            func.setweight(func.to_tsvector("english", func.coalesce(LawSection.title, "")), "B")
        )
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(LawSection.plain_language, "")), "C"
            )
        )
    )

from datetime import UTC, datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import AuthenticatedUser, get_current_user, require_role, require_roles
from app.models.case import Case, CaseTimelineEvent, Hearing
from app.models.enums import CaseStatus, UserRole
from app.schemas.case import (
    CaseCreate,
    CaseListResponse,
    CaseResponse,
    CaseTimelineEventResponse,
    CaseTimelineResponse,
    CaseUpdate,
    HearingCreate,
    HearingListResponse,
    HearingReminderResponse,
    HearingResponse,
    HearingUpdate,
)
from app.services.audit import record_audit_log
from app.services.timeline import add_case_timeline_event
from app.tasks.reminders import send_hearing_reminder

router = APIRouter(prefix="/cases", tags=["cases"])
hearing_router = APIRouter(prefix="/hearings", tags=["hearings"])
lawyer_router = APIRouter(prefix="/lawyers", tags=["lawyer cases"])

AccessLevel = Literal["owner", "assigned"]


@router.post("", response_model=CaseResponse, response_model_by_alias=False, status_code=201)
def create_case(
    payload: CaseCreate,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> CaseResponse:
    case = Case(
        citizen_id=citizen.id,
        title=payload.title,
        category=payload.category,
        state=payload.state,
        district=payload.district,
        urgency=payload.urgency,
        fir_number=payload.fir_number,
        police_station=payload.police_station,
        court_name=payload.court_name,
        case_number=payload.case_number,
        status=payload.status,
        sections=payload.sections,
        description=payload.description,
        metadata_json=payload.metadata,
    )
    db.add(case)
    db.flush()
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=citizen.id,
        event_type="case.created",
        title="Case created",
        description=case.description,
        metadata={"status": case.status.value, "urgency": case.urgency.value},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="case.created",
        entity_type="case",
        entity_id=case.id,
        metadata={"status": case.status.value},
        request=request,
    )
    db.commit()
    db.refresh(case)
    return case_response(case)


@router.get("", response_model=CaseListResponse, response_model_by_alias=False)
def list_cases(
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    case_status: CaseStatus | None = None,
    include_archived: bool = False,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CaseListResponse:
    stmt = select(Case).where(Case.citizen_id == citizen.id)
    if case_status is not None:
        stmt = stmt.where(Case.status == case_status)
    if not include_archived:
        stmt = stmt.where(Case.archived_at.is_(None))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    cases = db.scalars(stmt.order_by(desc(Case.created_at)).limit(limit).offset(offset)).all()
    return CaseListResponse(
        total=total,
        limit=limit,
        offset=offset,
        results=[case_response(case) for case in cases],
    )


@router.get("/{case_id}", response_model=CaseResponse, response_model_by_alias=False)
def get_case(
    case_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CaseResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    case = get_accessible_case(db, case_id, current_user)
    return case_response(case)


@router.patch("/{case_id}", response_model=CaseResponse, response_model_by_alias=False)
def update_case(
    case_id: UUID,
    payload: CaseUpdate,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> CaseResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    case = get_accessible_case(db, case_id, current_user)
    before_status = case.status
    update_data = payload.model_dump(exclude_unset=True)
    metadata = update_data.pop("metadata", None)
    for key, value in update_data.items():
        setattr(case, key, value)
    if metadata is not None:
        case.metadata_json = metadata

    db.flush()
    event_title = "Case updated"
    event_type = "case.updated"
    if case.status != before_status:
        event_title = "Case status updated"
        event_type = "case.status_updated"
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=current_user.id,
        event_type=event_type,
        title=event_title,
        metadata={"updated_fields": sorted(payload.model_dump(exclude_unset=True).keys())},
    )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action=event_type,
        entity_type="case",
        entity_id=case.id,
        metadata={"updated_fields": sorted(payload.model_dump(exclude_unset=True).keys())},
        request=request,
    )
    db.commit()
    db.refresh(case)
    return case_response(case)


@router.delete("/{case_id}", response_model=CaseResponse, response_model_by_alias=False)
def archive_case(
    case_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> CaseResponse:
    case = get_owned_case(db, case_id, citizen.id)
    case.status = CaseStatus.ARCHIVED
    case.archived_at = datetime.now(UTC)
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=citizen.id,
        event_type="case.archived",
        title="Case archived",
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="case.archived",
        entity_type="case",
        entity_id=case.id,
        metadata={},
        request=request,
    )
    db.commit()
    db.refresh(case)
    return case_response(case)


@router.get(
    "/{case_id}/timeline",
    response_model=CaseTimelineResponse,
    response_model_by_alias=False,
)
def get_case_timeline(
    case_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CaseTimelineResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    case = get_accessible_case(db, case_id, current_user)
    events = db.scalars(
        select(CaseTimelineEvent)
        .where(CaseTimelineEvent.case_id == case.id)
        .order_by(desc(CaseTimelineEvent.created_at))
    ).all()
    return CaseTimelineResponse(
        case_id=case.id,
        events=[timeline_event_response(event) for event in events],
    )


@router.post(
    "/{case_id}/hearings",
    response_model=HearingResponse,
    response_model_by_alias=False,
    status_code=201,
)
def create_hearing(
    case_id: UUID,
    payload: HearingCreate,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> HearingResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    case = get_accessible_case(db, case_id, current_user)
    hearing = Hearing(
        case_id=case.id,
        hearing_date=payload.hearing_date,
        hearing_time=payload.hearing_time,
        court=payload.court,
        court_room=payload.court_room,
        judge=payload.judge,
        purpose=payload.purpose,
        outcome=payload.outcome,
        next_date=payload.next_date,
        notes=payload.notes,
        added_by=current_user.id,
    )
    case.status = CaseStatus.HEARING_SCHEDULED
    db.add(hearing)
    db.flush()
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=current_user.id,
        event_type="hearing.created",
        title="Hearing added",
        description=f"{payload.court} on {payload.hearing_date.isoformat()}",
        metadata={"hearing_id": str(hearing.id)},
    )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="hearing.created",
        entity_type="hearing",
        entity_id=hearing.id,
        metadata={"case_id": str(case.id)},
        request=request,
    )
    db.commit()
    db.refresh(hearing)
    return hearing_response(hearing)


@router.get(
    "/{case_id}/hearings",
    response_model=HearingListResponse,
    response_model_by_alias=False,
)
def list_case_hearings(
    case_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> HearingListResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    case = get_accessible_case(db, case_id, current_user)
    hearings = db.scalars(
        select(Hearing).where(Hearing.case_id == case.id).order_by(desc(Hearing.hearing_date))
    ).all()
    return HearingListResponse(
        case_id=case.id,
        hearings=[hearing_response(hearing) for hearing in hearings],
    )


@hearing_router.get("/{hearing_id}", response_model=HearingResponse, response_model_by_alias=False)
def get_hearing(
    hearing_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> HearingResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    hearing, _case = get_accessible_hearing(db, hearing_id, current_user)
    return hearing_response(hearing)


@hearing_router.patch(
    "/{hearing_id}",
    response_model=HearingResponse,
    response_model_by_alias=False,
)
def update_hearing(
    hearing_id: UUID,
    payload: HearingUpdate,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> HearingResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    hearing, case = get_accessible_hearing(db, hearing_id, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(hearing, key, value)

    if payload.outcome:
        case.status = (
            CaseStatus.AWAITING_ORDER if payload.next_date is None else CaseStatus.IN_COURT
        )

    db.flush()
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=current_user.id,
        event_type="hearing.updated",
        title="Hearing updated",
        description=payload.outcome,
        metadata={"hearing_id": str(hearing.id), "updated_fields": sorted(update_data.keys())},
    )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="hearing.updated",
        entity_type="hearing",
        entity_id=hearing.id,
        metadata={"case_id": str(case.id), "updated_fields": sorted(update_data.keys())},
        request=request,
    )
    db.commit()
    db.refresh(hearing)
    return hearing_response(hearing)


@hearing_router.delete("/{hearing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hearing(
    hearing_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> Response:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    hearing, case = get_accessible_hearing(db, hearing_id, current_user)
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=current_user.id,
        event_type="hearing.deleted",
        title="Hearing deleted",
        metadata={"hearing_id": str(hearing.id)},
    )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="hearing.deleted",
        entity_type="hearing",
        entity_id=hearing.id,
        metadata={"case_id": str(case.id)},
        request=request,
    )
    db.delete(hearing)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@hearing_router.post(
    "/{hearing_id}/schedule-reminders",
    response_model=HearingReminderResponse,
    response_model_by_alias=False,
)
def schedule_hearing_reminders(
    hearing_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> HearingReminderResponse:
    require_role(current_user, {UserRole.CITIZEN, UserRole.LAWYER})
    hearing, case = get_accessible_hearing(db, hearing_id, current_user)
    reminder_key = f"hearing:{hearing.id}:default"
    result = send_hearing_reminder(str(hearing.id), reminder_key)
    hearing.reminder_status = result["status"]
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=current_user.id,
        event_type="hearing.reminder_scheduled",
        title="Hearing reminder scheduled",
        metadata={"hearing_id": str(hearing.id), "reminder_key": reminder_key},
    )
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="hearing.reminder_scheduled",
        entity_type="hearing",
        entity_id=hearing.id,
        metadata={"case_id": str(case.id), "reminder_key": reminder_key},
        request=request,
    )
    db.commit()
    db.refresh(hearing)
    return HearingReminderResponse(
        hearing=hearing_response(hearing),
        status=result["status"],
        reminder_key=reminder_key,
    )


@lawyer_router.get(
    "/assigned-cases",
    response_model=CaseListResponse,
    response_model_by_alias=False,
)
def list_assigned_cases(
    lawyer: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.LAWYER))],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CaseListResponse:
    stmt = select(Case).where(Case.lawyer_id == lawyer.id, Case.archived_at.is_(None))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    cases = db.scalars(stmt.order_by(desc(Case.created_at)).limit(limit).offset(offset)).all()
    return CaseListResponse(
        total=total,
        limit=limit,
        offset=offset,
        results=[case_response(case) for case in cases],
    )


def get_accessible_case(db: Session, case_id: UUID, user: AuthenticatedUser) -> Case:
    case = db.get(Case, case_id)
    if case is None or case_access_level(case, user) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    return case


def get_owned_case(db: Session, case_id: UUID, user_id: UUID) -> Case:
    case = db.get(Case, case_id)
    if case is None or case.citizen_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    return case


def get_accessible_hearing(
    db: Session, hearing_id: UUID, user: AuthenticatedUser
) -> tuple[Hearing, Case]:
    hearing = db.get(Hearing, hearing_id)
    if hearing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hearing not found.")
    case = get_accessible_case(db, hearing.case_id, user)
    return hearing, case


def case_access_level(case: Case, user: AuthenticatedUser) -> AccessLevel | None:
    if user.role == UserRole.CITIZEN and case.citizen_id == user.id:
        return "owner"
    if user.role == UserRole.LAWYER and case.lawyer_id == user.id:
        return "assigned"
    return None


def case_response(case: Case) -> CaseResponse:
    return CaseResponse(
        id=case.id,
        citizen_id=case.citizen_id,
        lawyer_id=case.lawyer_id,
        title=case.title,
        category=case.category,
        state=case.state,
        district=case.district,
        urgency=case.urgency,
        fir_number=case.fir_number,
        police_station=case.police_station,
        court_name=case.court_name,
        case_number=case.case_number,
        status=case.status,
        sections=case.sections,
        description=case.description,
        metadata=case.metadata_json,
        archived_at=case.archived_at,
        created_at=case.created_at,
        updated_at=case.updated_at,
    )


def timeline_event_response(event: CaseTimelineEvent) -> CaseTimelineEventResponse:
    return CaseTimelineEventResponse(
        id=event.id,
        case_id=event.case_id,
        actor_id=event.actor_id,
        event_type=event.event_type,
        title=event.title,
        description=event.description,
        metadata=event.metadata_json,
        created_at=event.created_at,
    )


def hearing_response(hearing: Hearing) -> HearingResponse:
    return HearingResponse(
        id=hearing.id,
        case_id=hearing.case_id,
        hearing_date=hearing.hearing_date,
        hearing_time=hearing.hearing_time,
        court=hearing.court,
        court_room=hearing.court_room,
        judge=hearing.judge,
        purpose=hearing.purpose,
        outcome=hearing.outcome,
        next_date=hearing.next_date,
        notes=hearing.notes,
        added_by=hearing.added_by,
        reminder_status=hearing.reminder_status,
        created_at=hearing.created_at,
        updated_at=hearing.updated_at,
    )

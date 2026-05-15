from uuid import UUID

from fastapi.testclient import TestClient

from app.api.v1.cases import case_access_level
from app.core.security import AuthenticatedUser
from app.main import app
from app.models.case import Case
from app.models.enums import CaseStatus, CaseUrgency, UserRole

OWNER_ID = UUID("00000000-0000-0000-0000-000000000001")
LAWYER_ID = UUID("00000000-0000-0000-0000-000000000002")
OTHER_ID = UUID("00000000-0000-0000-0000-000000000003")


def test_cases_reject_missing_auth() -> None:
    client = TestClient(app)

    assert client.get("/api/v1/cases").status_code == 401
    assert client.post("/api/v1/cases", json={}).status_code == 401


def test_hearings_reject_missing_auth() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/hearings/00000000-0000-0000-0000-000000000010")

    assert response.status_code == 401


def test_lawyer_assigned_cases_reject_missing_auth() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/lawyers/assigned-cases")

    assert response.status_code == 401


def test_case_access_allows_owner_and_assigned_lawyer() -> None:
    case = _case()

    assert case_access_level(case, _user(OWNER_ID, UserRole.CITIZEN)) == "owner"
    assert case_access_level(case, _user(LAWYER_ID, UserRole.LAWYER)) == "assigned"


def test_case_access_blocks_unassigned_users() -> None:
    case = _case()

    assert case_access_level(case, _user(OTHER_ID, UserRole.CITIZEN)) is None
    assert case_access_level(case, _user(OTHER_ID, UserRole.LAWYER)) is None


def _case() -> Case:
    return Case(
        citizen_id=OWNER_ID,
        lawyer_id=LAWYER_ID,
        title="Consumer refund",
        category="consumer_complaint",
        state="Maharashtra",
        district="Mumbai",
        urgency=CaseUrgency.MEDIUM,
        status=CaseStatus.DRAFT,
        sections=[],
        description="Refund dispute",
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

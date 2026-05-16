from uuid import UUID

from fastapi.testclient import TestClient

from app.api.v1.legal_aid import score_lawyer_for_case
from app.main import app
from app.models.case import Case
from app.models.enums import CaseStatus, CaseUrgency, VerificationStatus
from app.models.user import LawyerProfile


def test_legal_aid_routes_reject_missing_auth() -> None:
    client = TestClient(app)

    assert client.get("/api/v1/legal-aid/requests").status_code == 401
    assert client.get("/api/v1/lawyers/legal-aid-requests").status_code == 401
    assert client.get("/api/v1/admin/lawyers/verifications").status_code == 401


def test_scoring_rewards_location_specialization_and_pro_bono() -> None:
    case = Case(
        citizen_id=UUID("00000000-0000-0000-0000-000000000001"),
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
    profile = LawyerProfile(
        user_id=UUID("00000000-0000-0000-0000-000000000002"),
        bar_number="MH/123/2020",
        state_bar_council="Maharashtra Bar Council",
        district="Mumbai",
        specializations=["consumer complaint"],
        languages=["English", "Hindi"],
        is_pro_bono=True,
        availability={"weekdays": ["morning"]},
        max_active_cases=3,
        active_case_count=0,
        verification_status=VerificationStatus.APPROVED,
    )

    score, breakdown = score_lawyer_for_case(case, profile)

    assert score == 115
    assert breakdown["district"] == 25
    assert breakdown["specialization"] == 25
    assert breakdown["pro_bono"] == 15


def test_scoring_omits_unmatched_location_and_specialization() -> None:
    case = Case(
        citizen_id=UUID("00000000-0000-0000-0000-000000000001"),
        title="Property issue",
        category="property_dispute",
        state="Maharashtra",
        district="Mumbai",
        urgency=CaseUrgency.MEDIUM,
        status=CaseStatus.DRAFT,
        sections=[],
        description="Possession issue",
        metadata_json={},
    )
    profile = LawyerProfile(
        user_id=UUID("00000000-0000-0000-0000-000000000002"),
        bar_number="DL/123/2020",
        state_bar_council="Delhi Bar Council",
        district="Delhi",
        specializations=["consumer complaint"],
        languages=[],
        is_pro_bono=False,
        availability={},
        max_active_cases=1,
        active_case_count=1,
        verification_status=VerificationStatus.APPROVED,
    )

    score, breakdown = score_lawyer_for_case(case, profile)

    assert score == 5
    assert breakdown["district"] == 0
    assert breakdown["specialization"] == 0
    assert breakdown["caseload"] == 0

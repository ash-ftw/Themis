from fastapi.testclient import TestClient

from app.domain.rti_generator import RTIDraftInput, build_rti_draft
from app.main import app
from app.tasks.notifications import deliver_notification


def test_rti_routes_reject_missing_auth() -> None:
    client = TestClient(app)
    draft_id = "00000000-0000-0000-0000-000000000010"

    assert client.post("/api/v1/rti/generate", json={}).status_code == 401
    assert client.get(f"/api/v1/rti/{draft_id}").status_code == 401
    assert client.get("/api/v1/notifications").status_code == 401
    assert client.get("/api/v1/notifications/preferences").status_code == 401


def test_rti_generator_formats_core_application_fields() -> None:
    draft = build_rti_draft(
        RTIDraftInput(
            public_authority="Municipal Corporation",
            department="Building Department",
            information_requested="Provide copies of building permission records.",
            time_period="January 2024 to March 2024",
            preferred_response_format="certified copies",
            bpl_status=False,
            applicant_name="Asha Rao",
            applicant_address="Pune",
        )
    )

    assert "Right to Information Act, 2005" in draft
    assert "Municipal Corporation" in draft
    assert "Building Department" in draft
    assert "Provide copies of building permission records." in draft
    assert "Asha Rao" in draft


def test_notification_delivery_rejects_invalid_id() -> None:
    assert deliver_notification("not-a-uuid")["status"] == "failed"

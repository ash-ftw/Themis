from fastapi.testclient import TestClient

from app.core.middleware import FixedWindowRateLimiter
from app.main import app
from app.services.audit import sanitize_audit_metadata


def test_admin_routes_reject_missing_auth() -> None:
    client = TestClient(app)
    user_id = "00000000-0000-0000-0000-000000000001"

    assert client.get("/api/v1/admin/metrics").status_code == 401
    assert client.get("/api/v1/admin/users").status_code == 401
    assert client.get("/api/v1/admin/audit-logs").status_code == 401
    assert client.get("/api/v1/admin/notifications/failures").status_code == 401
    assert client.post(f"/api/v1/admin/users/{user_id}/suspend", json={}).status_code == 401


def test_audit_metadata_redacts_sensitive_keys_recursively() -> None:
    sanitized = sanitize_audit_metadata(
        {
            "token": "secret-token",
            "profile": {"aadhaar_number": "1234", "name": "Asha"},
            "events": [{"authorization": "Bearer token"}, {"status": "ok"}],
        }
    )

    assert sanitized["token"] == "[REDACTED]"
    assert sanitized["profile"] == {"aadhaar_number": "[REDACTED]", "name": "Asha"}
    assert sanitized["events"] == [{"authorization": "[REDACTED]"}, {"status": "ok"}]


def test_fixed_window_rate_limiter_blocks_until_window_expires() -> None:
    limiter = FixedWindowRateLimiter(limit=2, window_seconds=60)

    assert limiter.check("client", now=0).allowed
    assert limiter.check("client", now=1).allowed
    blocked = limiter.check("client", now=2)
    assert not blocked.allowed
    assert blocked.retry_after_seconds == 58
    assert limiter.check("client", now=61).allowed


def test_security_headers_are_added_to_health_response() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"

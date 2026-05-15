from fastapi.testclient import TestClient
from sqlalchemy.dialects import postgresql

from app.api.v1.legal import _filtered_law_query, _rank_expression
from app.main import app
from app.models.enums import LawReviewStatus
from app.schemas.legal import LawSearchResponse


def test_law_search_rejects_missing_auth() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/laws/search")

    assert response.status_code == 401


def test_admin_legal_content_rejects_missing_auth() -> None:
    client = TestClient(app)

    response = client.post("/api/v1/admin/laws", json={})

    assert response.status_code == 401


def test_law_search_query_includes_keyword_and_filters() -> None:
    stmt = _filtered_law_query(
        q="cheating",
        act_name="Bharatiya",
        section_number="318",
        category="cyber_fraud",
        is_bailable=False,
        is_cognizable=True,
        review_status=LawReviewStatus.REVIEWED,
    )

    dialect = postgresql.dialect()  # type: ignore[no-untyped-call]
    sql = str(stmt.compile(dialect=dialect))

    assert "plainto_tsquery" in sql
    assert "law_sections.act_name ILIKE" in sql
    assert "law_sections.section_number ILIKE" in sql
    assert "law_sections.category_tags @>" in sql
    assert "law_sections.is_bailable IS false" in sql
    assert "law_sections.is_cognizable IS true" in sql
    assert "law_sections.review_status" in sql


def test_rank_expression_is_present_for_keyword() -> None:
    assert _rank_expression("cheating") is not None
    assert _rank_expression(None) is None


def test_law_search_response_tracks_elapsed_time() -> None:
    response = LawSearchResponse(
        query="rti",
        total=0,
        limit=20,
        offset=0,
        elapsed_ms=1.25,
        results=[],
    )

    assert response.elapsed_ms == 1.25

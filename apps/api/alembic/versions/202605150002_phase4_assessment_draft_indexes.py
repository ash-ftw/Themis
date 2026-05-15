"""Add phase 4 assessment and draft indexes.

Revision ID: 202605150002
Revises: 202605150001
Create Date: 2026-05-15
"""

from alembic import op

revision = "202605150002"
down_revision = "202605150001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_assessment_sessions_user_created",
        "assessment_sessions",
        ["user_id", "created_at"],
    )
    op.create_index("ix_assessment_sessions_case_id", "assessment_sessions", ["case_id"])
    op.create_index(
        "ix_assessment_sessions_issue_category",
        "assessment_sessions",
        ["issue_category"],
    )
    op.create_index(
        "ix_assessment_sessions_answers_gin",
        "assessment_sessions",
        ["answers"],
        postgresql_using="gin",
    )
    op.create_index(
        "ix_complaint_drafts_user_created",
        "complaint_drafts",
        ["user_id", "created_at"],
    )
    op.create_index("ix_complaint_drafts_case_id", "complaint_drafts", ["case_id"])
    op.create_index(
        "ix_complaint_drafts_assessment_id",
        "complaint_drafts",
        ["assessment_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_complaint_drafts_assessment_id", table_name="complaint_drafts")
    op.drop_index("ix_complaint_drafts_case_id", table_name="complaint_drafts")
    op.drop_index("ix_complaint_drafts_user_created", table_name="complaint_drafts")
    op.drop_index("ix_assessment_sessions_answers_gin", table_name="assessment_sessions")
    op.drop_index("ix_assessment_sessions_issue_category", table_name="assessment_sessions")
    op.drop_index("ix_assessment_sessions_case_id", table_name="assessment_sessions")
    op.drop_index("ix_assessment_sessions_user_created", table_name="assessment_sessions")

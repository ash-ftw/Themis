"""Add phase 6 legal aid indexes.

Revision ID: 202605160001
Revises: 202605150003
Create Date: 2026-05-16
"""

import sqlalchemy as sa

from alembic import op

revision = "202605160001"
down_revision = "202605150003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_lawyer_profiles_verification_location",
        "lawyer_profiles",
        ["verification_status", "district", "is_pro_bono"],
    )
    op.create_index(
        "ix_match_requests_case_status",
        "match_requests",
        ["case_id", "status"],
    )
    op.create_index(
        "ix_match_requests_lawyer_status_requested",
        "match_requests",
        ["lawyer_id", "status", "requested_at"],
    )
    op.create_index(
        "ix_match_requests_citizen_requested",
        "match_requests",
        ["citizen_id", "requested_at"],
    )
    op.create_index(
        "uq_match_requests_pending_case_lawyer",
        "match_requests",
        ["case_id", "lawyer_id"],
        unique=True,
        postgresql_where=sa.text("status = 'PENDING'"),
    )


def downgrade() -> None:
    op.drop_index("uq_match_requests_pending_case_lawyer", table_name="match_requests")
    op.drop_index("ix_match_requests_citizen_requested", table_name="match_requests")
    op.drop_index("ix_match_requests_lawyer_status_requested", table_name="match_requests")
    op.drop_index("ix_match_requests_case_status", table_name="match_requests")
    op.drop_index("ix_lawyer_profiles_verification_location", table_name="lawyer_profiles")

"""Add RTI and notification indexes.

Revision ID: 202605220001
Revises: 202605160002
Create Date: 2026-05-22
"""

from alembic import op

revision = "202605220001"
down_revision = "202605160002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_rti_drafts_user_created",
        "rti_drafts",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index("ix_rti_drafts_case_id", "rti_drafts", ["case_id"], unique=False)
    op.create_index(
        "ix_rti_drafts_public_authority",
        "rti_drafts",
        ["public_authority"],
        unique=False,
    )
    op.create_index(
        "ix_notifications_user_created",
        "notifications",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_notifications_status_channel",
        "notifications",
        ["status", "channel"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_notifications_status_channel", table_name="notifications")
    op.drop_index("ix_notifications_user_created", table_name="notifications")
    op.drop_index("ix_rti_drafts_public_authority", table_name="rti_drafts")
    op.drop_index("ix_rti_drafts_case_id", table_name="rti_drafts")
    op.drop_index("ix_rti_drafts_user_created", table_name="rti_drafts")

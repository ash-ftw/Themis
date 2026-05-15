"""Add phase 5 case and hearing indexes.

Revision ID: 202605150003
Revises: 202605150002
Create Date: 2026-05-15
"""

from alembic import op

revision = "202605150003"
down_revision = "202605150002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_cases_citizen_created", "cases", ["citizen_id", "created_at"])
    op.create_index("ix_cases_lawyer_created", "cases", ["lawyer_id", "created_at"])
    op.create_index("ix_cases_status_urgency", "cases", ["status", "urgency"])
    op.create_index("ix_cases_location_category", "cases", ["state", "district", "category"])
    op.create_index("ix_cases_sections_gin", "cases", ["sections"], postgresql_using="gin")
    op.create_index(
        "ix_case_timeline_events_case_created",
        "case_timeline_events",
        ["case_id", "created_at"],
    )
    op.create_index(
        "ix_case_timeline_events_event_type",
        "case_timeline_events",
        ["event_type"],
    )
    op.create_index("ix_hearings_case_date", "hearings", ["case_id", "hearing_date"])
    op.create_index("ix_hearings_date", "hearings", ["hearing_date"])
    op.create_index("ix_hearings_added_by_created", "hearings", ["added_by", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_hearings_added_by_created", table_name="hearings")
    op.drop_index("ix_hearings_date", table_name="hearings")
    op.drop_index("ix_hearings_case_date", table_name="hearings")
    op.drop_index("ix_case_timeline_events_event_type", table_name="case_timeline_events")
    op.drop_index("ix_case_timeline_events_case_created", table_name="case_timeline_events")
    op.drop_index("ix_cases_sections_gin", table_name="cases")
    op.drop_index("ix_cases_location_category", table_name="cases")
    op.drop_index("ix_cases_status_urgency", table_name="cases")
    op.drop_index("ix_cases_lawyer_created", table_name="cases")
    op.drop_index("ix_cases_citizen_created", table_name="cases")

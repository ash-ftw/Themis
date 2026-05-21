"""Add admin hardening indexes.

Revision ID: 202605220002
Revises: 202605220001
Create Date: 2026-05-22
"""

from alembic import op

revision = "202605220002"
down_revision = "202605220001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_users_role_active", "users", ["role", "is_active"], unique=False)
    op.create_index(
        "ix_audit_logs_created",
        "audit_logs",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "ix_audit_logs_action_created",
        "audit_logs",
        ["action", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_audit_logs_entity_created",
        "audit_logs",
        ["entity_type", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_admin_actions_admin_created",
        "admin_actions",
        ["admin_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_system_events_severity_created",
        "system_events",
        ["severity", "created_at"],
        unique=False,
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_notifications_failed_created
        ON notifications (created_at)
        WHERE status = 'FAILED'
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_complaint_drafts_export_queue
        ON complaint_drafts (created_at)
        WHERE status = 'EXPORTED'
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_rti_drafts_export_queue
        ON rti_drafts (created_at)
        WHERE status = 'EXPORTED'
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_rti_drafts_export_queue")
    op.execute("DROP INDEX IF EXISTS ix_complaint_drafts_export_queue")
    op.execute("DROP INDEX IF EXISTS ix_notifications_failed_created")
    op.drop_index("ix_system_events_severity_created", table_name="system_events")
    op.drop_index("ix_admin_actions_admin_created", table_name="admin_actions")
    op.drop_index("ix_audit_logs_entity_created", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action_created", table_name="audit_logs")
    op.drop_index("ix_audit_logs_created", table_name="audit_logs")
    op.drop_index("ix_users_role_active", table_name="users")

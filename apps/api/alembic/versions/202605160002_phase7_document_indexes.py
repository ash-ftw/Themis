"""Add document repository indexes.

Revision ID: 202605160002
Revises: 202605160001
Create Date: 2026-05-16
"""

from alembic import op

revision = "202605160002"
down_revision = "202605160001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_documents_case_created",
        "documents",
        ["case_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_documents_uploaded_by_created",
        "documents",
        ["uploaded_by", "created_at"],
        unique=False,
    )
    op.create_index("ix_documents_file_hash", "documents", ["file_hash"], unique=False)
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_documents_ocr_text_tsv
        ON documents USING GIN (to_tsvector('english', coalesce(ocr_text, '')))
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_documents_suspicious_malware
        ON documents (created_at)
        WHERE malware_scan_status = 'SUSPICIOUS'
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_documents_suspicious_malware")
    op.execute("DROP INDEX IF EXISTS ix_documents_ocr_text_tsv")
    op.drop_index("ix_documents_file_hash", table_name="documents")
    op.drop_index("ix_documents_uploaded_by_created", table_name="documents")
    op.drop_index("ix_documents_case_created", table_name="documents")

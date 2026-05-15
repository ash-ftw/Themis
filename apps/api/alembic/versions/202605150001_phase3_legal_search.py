"""Add legal search indexes and search vector trigger.

Revision ID: 202605150001
Revises: 202605130001
Create Date: 2026-05-15
"""

from alembic import op

revision = "202605150001"
down_revision = "202605130001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')
    op.execute(
        """
        CREATE OR REPLACE FUNCTION law_sections_search_vector_update()
        RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            setweight(to_tsvector('english', coalesce(NEW.act_name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW.section_number, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW.title, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(NEW.plain_language, '')), 'C') ||
            setweight(to_tsvector('english', array_to_string(NEW.category_tags, ' ')), 'C');
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        DROP TRIGGER IF EXISTS law_sections_search_vector_update
        ON law_sections;
        """
    )
    op.execute(
        """
        CREATE TRIGGER law_sections_search_vector_update
        BEFORE INSERT OR UPDATE OF
          act_name,
          section_number,
          title,
          plain_language,
          category_tags
        ON law_sections
        FOR EACH ROW EXECUTE FUNCTION law_sections_search_vector_update();
        """
    )
    op.execute(
        """
        UPDATE law_sections
        SET search_vector =
          setweight(to_tsvector('english', coalesce(act_name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(section_number, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(title, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(plain_language, '')), 'C') ||
          setweight(to_tsvector('english', array_to_string(category_tags, ' ')), 'C');
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_law_sections_search_vector
        ON law_sections USING GIN (search_vector);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_law_sections_title_trgm
        ON law_sections USING GIN (title gin_trgm_ops);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_law_sections_act_name_trgm
        ON law_sections USING GIN (act_name gin_trgm_ops);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_law_sections_plain_language_trgm
        ON law_sections USING GIN (plain_language gin_trgm_ops);
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_law_sections_plain_language_trgm")
    op.execute("DROP INDEX IF EXISTS ix_law_sections_act_name_trgm")
    op.execute("DROP INDEX IF EXISTS ix_law_sections_title_trgm")
    op.execute("DROP INDEX IF EXISTS ix_law_sections_search_vector")
    op.execute("DROP TRIGGER IF EXISTS law_sections_search_vector_update ON law_sections")
    op.execute("DROP FUNCTION IF EXISTS law_sections_search_vector_update")

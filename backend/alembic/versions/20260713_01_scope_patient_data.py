"""Create or upgrade the ownership boundary for patient data.

Revision ID: 20260713_01
Revises:
Create Date: 2026-07-13

For an existing prototype database, legacy rows remain unowned (NULL user_id)
and are not returned by the application. Assign or delete them explicitly in a
separate audited cleanup step; this migration never guesses their owner.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql

from app.db.session import Base
from app.db import models  # noqa: F401 - registers SQLAlchemy metadata


revision = "20260713_01"
down_revision = None
branch_labels = None
depends_on = None


def _columns(table_name: str) -> set[str]:
    return {column["name"] for column in inspect(op.get_bind()).get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    # Fresh installations receive the complete current schema in one operation.
    if not inspector.has_table("screenings"):
        Base.metadata.create_all(bind=bind)
        return

    # Older prototype schemas did not have authentication tables or ownership
    # columns. Create missing tables first, then add only additive columns.
    Base.metadata.tables["users"].create(bind=bind, checkfirst=True)
    Base.metadata.tables["otp_codes"].create(bind=bind, checkfirst=True)
    Base.metadata.tables["refresh_tokens"].create(bind=bind, checkfirst=True)

    if "user_id" not in _columns("baby_profiles"):
        op.add_column(
            "baby_profiles",
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        )
        op.create_foreign_key(
            "fk_baby_profiles_user_id_users",
            "baby_profiles",
            "users",
            ["user_id"],
            ["id"],
            ondelete="CASCADE",
        )
        op.create_index("ix_baby_profiles_user_id", "baby_profiles", ["user_id"])

    if "user_id" not in _columns("screenings"):
        op.add_column(
            "screenings",
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        )
        op.create_foreign_key(
            "fk_screenings_user_id_users",
            "screenings",
            "users",
            ["user_id"],
            ["id"],
            ondelete="CASCADE",
        )
        op.create_index("ix_screenings_user_id", "screenings", ["user_id"])


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if inspector.has_table("screenings") and "user_id" in _columns("screenings"):
        op.drop_index("ix_screenings_user_id", table_name="screenings")
        op.drop_constraint("fk_screenings_user_id_users", "screenings", type_="foreignkey")
        op.drop_column("screenings", "user_id")

    if inspector.has_table("baby_profiles") and "user_id" in _columns("baby_profiles"):
        op.drop_index("ix_baby_profiles_user_id", table_name="baby_profiles")
        op.drop_constraint("fk_baby_profiles_user_id_users", "baby_profiles", type_="foreignkey")
        op.drop_column("baby_profiles", "user_id")

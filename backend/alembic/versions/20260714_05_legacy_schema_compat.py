"""Bring prototype database tables up to the fields used by the secured API.

Revision ID: 20260714_05
Revises: 20260713_04
Create Date: 2026-07-14

Early JaundiCare deployments created some tables before the account-scoped
models existed. The ownership migration added ``user_id`` but did not ensure
all fields now selected by the profile and screening routes were present.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql

from app.db.session import Base
from app.db import models  # noqa: F401 - registers metadata


revision = "20260714_05"
down_revision = "20260713_04"
branch_labels = None
depends_on = None


def _column_names(table_name: str) -> set[str]:
    return {
        column["name"]
        for column in inspect(op.get_bind()).get_columns(table_name)
    }


def _add_missing_columns(table_name: str, columns: list[sa.Column]) -> None:
    existing = _column_names(table_name)
    for column in columns:
        if column.name not in existing:
            op.add_column(table_name, column)


def upgrade() -> None:
    bind = op.get_bind()

    # Create absent tables in dependency order. ``checkfirst`` keeps fresh
    # installations and already-upgraded deployments unchanged.
    for table_name in (
        "users",
        "otp_codes",
        "refresh_tokens",
        "baby_profiles",
        "screenings",
    ):
        Base.metadata.tables[table_name].create(bind=bind, checkfirst=True)

    _add_missing_columns(
        "baby_profiles",
        [
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("parent_name", sa.String(length=100), nullable=True),
            sa.Column("sex", sa.String(length=10), nullable=True),
            sa.Column("gestational_age_weeks", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.Column("updated_at", sa.DateTime(), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        ],
    )

    _add_missing_columns(
        "screenings",
        [
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("original_filename", sa.String(length=255), nullable=True),
            sa.Column("cloudinary_url", sa.Text(), nullable=True),
            sa.Column("cloudinary_public_id", sa.String(length=255), nullable=True),
            sa.Column("baby_age_hours", sa.Integer(), nullable=True),
            sa.Column("image_prediction", sa.String(length=50), nullable=True),
            sa.Column("image_confidence", sa.Float(), nullable=True),
            sa.Column("confidence_band", sa.String(length=50), nullable=True),
            sa.Column("raw_triage_level", sa.String(length=50), nullable=True),
            sa.Column("raw_triage_reason", sa.Text(), nullable=True),
            sa.Column("final_decision", sa.String(length=100), nullable=True),
            sa.Column("final_decision_reason", sa.Text(), nullable=True),
            sa.Column("parent_message", sa.Text(), nullable=True),
            sa.Column("notes", sa.JSON(), nullable=True),
            sa.Column("symptoms", sa.JSON(), nullable=True),
            sa.Column("user_latitude", sa.Float(), nullable=True),
            sa.Column("user_longitude", sa.Float(), nullable=True),
            sa.Column("user_state", sa.String(length=50), nullable=True),
            sa.Column("user_lga", sa.String(length=100), nullable=True),
            sa.Column("skin_tone_category", sa.String(length=30), nullable=True),
            sa.Column("recommended_facilities", sa.JSON(), nullable=True),
            sa.Column("ui_language", sa.String(length=5), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        ],
    )


def downgrade() -> None:
    # This is a non-destructive compatibility repair for existing data.
    pass

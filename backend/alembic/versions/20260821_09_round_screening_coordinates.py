"""Reduce existing screening coordinates to planning-level precision.

Revision ID: 20260821_09
Revises: 20260821_08
Create Date: 2026-08-21
"""

from alembic import op
from sqlalchemy import inspect, text


revision = "20260821_09"
down_revision = "20260821_08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Round old precise GPS values to two decimal places (~1.1 km)."""
    inspector = inspect(op.get_bind())
    if not inspector.has_table("screenings"):
        return

    columns = {column["name"] for column in inspector.get_columns("screenings")}
    required_columns = {"user_latitude", "user_longitude"}
    if not required_columns.issubset(columns):
        return

    op.execute(
        text(
            "UPDATE screenings "
            "SET user_latitude = ROUND(CAST(user_latitude AS NUMERIC), 2) "
            "WHERE user_latitude IS NOT NULL"
        )
    )
    op.execute(
        text(
            "UPDATE screenings "
            "SET user_longitude = ROUND(CAST(user_longitude AS NUMERIC), 2) "
            "WHERE user_longitude IS NOT NULL"
        )
    )


def downgrade() -> None:
    # Precision reduction is intentionally irreversible: the former precise
    # coordinates must not be recreated or restored.
    pass

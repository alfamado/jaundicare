"""Persist the chosen app language with a pending OTP verification.

Revision ID: 20260713_04
Revises: 20260713_03
Create Date: 2026-07-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260713_04"
down_revision = "20260713_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_codes"):
        return

    columns = {column["name"] for column in inspector.get_columns("otp_codes")}
    if "language" not in columns:
        op.add_column(
            "otp_codes",
            sa.Column(
                "language",
                sa.String(length=5),
                nullable=False,
                server_default="en",
            ),
        )
        op.alter_column("otp_codes", "language", server_default=None)


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_codes"):
        return

    columns = {column["name"] for column in inspector.get_columns("otp_codes")}
    if "language" in columns:
        op.drop_column("otp_codes", "language")

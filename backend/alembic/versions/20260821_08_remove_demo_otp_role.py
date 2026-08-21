"""Remove the retired OTP role-selection field.

Revision ID: 20260821_08
Revises: 20260818_07
Create Date: 2026-08-21
"""

from alembic import op
from sqlalchemy import inspect


revision = "20260821_08"
down_revision = "20260818_07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_codes"):
        return

    columns = {column["name"] for column in inspector.get_columns("otp_codes")}
    if "requested_role" in columns:
        op.drop_column("otp_codes", "requested_role")


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_codes"):
        return

    columns = {column["name"] for column in inspector.get_columns("otp_codes")}
    if "requested_role" not in columns:
        op.execute("ALTER TABLE otp_codes ADD COLUMN requested_role VARCHAR(20) NOT NULL DEFAULT 'parent'")
        op.execute("ALTER TABLE otp_codes ALTER COLUMN requested_role DROP DEFAULT")

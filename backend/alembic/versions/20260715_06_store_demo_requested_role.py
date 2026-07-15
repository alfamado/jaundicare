"""Store the selected presentation role with each OTP.

Revision ID: 20260715_06
Revises: 20260714_05
Create Date: 2026-07-15

The role selection is honoured only when the explicitly allow-listed demo OTP
mode is active. Production public registration remains parent-only.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260715_06"
down_revision = "20260714_05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_codes"):
        return

    columns = {column["name"] for column in inspector.get_columns("otp_codes")}
    if "requested_role" not in columns:
        op.add_column(
            "otp_codes",
            sa.Column(
                "requested_role",
                sa.String(length=20),
                nullable=False,
                server_default="parent",
            ),
        )
        op.alter_column("otp_codes", "requested_role", server_default=None)


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_codes"):
        return
    columns = {column["name"] for column in inspector.get_columns("otp_codes")}
    if "requested_role" in columns:
        op.drop_column("otp_codes", "requested_role")

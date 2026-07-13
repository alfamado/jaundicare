"""Add database-backed throttling records for OTP requests.

Revision ID: 20260713_02
Revises: 20260713_01
Create Date: 2026-07-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql


revision = "20260713_02"
down_revision = "20260713_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if inspector.has_table("otp_request_audits"):
        return

    op.create_table(
        "otp_request_audits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=False),
        sa.Column("client_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(
        "ix_otp_request_audits_phone_created",
        "otp_request_audits",
        ["phone_number", "created_at"],
    )
    op.create_index(
        "ix_otp_request_audits_client_created",
        "otp_request_audits",
        ["client_fingerprint", "created_at"],
    )


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("otp_request_audits"):
        return

    op.drop_index("ix_otp_request_audits_client_created", table_name="otp_request_audits")
    op.drop_index("ix_otp_request_audits_phone_created", table_name="otp_request_audits")
    op.drop_table("otp_request_audits")

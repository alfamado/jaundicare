"""Add privacy-preserving consultation rate-limit audit records.

Revision ID: 20260818_07
Revises: 20260715_06
Create Date: 2026-08-18
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql


revision = "20260818_07"
down_revision = "20260715_06"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if inspector.has_table("consultation_request_audits"):
        return

    op.create_table(
        "consultation_request_audits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("assistant", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(
        "ix_consultation_request_audits_user_id",
        "consultation_request_audits",
        ["user_id"],
    )
    op.create_index(
        "ix_consultation_request_audits_user_assistant_created",
        "consultation_request_audits",
        ["user_id", "assistant", "created_at"],
    )


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("consultation_request_audits"):
        return
    op.drop_table("consultation_request_audits")

"""Add isolated project credentials for the future ClinixTech partner API.

Revision ID: 20260821_10
Revises: 20260821_09
Create Date: 2026-08-21
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260821_10"
down_revision = "20260821_09"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "clinix_api_projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("allowed_assistants", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "clinix_api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("key_prefix", sa.String(length=32), nullable=False),
        sa.Column("secret_hash", sa.String(length=64), nullable=False),
        sa.Column("scopes", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["clinix_api_projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key_prefix"),
        sa.UniqueConstraint("secret_hash"),
    )
    op.create_index("ix_clinix_api_keys_project_id", "clinix_api_keys", ["project_id"])
    op.create_index("ix_clinix_api_keys_expires_at", "clinix_api_keys", ["expires_at"])
    op.create_index(
        "ix_clinix_api_keys_project_active",
        "clinix_api_keys",
        ["project_id", "is_active"],
    )

    op.create_table(
        "clinix_api_request_audits",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assistant", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["clinix_api_projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_clinix_api_request_audits_project_id", "clinix_api_request_audits", ["project_id"])
    op.create_index(
        "ix_clinix_api_request_audits_project_assistant_created",
        "clinix_api_request_audits",
        ["project_id", "assistant", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("clinix_api_request_audits")
    op.drop_table("clinix_api_keys")
    op.drop_table("clinix_api_projects")

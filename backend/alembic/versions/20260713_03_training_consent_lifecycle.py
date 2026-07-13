"""Add training consent audit fields and cascading ownership.

Revision ID: 20260713_03
Revises: 20260713_02
Create Date: 2026-07-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260713_03"
down_revision = "20260713_02"
branch_labels = None
depends_on = None


def _columns() -> set[str]:
    return {
        column["name"]
        for column in inspect(op.get_bind()).get_columns("model_training_images")
    }


def _replace_screening_fk(ondelete: str | None) -> None:
    inspector = inspect(op.get_bind())
    foreign_keys = inspector.get_foreign_keys("model_training_images")
    for foreign_key in foreign_keys:
        if foreign_key.get("constrained_columns") == ["screening_id"]:
            constraint_name = foreign_key.get("name")
            if constraint_name:
                op.drop_constraint(
                    constraint_name,
                    "model_training_images",
                    type_="foreignkey",
                )
            break

    op.create_foreign_key(
        "fk_model_training_images_screening_id_screenings",
        "model_training_images",
        "screenings",
        ["screening_id"],
        ["id"],
        ondelete=ondelete,
    )


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("model_training_images"):
        return

    columns = _columns()
    if "consent_version" not in columns:
        op.add_column(
            "model_training_images",
            sa.Column("consent_version", sa.String(length=40), nullable=True),
        )
    if "consented_at" not in columns:
        op.add_column(
            "model_training_images",
            sa.Column("consented_at", sa.DateTime(), nullable=True),
        )
    if "consent_withdrawn_at" not in columns:
        op.add_column(
            "model_training_images",
            sa.Column("consent_withdrawn_at", sa.DateTime(), nullable=True),
        )

    _replace_screening_fk(ondelete="CASCADE")


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if not inspector.has_table("model_training_images"):
        return

    _replace_screening_fk(ondelete=None)
    columns = _columns()
    if "consent_withdrawn_at" in columns:
        op.drop_column("model_training_images", "consent_withdrawn_at")
    if "consented_at" in columns:
        op.drop_column("model_training_images", "consented_at")
    if "consent_version" in columns:
        op.drop_column("model_training_images", "consent_version")

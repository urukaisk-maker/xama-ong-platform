"""add enum check constraints for derivations

Revision ID: a1b2c3d4e5f7
Revises: f1a2b3c4d5e6
Create Date: 2026-09-28
"""
from alembic import op


revision = "a1b2c3d4e5f7"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Normalizar por si acaso (la tabla está vacía, pero por consistencia)
    op.execute("UPDATE derivations SET origin = LOWER(TRIM(origin)) WHERE origin <> LOWER(TRIM(origin))")
    op.execute("UPDATE derivations SET status = LOWER(TRIM(status)) WHERE status <> LOWER(TRIM(status))")

    op.create_check_constraint(
        "ck_derivations_origin", "derivations",
        "origin IN ('servicios_sociales', 'policia_local', 'cruz_roja', 'otro')",
    )
    op.create_check_constraint(
        "ck_derivations_status", "derivations",
        "status IN ('pendiente', 'servida', 'cancelada')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_derivations_status", "derivations", type_="check")
    op.drop_constraint("ck_derivations_origin", "derivations", type_="check")

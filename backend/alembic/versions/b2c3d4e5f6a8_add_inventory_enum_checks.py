"""add enum check constraints for products and batches

Revision ID: b2c3d4e5f6a8
Revises: a1b2c3d4e5f7
Create Date: 2026-09-28
"""
from alembic import op


revision = "b2c3d4e5f6a8"
down_revision = "a1b2c3d4e5f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Normalizar datos existentes por si hubiera variaciones
    op.execute("UPDATE products SET category = LOWER(TRIM(category)) WHERE category IS NOT NULL AND category <> LOWER(TRIM(category))")
    op.execute("UPDATE products SET unit     = LOWER(TRIM(unit))     WHERE unit     <> LOWER(TRIM(unit))")
    op.execute("UPDATE batches  SET origin   = LOWER(TRIM(origin))   WHERE origin   <> LOWER(TRIM(origin))")
    op.execute("UPDATE batches  SET status   = LOWER(TRIM(status))   WHERE status   <> LOWER(TRIM(status))")

    # products.category: admite NULL
    op.create_check_constraint(
        "ck_products_category", "products",
        "category IS NULL OR category IN ("
        "'panaderia', 'fruta', 'legumbres', 'bolleria', 'lacteos', "
        "'granos', 'conservas', 'verdura', 'aceites')",
    )
    op.create_check_constraint(
        "ck_products_unit", "products",
        "unit IN ('litro', 'unidad', 'kg')",
    )
    op.create_check_constraint(
        "ck_batches_origin", "batches",
        "origin IN ("
        "'donacion_corporativa', 'campana_solidaria', 'comida_cocinada', "
        "'excedente_agricola', 'comercio_local')",
    )
    op.create_check_constraint(
        "ck_batches_status", "batches",
        "status IN ('disponible', 'agotado', 'caducado')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_batches_status", "batches", type_="check")
    op.drop_constraint("ck_batches_origin", "batches", type_="check")
    op.drop_constraint("ck_products_unit", "products", type_="check")
    op.drop_constraint("ck_products_category", "products", type_="check")

"""Initial schema for the Fadak platform.

This first revision establishes the tables defined in app.models.
For later schema changes, create and review a new Alembic revision rather than
editing an applied revision or relying on create_all to add columns.
"""
from alembic import op

from app.db import Base
from app import models  # noqa: F401

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())

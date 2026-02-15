"""add_awards_to_event

Revision ID: c73bbec99272
Revises: ba63789f87b2
Create Date: 2026-02-15 01:22:23.465780

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c73bbec99272'
down_revision: Union[str, None] = 'ba63789f87b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add has_awards column with default False
    op.add_column('event', sa.Column('has_awards', sa.Boolean(), nullable=True, server_default='false'))
    
    # Add award_categories column (nullable)
    op.add_column('event', sa.Column('award_categories', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove award_categories column
    op.drop_column('event', 'award_categories')
    
    # Remove has_awards column
    op.drop_column('event', 'has_awards')

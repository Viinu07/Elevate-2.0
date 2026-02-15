"""Add release metrics

Revision ID: a5c2d3e4f5g6
Revises: 90214a123bc4
Create Date: 2026-02-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a5c2d3e4f5g6'
down_revision = '90214a123bc4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('releases_v2', sa.Column('completion_percentage', sa.Integer(), server_default='0', nullable=True))
    op.add_column('releases_v2', sa.Column('health_score', sa.Integer(), server_default='100', nullable=True))


def downgrade():
    op.drop_column('releases_v2', 'health_score')
    op.drop_column('releases_v2', 'completion_percentage')

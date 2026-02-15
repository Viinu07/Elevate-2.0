"""Enhance event schema

Revision ID: b6d5e4f3a2c1
Revises: a5c2d3e4f5g6
Create Date: 2026-02-14 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b6d5e4f3a2c1'
down_revision = 'a5c2d3e4f5g6'
branch_labels = None
depends_on = None


def upgrade():
    # Helper to check if column exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('event')]

    # Add new columns to event table if they don't exist
    if 'organizer_id' not in columns:
        op.add_column('event', sa.Column('organizer_id', sa.String(), nullable=True))
        op.create_foreign_key(None, 'event', 'user', ['organizer_id'], ['id'], ondelete='CASCADE')
        op.create_index(op.f('ix_event_organizer_id'), 'event', ['organizer_id'], unique=False)
        
    if 'organizer_team_id' not in columns:
        op.add_column('event', sa.Column('organizer_team_id', sa.String(), nullable=True))
        op.create_foreign_key(None, 'event', 'team', ['organizer_team_id'], ['id'])
        
    if 'event_type' not in columns:
        op.add_column('event', sa.Column('event_type', sa.String(), nullable=True))
        
    if 'status' not in columns:
        op.add_column('event', sa.Column('status', sa.String(), server_default='UPCOMING', nullable=False))
        
    if 'agenda' not in columns:
        op.add_column('event', sa.Column('agenda', sa.String(), nullable=True))
        
    if 'expectations' not in columns:
        op.add_column('event', sa.Column('expectations', sa.String(), nullable=True))
        
    if 'notes' not in columns:
        op.add_column('event', sa.Column('notes', sa.String(), nullable=True))
        
    if 'enable_awards_nomination' not in columns:
        op.add_column('event', sa.Column('enable_awards_nomination', sa.Boolean(), server_default='false', nullable=False))


def downgrade():
    # Downgrade logic (simplified, dropping columns if they exist is safer but standard downgrade assumes state)
    op.drop_constraint(None, 'event', type_='foreignkey') # May error if name not known, but standard alembic relies on state
    op.drop_index(op.f('ix_event_organizer_id'), table_name='event')
    
    op.drop_column('event', 'enable_awards_nomination')
    op.drop_column('event', 'notes')
    op.drop_column('event', 'expectations')
    op.drop_column('event', 'agenda')
    op.drop_column('event', 'status')
    op.drop_column('event', 'event_type')
    op.drop_column('event', 'organizer_team_id')
    op.drop_column('event', 'organizer_id')

"""Add V2 Tables

Revision ID: 90214a123bc4
Revises: 431b3b847d9b
Create Date: 2026-02-14 10:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '90214a123bc4'
down_revision = '431b3b847d9b'
branch_labels = None
depends_on = None


def upgrade():
    # Endorsements
    op.create_table('endorsements',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('receiver_id', sa.String(), nullable=False),
        sa.Column('giver_id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['giver_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['receiver_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_endorsements_id'), 'endorsements', ['id'], unique=False)

    # Releases
    op.create_table('releases_v2',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('release_date', sa.DateTime(), nullable=True),
        sa.Column('actual_release_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_releases_v2_id'), 'releases_v2', ['id'], unique=False)
    op.create_index(op.f('ix_releases_v2_version'), 'releases_v2', ['version'], unique=True)

    # Work Items
    op.create_table('work_items_v2',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('story_points', sa.Integer(), nullable=True),
        sa.Column('release_id', sa.String(), nullable=True),
        sa.Column('assignee_id', sa.String(), nullable=True),
        sa.Column('team_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['assignee_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['release_id'], ['releases_v2.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['team.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_work_items_v2_id'), 'work_items_v2', ['id'], unique=False)

    # Testing Cycles
    op.create_table('testing_cycles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ABORTED', name='testcyclestatus'), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('release_id', sa.String(), nullable=False),
        sa.Column('pass_rate', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['release_id'], ['releases_v2.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_testing_cycles_id'), 'testing_cycles', ['id'], unique=False)

    # Test Executions
    op.create_table('test_executions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('cycle_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('PASS', 'FAIL', 'BLOCKED', 'SKIPPED', 'PENDING', name='testexecutionstatus'), nullable=True),
        sa.Column('executed_by_id', sa.String(), nullable=True),
        sa.Column('executed_at', sa.DateTime(), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('defect_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['cycle_id'], ['testing_cycles.id'], ),
        sa.ForeignKeyConstraint(['executed_by_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_executions_id'), 'test_executions', ['id'], unique=False)

    # Tasks
    op.create_table('tasks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('TODO', 'IN_PROGRESS', 'DONE', name='taskstatus'), nullable=True),
        sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='taskpriority'), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('assigned_to_id', sa.String(), nullable=True),
        sa.Column('created_by_id', sa.String(), nullable=False),
        sa.Column('linked_event_id', sa.String(), nullable=True),
        sa.Column('linked_release_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['assigned_to_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ),
        # Depending on if events table is migrated to V2 or using existing
        # Assuming linking to existing 'event' table (Base class makes it singular)
        sa.ForeignKeyConstraint(['linked_event_id'], ['event.id'], ),
        sa.ForeignKeyConstraint(['linked_release_id'], ['releases_v2.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)

    # Notifications
    op.create_table('notifications',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('related_entity_type', sa.String(), nullable=True),
        sa.Column('related_entity_id', sa.String(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)

    op.create_table('notification_preferences',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('notification_type', sa.String(), nullable=False),
        sa.Column('channel', sa.String(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'notification_type', 'channel', name='uix_user_notif_pref')
    )
    op.create_index(op.f('ix_notification_preferences_id'), 'notification_preferences', ['id'], unique=False)

    # Profiles
    op.create_table('profiles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('skills', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('social_links', sa.JSON(), nullable=True),
        sa.Column('joined_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_profiles_id'), 'profiles', ['id'], unique=False)
    op.create_index(op.f('ix_profiles_user_id'), 'profiles', ['user_id'], unique=True)
    
    # Event Participants (If not already created in V1 update, check logic)
    # Assuming V2 added this new table
    op.create_table('event_participants',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('event_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('rsvp_status', sa.String(), nullable=True),
        sa.Column('attended', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['event_id'], ['event.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_event_participants_id'), 'event_participants', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_event_participants_id'), table_name='event_participants')
    op.drop_table('event_participants')
    op.drop_index(op.f('ix_profiles_user_id'), table_name='profiles')
    op.drop_index(op.f('ix_profiles_id'), table_name='profiles')
    op.drop_table('profiles')
    op.drop_index(op.f('ix_notification_preferences_id'), table_name='notification_preferences')
    op.drop_table('notification_preferences')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    op.drop_table('tasks')
    op.drop_index(op.f('ix_test_executions_id'), table_name='test_executions')
    op.drop_table('test_executions')
    op.drop_index(op.f('ix_testing_cycles_id'), table_name='testing_cycles')
    op.drop_table('testing_cycles')
    op.drop_index(op.f('ix_work_items_v2_id'), table_name='work_items_v2')
    op.drop_table('work_items_v2')
    op.drop_index(op.f('ix_releases_v2_version'), table_name='releases_v2')
    op.drop_index(op.f('ix_releases_v2_id'), table_name='releases_v2')
    op.drop_table('releases_v2')
    op.drop_index(op.f('ix_endorsements_id'), table_name='endorsements')
    op.drop_table('endorsements')

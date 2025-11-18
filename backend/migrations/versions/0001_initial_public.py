"""initial public schema aligned to ERD

Revision ID: 0001_initial_public
Revises:
Create Date: 2025-11-18 03:20:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial_public'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # users
    op.create_table(
        'users',
        sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(length=150), nullable=False),
        sa.Column('password', sa.String(length=150), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('phone_number', sa.String(length=25), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('username', name='uq_users_username'),
        sa.UniqueConstraint('email', name='uq_users_email'),
        sa.UniqueConstraint('phone_number', name='uq_users_phone'),
    )
    op.create_index('idx_user_role', 'users', ['role'], unique=False)

    # admin
    op.create_table(
        'admin',
        sa.Column('admin_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('admin_id'),
        sa.UniqueConstraint('user_id', name='uq_admin_user'),
    )

    # customer
    op.create_table(
        'customer',
        sa.Column('customer_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('customer_id'),
        sa.UniqueConstraint('user_id', name='uq_customer_user'),
    )

    # address
    op.create_table(
        'address',
        sa.Column('address_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('district', sa.String(length=100), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('longitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('latitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('address_id'),
    )

    # courier
    op.create_table(
        'courier',
        sa.Column('courier_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('vehicle_plate', sa.String(length=10), nullable=True),
        sa.Column('online', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('last_seen', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_latitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('current_longitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('current_address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('courier_id'),
        sa.UniqueConstraint('user_id', name='uq_courier_user'),
    )

    # shipment
    op.create_table(
        'shipment',
        sa.Column('shipment_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('assigned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('picked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('courier_id', sa.Integer(), nullable=True),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('pickup_latitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('pickup_longitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('pickup_address', sa.Text(), nullable=True),
        sa.Column('destination_latitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('destination_longitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('destination_address', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'unassigned'")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['courier_id'], ['courier.courier_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['customer_id'], ['customer.customer_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('shipment_id'),
    )
    op.create_index('ix_shipment_status', 'shipment', ['status'], unique=False)

    # payment
    op.create_table(
        'payment',
        sa.Column('payment_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('shipment_id', sa.Integer(), nullable=False),
        sa.Column('method', sa.String(length=150), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default=sa.text("'pending'")),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipment.shipment_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('payment_id'),
    )


def downgrade():
    op.drop_table('payment')
    op.drop_index('ix_shipment_status', table_name='shipment')
    op.drop_table('shipment')
    op.drop_table('courier')
    op.drop_table('address')
    op.drop_table('customer')
    op.drop_table('admin')
    op.drop_index('idx_user_role', table_name='users')
    op.drop_table('users')



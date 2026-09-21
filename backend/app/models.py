from datetime import date, datetime, time
from decimal import Decimal
from enum import Enum
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


class UserRole(str, Enum):
    CUSTOMER = 'CUSTOMER'
    ADMIN = 'ADMIN'
    DELIVERY_PARTNER = 'DELIVERY_PARTNER'


class OrderStatus(str, Enum):
    RECEIVED = 'RECEIVED'
    CONFIRMED = 'CONFIRMED'
    PROCUREMENT = 'PROCUREMENT'
    PACKING = 'PACKING'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY'
    DELIVERED = 'DELIVERED'
    DELIVERY_FAILED = 'DELIVERY_FAILED'
    CUSTOMER_UNAVAILABLE = 'CUSTOMER_UNAVAILABLE'
    PARTIAL_ISSUE = 'PARTIAL_ISSUE'
    CANCELLED = 'CANCELLED'


class PaymentStatus(str, Enum):
    PENDING = 'PENDING'
    PAID_CASH = 'PAID_CASH'
    COLLECTION_ISSUE = 'COLLECTION_ISSUE'


class ProcurementStatus(str, Enum):
    PENDING = 'PENDING'
    PURCHASED = 'PURCHASED'
    SHORTAGE = 'SHORTAGE'
    CANCELLED = 'CANCELLED'


class PackingStatus(str, Enum):
    PENDING = 'PENDING'
    PACKED = 'PACKED'
    READY = 'READY'


class DeliveryStatus(str, Enum):
    ASSIGNED = 'ASSIGNED'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY'
    DELIVERED = 'DELIVERED'
    CUSTOMER_UNAVAILABLE = 'CUSTOMER_UNAVAILABLE'
    DELIVERY_FAILED = 'DELIVERY_FAILED'
    PARTIAL_ISSUE = 'PARTIAL_ISSUE'


class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(String(32), default=UserRole.CUSTOMER, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    customer: Mapped['Customer | None'] = relationship(back_populates='user', uselist=False)
    delivery_partner: Mapped['DeliveryPartner | None'] = relationship(back_populates='user', uselist=False)


class Customer(Base):
    __tablename__ = 'customers'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str] = mapped_column(String(32), index=True)
    apartment_id: Mapped[int | None] = mapped_column(ForeignKey('apartments.id'), nullable=True)
    flat_number: Mapped[str] = mapped_column(String(32), default='')
    user: Mapped['User | None'] = relationship(back_populates='customer')
    apartment: Mapped['Apartment | None'] = relationship(back_populates='customers')
    orders: Mapped[list['Order']] = relationship(back_populates='customer')


class Admin(Base):
    __tablename__ = 'admins'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True)
    display_name: Mapped[str] = mapped_column(String(160))


class DeliveryPartner(Base):
    __tablename__ = 'delivery_partners'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    user: Mapped['User'] = relationship(back_populates='delivery_partner')
    deliveries: Mapped[list['Delivery']] = relationship(back_populates='partner')


class Apartment(Base):
    __tablename__ = 'apartments'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True)
    address: Mapped[str] = mapped_column(Text)
    coordinator_name: Mapped[str] = mapped_column(String(160), default='')
    coordinator_phone: Mapped[str] = mapped_column(String(32), default='')
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    customers: Mapped[list['Customer']] = relationship(back_populates='apartment')
    orders: Mapped[list['Order']] = relationship(back_populates='apartment')


class Product(Base):
    __tablename__ = 'products'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    category: Mapped[str] = mapped_column(String(120), index=True)
    unit: Mapped[str] = mapped_column(String(32))
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    minimum_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), default=Decimal('0.25'))
    quantity_step: Mapped[Decimal] = mapped_column(Numeric(10, 3), default=Decimal('0.25'))
    image_url: Mapped[str] = mapped_column(String(500), default='')
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Order(Base):
    __tablename__ = 'orders'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey('customers.id'), nullable=True)
    apartment_id: Mapped[int] = mapped_column(ForeignKey('apartments.id'))
    customer_name: Mapped[str] = mapped_column(String(160))
    customer_phone: Mapped[str] = mapped_column(String(32))
    customer_email: Mapped[str] = mapped_column(String(320))
    flat_number: Mapped[str] = mapped_column(String(32))
    delivery_instructions: Mapped[str] = mapped_column(Text, default='')
    order_status: Mapped[OrderStatus] = mapped_column(String(40), default=OrderStatus.RECEIVED, index=True)
    packing_status: Mapped[PackingStatus] = mapped_column(String(32), default=PackingStatus.PENDING, index=True)
    payment_status: Mapped[PaymentStatus] = mapped_column(String(40), default=PaymentStatus.PENDING, index=True)
    delivery_date: Mapped[date] = mapped_column(Date, index=True)
    delivery_window_start: Mapped[time] = mapped_column(Time)
    delivery_window_end: Mapped[time] = mapped_column(Time)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    delivery_charge: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    bulk_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    customer: Mapped['Customer | None'] = relationship(back_populates='orders')
    apartment: Mapped['Apartment'] = relationship(back_populates='orders')
    items: Mapped[list['OrderItem']] = relationship(back_populates='order', cascade='all, delete-orphan')
    delivery: Mapped['Delivery | None'] = relationship(back_populates='order', uselist=False, cascade='all, delete-orphan')
    payment: Mapped['Payment | None'] = relationship(back_populates='order', uselist=False, cascade='all, delete-orphan')


class OrderItem(Base):
    __tablename__ = 'order_items'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id'), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey('products.id'))
    product_name: Mapped[str] = mapped_column(String(160))
    unit: Mapped[str] = mapped_column(String(32))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    purchase_price_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    order: Mapped['Order'] = relationship(back_populates='items')


class Procurement(Base):
    __tablename__ = 'procurement'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    delivery_date: Mapped[date] = mapped_column(Date, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey('products.id'))
    required_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    purchased_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=Decimal('0'))
    supplier: Mapped[str] = mapped_column(String(160), default='')
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    status: Mapped[ProcurementStatus] = mapped_column(String(32), default=ProcurementStatus.PENDING)


class Delivery(Base):
    __tablename__ = 'deliveries'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id'), unique=True)
    delivery_partner_id: Mapped[int | None] = mapped_column(ForeignKey('delivery_partners.id'), nullable=True)
    status: Mapped[DeliveryStatus] = mapped_column(String(40), default=DeliveryStatus.ASSIGNED)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default='')
    partner: Mapped['DeliveryPartner | None'] = relationship(back_populates='deliveries')
    order: Mapped['Order'] = relationship(back_populates='delivery')


class Payment(Base):
    __tablename__ = 'payments'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id'), unique=True)
    status: Mapped[PaymentStatus] = mapped_column(String(40), default=PaymentStatus.PENDING)
    expected_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    collected_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    collector_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    collected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    override_by_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    override_reason: Mapped[str] = mapped_column(Text, default='')
    order: Mapped['Order'] = relationship(back_populates='payment')


class Expense(Base):
    __tablename__ = 'expenses'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    expense_date: Mapped[date] = mapped_column(Date, index=True)
    category: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text, default='')
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    payment_method: Mapped[str] = mapped_column(String(80), default='CASH')
    reference: Mapped[str] = mapped_column(String(160), default='')
    recorded_by: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)


class BulkInquiry(Base):
    __tablename__ = 'bulk_inquiries'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(32))
    email: Mapped[str] = mapped_column(String(320))
    apartment_location: Mapped[str] = mapped_column(String(240))
    required_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    products: Mapped[str] = mapped_column(Text, default='')
    estimated_quantity: Mapped[str] = mapped_column(Text, default='')
    message: Mapped[str] = mapped_column(Text, default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class Notification(Base):
    __tablename__ = 'notifications'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    channel: Mapped[str] = mapped_column(String(32))
    event: Mapped[str] = mapped_column(String(80))
    recipient: Mapped[str] = mapped_column(String(320))
    payload: Mapped[str] = mapped_column(Text, default='{}')
    status: Mapped[str] = mapped_column(String(32), default='PENDING')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AppSetting(Base):
    __tablename__ = 'app_settings'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text, default='')
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    action: Mapped[str] = mapped_column(String(120), index=True)
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str] = mapped_column(String(80))
    detail: Mapped[str] = mapped_column(Text, default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

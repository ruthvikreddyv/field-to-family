from datetime import time
from decimal import Decimal
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from ..auth import optional_current_user
from ..config import get_settings
from ..db import get_db
from ..models import Apartment, Customer, Delivery, DeliveryStatus, Order, OrderItem, OrderStatus, Payment, PaymentStatus, Product, User
from ..schemas import OrderCreate, OrderOut, OrderTrackOut
from ..services import calculate_next_delivery, create_audit, enqueue_email, send_order_confirmation, validate_quantity

router = APIRouter(prefix='/orders', tags=['orders'])
settings = get_settings()


def serialize(order: Order) -> OrderOut:
    return OrderOut(
        order_id=order.order_id, customer_name=order.customer_name, customer_phone=order.customer_phone,
        customer_email=order.customer_email, apartment_id=order.apartment_id, apartment_name=order.apartment.name if order.apartment else '', flat_number=order.flat_number,
        delivery_instructions=order.delivery_instructions,
        order_status=order.order_status.value if hasattr(order.order_status, 'value') else order.order_status,
        packing_status=order.packing_status.value if hasattr(order.packing_status, 'value') else order.packing_status,
        payment_status=order.payment_status.value if hasattr(order.payment_status, 'value') else order.payment_status,
        delivery_date=order.delivery_date, delivery_window_start=order.delivery_window_start, delivery_window_end=order.delivery_window_end,
        subtotal=Decimal(order.subtotal), delivery_charge=Decimal(order.delivery_charge), discount=Decimal(order.discount), total=Decimal(order.total),
        items=[{'product_id': i.product_id, 'product_name': i.product_name, 'unit': i.unit, 'quantity': i.quantity, 'unit_price': i.unit_price, 'line_total': i.line_total} for i in order.items],
    )


def next_order_id(db: Session, delivery_date):
    prefix = f'F2F-{delivery_date.strftime("%Y%m%d")}-'
    latest = db.scalar(select(Order).where(Order.order_id.like(f'{prefix}%')).order_by(Order.id.desc()).limit(1))
    seq = 1 if not latest else int(latest.order_id.rsplit('-', 1)[1]) + 1
    return f'{prefix}{seq:04d}'


@router.post('', response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, background: BackgroundTasks, db: Session = Depends(get_db), user: User | None = Depends(optional_current_user)):
    apartment = db.get(Apartment, payload.apartment_id)
    if not apartment or not apartment.active:
        raise HTTPException(status_code=400, detail='Selected apartment is not currently served')
    products = {}
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product or not product.active:
            raise HTTPException(status_code=400, detail=f'Product {item.product_id} is unavailable')
        try:
            validate_quantity(product, item.quantity)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        products[item.product_id] = product
    delivery_date = calculate_next_delivery()
    subtotal = Decimal('0')
    line_items = []
    for item in payload.items:
        product = products[item.product_id]
        line_total = (Decimal(item.quantity) * Decimal(product.selling_price)).quantize(Decimal('0.01'))
        subtotal += line_total
        line_items.append((product, item.quantity, line_total))
    subtotal = subtotal.quantize(Decimal('0.01'))
    customer_id = None
    if user and user.role == 'CUSTOMER':
        customer = db.scalar(select(Customer).where(Customer.user_id == user.id))
        if customer:
            customer_id = customer.id
            customer.name, customer.email, customer.phone = payload.name, payload.email, payload.phone
            customer.apartment_id, customer.flat_number = payload.apartment_id, payload.flat_number
    order = Order(
        order_id=next_order_id(db, delivery_date), customer_id=customer_id, apartment_id=apartment.id,
        customer_name=payload.name, customer_phone=payload.phone, customer_email=payload.email,
        flat_number=payload.flat_number, delivery_instructions=payload.delivery_instructions,
        order_status=OrderStatus.RECEIVED, payment_status=PaymentStatus.PENDING, delivery_date=delivery_date,
        delivery_window_start=time(5, 0), delivery_window_end=time(7, 0), subtotal=subtotal,
        delivery_charge=Decimal('0'), discount=Decimal('0'), total=subtotal, bulk_flag=payload.bulk_flag,
    )
    db.add(order); db.flush()
    for product, quantity, line_total in line_items:
        db.add(OrderItem(order_id=order.id, product_id=product.id, product_name=product.name, unit=product.unit, quantity=quantity,
                         unit_price=product.selling_price, purchase_price_snapshot=product.purchase_price, line_total=line_total))
    db.add(Payment(order_id=order.id, status=PaymentStatus.PENDING, expected_amount=order.total, collected_amount=Decimal('0')))
    db.add(Delivery(order_id=order.id, status=DeliveryStatus.ASSIGNED))
    enqueue_email(db, order.customer_email, 'ORDER_CONFIRMATION', {'order_id': order.order_id})
    create_audit(db, user.id if user else None, 'ORDER_CREATED', 'ORDER', order.order_id)
    db.commit(); db.refresh(order)
    background.add_task(send_order_confirmation, order)
    return serialize(order)


@router.get('/{order_id}', response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.scalar(select(Order).options(joinedload(Order.items), joinedload(Order.apartment)).where(Order.order_id == order_id))
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    return serialize(order)


@router.get('/{order_id}/track', response_model=OrderTrackOut)
def track_order(order_id: str, phone: str, db: Session = Depends(get_db)):
    order = db.scalar(select(Order).options(joinedload(Order.items), joinedload(Order.delivery), joinedload(Order.payment)).where(Order.order_id == order_id, Order.customer_phone == phone))
    if not order:
        raise HTTPException(status_code=404, detail='Order not found for that order ID and phone')
    base = serialize(order).model_dump()
    base['delivery_status'] = (order.delivery.status.value if order.delivery and hasattr(order.delivery.status, 'value') else (order.delivery.status if order.delivery else None))
    base['payment_collected_amount'] = Decimal(order.payment.collected_amount) if order.payment else Decimal('0')
    return OrderTrackOut(**base)

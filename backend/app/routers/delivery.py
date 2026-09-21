from datetime import datetime, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from ..auth import require_role
from ..db import get_db
from ..models import Delivery, DeliveryPartner, DeliveryStatus, Order, OrderStatus, Payment, PaymentStatus, User, UserRole
from ..schemas import CompleteDelivery, DeliveryIssue
from ..services import create_audit
from .orders import serialize

router = APIRouter(prefix='/delivery', tags=['delivery'])
partner_only = require_role(UserRole.DELIVERY_PARTNER)

@router.get('/me')
def assigned_deliveries(user: User = Depends(partner_only), db: Session = Depends(get_db)):
    partner = db.scalar(select(DeliveryPartner).where(DeliveryPartner.user_id == user.id))
    if not partner: raise HTTPException(404, 'Delivery partner profile not found')
    rows = db.scalars(select(Delivery).options(joinedload(Delivery.order).joinedload(Order.items), joinedload(Delivery.order).joinedload(Order.apartment)).where(Delivery.delivery_partner_id == partner.id).order_by(Order.delivery_date, Order.apartment_id, Order.flat_number)).all()
    return [serialize(d.order).model_dump(mode='json') | {'delivery_status': d.status, 'delivery_partner': partner.name, 'delivery_id': d.id} for d in rows]

@router.post('/{delivery_id}/complete')
def complete(delivery_id: int, payload: CompleteDelivery, user: User = Depends(partner_only), db: Session = Depends(get_db)):
    delivery = db.scalar(select(Delivery).options(joinedload(Delivery.order), joinedload(Delivery.partner)).where(Delivery.id == delivery_id))
    if not delivery or not delivery.partner or delivery.partner.user_id != user.id: raise HTTPException(404, 'Delivery not found')
    order = delivery.order; payment = db.scalar(select(Payment).where(Payment.order_id == order.id))
    if not payment: raise HTTPException(500, 'Payment record missing')
    expected = Decimal(order.total); collected = Decimal(payload.collected_amount)
    if collected != expected: raise HTTPException(status_code=409, detail=f'Collected amount must exactly match ₹{expected}')
    payment.collected_amount = collected; payment.expected_amount = expected; payment.status = PaymentStatus.PAID_CASH; payment.collector_user_id = user.id; payment.collected_at = datetime.now(timezone.utc)
    delivery.status = DeliveryStatus.DELIVERED; delivery.delivered_at = datetime.now(timezone.utc)
    order.order_status = OrderStatus.DELIVERED; order.payment_status = PaymentStatus.PAID_CASH
    create_audit(db, user.id, 'DELIVERY_COMPLETED', 'ORDER', order.order_id, f'Collected ₹{collected}')
    db.commit(); return {'ok': True, 'order_id': order.order_id, 'status': 'DELIVERED', 'payment_status': 'PAID_CASH'}

@router.post('/{delivery_id}/issue')
def issue(delivery_id: int, payload: DeliveryIssue, user: User = Depends(partner_only), db: Session = Depends(get_db)):
    delivery = db.scalar(select(Delivery).options(joinedload(Delivery.order), joinedload(Delivery.partner)).where(Delivery.id == delivery_id))
    if not delivery or not delivery.partner or delivery.partner.user_id != user.id: raise HTTPException(404, 'Delivery not found')
    allowed = {x.value for x in DeliveryStatus}
    if payload.status not in allowed or payload.status == DeliveryStatus.DELIVERED.value: raise HTTPException(400, 'Invalid delivery issue status')
    delivery.status = payload.status; delivery.notes = payload.notes
    mapping = {DeliveryStatus.CUSTOMER_UNAVAILABLE.value: OrderStatus.CUSTOMER_UNAVAILABLE, DeliveryStatus.DELIVERY_FAILED.value: OrderStatus.DELIVERY_FAILED, DeliveryStatus.PARTIAL_ISSUE.value: OrderStatus.PARTIAL_ISSUE}
    delivery.order.order_status = mapping[payload.status]
    create_audit(db, user.id, 'DELIVERY_ISSUE', 'ORDER', delivery.order.order_id, payload.notes)
    db.commit(); return {'ok': True}

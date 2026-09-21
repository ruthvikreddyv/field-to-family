from datetime import date, datetime, timezone, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload
from ..auth import require_role
from ..db import get_db
from ..models import AppSetting, Apartment, Customer, Delivery, DeliveryPartner, DeliveryStatus, Expense, Order, OrderItem, OrderStatus, PackingStatus, Payment, PaymentStatus, Procurement, ProcurementStatus, Product, User, UserRole
from ..schemas import ApartmentUpsert, AssignDelivery, CashOverride, ExpenseCreate, ProductUpsert, StatusUpdate
from ..services import create_audit, now_ist
from .orders import serialize

router = APIRouter(prefix='/admin', tags=['admin'])
admin_only = require_role(UserRole.ADMIN)


def _status(v):
    return v.value if hasattr(v, 'value') else v

@router.get('/dashboard')
def dashboard(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    today = now_ist().date()
    orders = db.scalars(select(Order).options(joinedload(Order.items)).where(Order.delivery_date >= today)).all()
    today_created = db.scalars(select(Order).where(func.date(Order.created_at) == today)).all()
    total_sales_today = sum((Decimal(o.total) for o in today_created), Decimal('0'))
    pending_payment = db.scalars(select(Payment).where(Payment.status == PaymentStatus.PENDING)).all()
    collected = db.scalars(select(Payment).where(Payment.status == PaymentStatus.PAID_CASH)).all()
    pending_cash = sum((Decimal(p.expected_amount) - Decimal(p.collected_amount) for p in pending_payment), Decimal('0'))
    cash_collected = sum((Decimal(p.collected_amount) for p in collected), Decimal('0'))
    cogs = sum((Decimal(i.purchase_price_snapshot) * Decimal(i.quantity) for o in today_created for i in o.items), Decimal('0'))
    expenses = sum((Decimal(x.amount) for x in db.scalars(select(Expense).where(Expense.expense_date == today)).all()), Decimal('0'))
    next_dates = sorted({o.delivery_date for o in orders})[:2]
    recent = db.scalars(select(Order).options(joinedload(Order.items)).where(Order.delivery_date >= today - timedelta(days=30), Order.order_status != OrderStatus.CANCELLED)).all()
    orders_by_date, sales_by_date, veg = {}, {}, {}
    apartment_orders = {}
    for o in recent:
        d = o.delivery_date.isoformat(); orders_by_date[d] = orders_by_date.get(d, 0) + 1; sales_by_date[d] = sales_by_date.get(d, Decimal('0')) + Decimal(o.total)
        apartment = str(o.apartment_id); apartment_orders[apartment] = apartment_orders.get(apartment, 0) + 1
        for i in o.items: veg[i.product_name] = veg.get(i.product_name, Decimal('0')) + Decimal(i.quantity)
    delivery_rows = db.scalars(select(Delivery).join(Order).where(Order.delivery_date >= today - timedelta(days=30))).all()
    success = sum(d.status == DeliveryStatus.DELIVERED for d in delivery_rows); failed = sum(d.status in {DeliveryStatus.CUSTOMER_UNAVAILABLE, DeliveryStatus.DELIVERY_FAILED, DeliveryStatus.PARTIAL_ISSUE} for d in delivery_rows)
    return {
        'today_orders': len(today_created), 'today_sales': str(total_sales_today), 'pending_payments': str(sum((Decimal(p.expected_amount) for p in pending_payment), Decimal('0'))),
        'cash_collected': str(cash_collected), 'pending_cash_collection': str(pending_cash), 'orders_for_next_delivery': sum(o.delivery_date == next_dates[0] for o in orders) if next_dates else 0,
        'orders_for_upcoming_delivery': sum(o.delivery_date == next_dates[1] for o in orders) if len(next_dates) > 1 else 0,
        'estimated_cogs': str(cogs), 'estimated_gross_profit': str(total_sales_today - cogs), 'expenses': str(expenses), 'net_operating_result': str(total_sales_today - cogs - expenses),
        'charts': {'orders_by_delivery_date': [{'label':k,'value':v} for k,v in sorted(orders_by_date.items())[-8:]], 'sales_by_delivery_date':[{'label':k,'value':str(v)} for k,v in sorted(sales_by_date.items())[-8:]], 'vegetable_demand':[{'label':k,'value':str(v)} for k,v in sorted(veg.items(), key=lambda x:x[1], reverse=True)[:8]], 'apartment_orders':[{'label':k,'value':v} for k,v in sorted(apartment_orders.items(), key=lambda x:x[1], reverse=True)[:8]], 'payment_collection':[{'label':'Collected','value':str(cash_collected)},{'label':'Pending','value':str(sum((Decimal(p.expected_amount) for p in pending_payment), Decimal('0')))}], 'delivery_success_failure':[{'label':'Delivered','value':success},{'label':'Exceptions','value':failed}]}}

@router.get('/orders')
def list_orders(user: User = Depends(admin_only), db: Session = Depends(get_db), delivery_date: date | None = None, apartment_id: int | None = None, status: str | None = None, payment_status: str | None = None, q: str | None = None):
    stmt = select(Order).options(joinedload(Order.items), joinedload(Order.apartment)).order_by(Order.delivery_date, Order.created_at.desc())
    if delivery_date: stmt = stmt.where(Order.delivery_date == delivery_date)
    if apartment_id: stmt = stmt.where(Order.apartment_id == apartment_id)
    if status: stmt = stmt.where(Order.order_status == status)
    if payment_status: stmt = stmt.where(Order.payment_status == payment_status)
    if q: stmt = stmt.where((Order.order_id.ilike(f'%{q}%')) | (Order.customer_name.ilike(f'%{q}%')) | (Order.customer_phone.ilike(f'%{q}%')))
    return [serialize(o) for o in db.scalars(stmt).all()]

@router.post('/orders/{order_id}/status')
def update_order(order_id: str, payload: StatusUpdate, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).where(Order.order_id == order_id))
    if not order: raise HTTPException(404, 'Order not found')
    allowed = {x.value for x in OrderStatus}
    if payload.order_status not in allowed: raise HTTPException(400, 'Invalid order status')
    order.order_status = payload.order_status
    create_audit(db, user.id, 'ORDER_STATUS_CHANGED', 'ORDER', order_id, payload.notes)
    db.commit()
    return {'ok': True, 'order_status': order.order_status}

@router.post('/orders/{order_id}/assign-delivery')
def assign_delivery(order_id: str, payload: AssignDelivery, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).options(joinedload(Order.delivery)).where(Order.order_id == order_id))
    partner = db.get(DeliveryPartner, payload.delivery_partner_id)
    if not order or not partner or not partner.is_active: raise HTTPException(404, 'Order or delivery partner not found')
    if not order.delivery: order.delivery = Delivery(order_id=order.id)
    order.delivery.delivery_partner_id = partner.id; order.delivery.assigned_at = datetime.now(timezone.utc)
    create_audit(db, user.id, 'DELIVERY_ASSIGNED', 'ORDER', order_id, partner.name)
    db.commit()
    return {'ok': True}

@router.get('/procurement')
def procurement(delivery_date: date, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    items = db.execute(select(OrderItem.product_id, OrderItem.product_name, OrderItem.unit, func.sum(OrderItem.quantity)).join(Order).where(Order.delivery_date == delivery_date, Order.order_status != OrderStatus.CANCELLED).group_by(OrderItem.product_id, OrderItem.product_name, OrderItem.unit)).all()
    product_lookup = {p.id: p for p in db.scalars(select(Product)).all()}
    result = []
    for product_id, name, unit, qty in items:
        existing = db.scalar(select(Procurement).where(Procurement.delivery_date == delivery_date, Procurement.product_id == product_id))
        if not existing:
            existing = Procurement(delivery_date=delivery_date, product_id=product_id, required_quantity=qty, purchase_price=product_lookup[product_id].purchase_price, status=ProcurementStatus.PENDING)
            db.add(existing); db.flush()
        result.append({'id': existing.id, 'delivery_date': delivery_date, 'product_id': product_id, 'product': name, 'unit': unit, 'required_quantity': str(qty), 'purchased_quantity': str(existing.purchased_quantity), 'supplier': existing.supplier, 'purchase_price': str(existing.purchase_price), 'status': _status(existing.status)})
    db.commit()
    return result

@router.patch('/procurement/{procurement_id}')
def update_procurement(procurement_id: int, payload: dict, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    item = db.get(Procurement, procurement_id)
    if not item: raise HTTPException(404, 'Procurement item not found')
    if 'purchased_quantity' in payload: item.purchased_quantity = Decimal(str(payload['purchased_quantity']))
    if 'supplier' in payload: item.supplier = str(payload['supplier'])
    if 'purchase_price' in payload: item.purchase_price = Decimal(str(payload['purchase_price']))
    if 'status' in payload and payload['status'] in {x.value for x in ProcurementStatus}: item.status = payload['status']
    create_audit(db, user.id, 'PROCUREMENT_UPDATED', 'PROCUREMENT', str(procurement_id))
    db.commit(); return {'ok': True}

@router.patch('/orders/{order_id}/packing-status')
def update_packing_status(order_id: str, payload: dict, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).where(Order.order_id == order_id))
    if not order: raise HTTPException(404, 'Order not found')
    if payload.get('packing_status') not in {x.value for x in PackingStatus}: raise HTTPException(400, 'Invalid packing status')
    order.packing_status = payload['packing_status']
    create_audit(db, user.id, 'PACKING_STATUS_CHANGED', 'ORDER', order_id, payload['packing_status'])
    db.commit(); return {'ok': True}

@router.get('/packing')
def packing(delivery_date: date, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    orders = db.scalars(select(Order).options(joinedload(Order.items), joinedload(Order.apartment)).where(Order.delivery_date == delivery_date).order_by(Order.apartment_id, Order.flat_number)).all()
    grouped = {}
    for o in orders:
        grouped.setdefault(o.apartment.name, []).append(serialize(o).model_dump(mode='json'))
    return grouped

@router.get('/reconciliation')
def reconciliation(delivery_date: date, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    rows = db.execute(select(DeliveryPartner.name, Payment, Order).join(Delivery, Delivery.delivery_partner_id == DeliveryPartner.id).join(Order, Order.id == Delivery.order_id).where(Order.delivery_date == delivery_date).join(Payment, Payment.order_id == Order.id)).all()
    by_partner = {}
    orders = []
    for name, payment, order in rows:
        bucket = by_partner.setdefault(name, {'partner': name, 'expected': Decimal('0'), 'collected': Decimal('0'), 'difference': Decimal('0')})
        bucket['expected'] += Decimal(payment.expected_amount); bucket['collected'] += Decimal(payment.collected_amount)
        orders.append({'order_id': order.order_id, 'partner': name, 'expected': str(payment.expected_amount), 'collected': str(payment.collected_amount), 'difference': str(Decimal(payment.expected_amount)-Decimal(payment.collected_amount)), 'payment_status': _status(payment.status), 'delivery_status': _status(order.delivery.status) if order.delivery else None})
    for b in by_partner.values(): b['difference'] = b['expected'] - b['collected']; b['expected'] = str(b['expected']); b['collected'] = str(b['collected']); b['difference'] = str(b['difference'])
    return {'partners': list(by_partner.values()), 'orders': orders}

@router.post('/payments/{order_id}/override')
def payment_override(order_id: str, payload: CashOverride, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).where(Order.order_id == order_id)); payment = order.payment if order else None
    if not order or not payment: raise HTTPException(404, 'Order/payment not found')
    payment.collected_amount = payload.collected_amount; payment.status = PaymentStatus.PAID_CASH  # Admin override intentionally permits a documented mismatch
    payment.override_by_user_id = user.id; payment.override_reason = payload.reason; payment.collected_at = datetime.now(timezone.utc)
    if payment.status == PaymentStatus.PAID_CASH: order.payment_status = PaymentStatus.PAID_CASH
    else: order.payment_status = PaymentStatus.COLLECTION_ISSUE
    create_audit(db, user.id, 'PAYMENT_OVERRIDE', 'ORDER', order_id, payload.reason)
    db.commit(); return {'ok': True, 'payment_status': order.payment_status}

@router.get('/products')
def admin_products(user: User = Depends(admin_only), db: Session = Depends(get_db)): return db.scalars(select(Product).order_by(Product.name)).all()

@router.post('/products')
def add_product(payload: ProductUpsert, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    p = Product(**payload.model_dump()); db.add(p); create_audit(db, user.id, 'PRODUCT_CREATED', 'PRODUCT', p.name); db.commit(); db.refresh(p); return p

@router.patch('/products/{product_id}')
def edit_product(product_id: int, payload: ProductUpsert, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p: raise HTTPException(404, 'Product not found')
    for k, v in payload.model_dump().items(): setattr(p, k, v)
    create_audit(db, user.id, 'PRODUCT_UPDATED', 'PRODUCT', str(product_id)); db.commit(); return p

@router.get('/apartments')
def admin_apartments(user: User = Depends(admin_only), db: Session = Depends(get_db)): return db.scalars(select(Apartment).order_by(Apartment.name)).all()

@router.post('/apartments')
def add_apartment(payload: ApartmentUpsert, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    a = Apartment(**payload.model_dump()); db.add(a); create_audit(db, user.id, 'APARTMENT_CREATED', 'APARTMENT', a.name); db.commit(); db.refresh(a); return a

@router.patch('/apartments/{apartment_id}')
def edit_apartment(apartment_id: int, payload: ApartmentUpsert, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    a = db.get(Apartment, apartment_id)
    if not a: raise HTTPException(404, 'Apartment not found')
    for k, v in payload.model_dump().items(): setattr(a, k, v)
    create_audit(db, user.id, 'APARTMENT_UPDATED', 'APARTMENT', str(apartment_id)); db.commit(); return a

@router.get('/expenses')
def list_expenses(user: User = Depends(admin_only), db: Session = Depends(get_db)): return db.scalars(select(Expense).order_by(Expense.expense_date.desc(), Expense.id.desc())).all()

@router.post('/expenses')
def add_expense(payload: ExpenseCreate, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    e = Expense(recorded_by=user.id, **payload.model_dump()); db.add(e); create_audit(db, user.id, 'EXPENSE_CREATED', 'EXPENSE', 'new'); db.commit(); db.refresh(e); return e

@router.get('/bulk')
def list_bulk(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    from ..models import BulkInquiry
    return db.scalars(select(BulkInquiry).order_by(BulkInquiry.created_at.desc())).all()

@router.get('/delivery-partners')
def partners(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    return db.scalars(select(DeliveryPartner).where(DeliveryPartner.is_active.is_(True)).order_by(DeliveryPartner.name)).all()


@router.get('/settings')
def settings(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    return {x.key: x.value for x in db.scalars(select(AppSetting)).all()}

@router.patch('/settings')
def update_settings(payload: dict, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    allowed = {'farm_team_phone', 'farm_team_whatsapp'}
    for key, value in payload.items():
        if key not in allowed: continue
        row = db.scalar(select(AppSetting).where(AppSetting.key == key))
        if not row: row = AppSetting(key=key, value=str(value)); db.add(row)
        else: row.value = str(value)
    create_audit(db, user.id, 'SETTINGS_UPDATED', 'SETTING', 'farm_team_contact')
    db.commit()
    return {x.key: x.value for x in db.scalars(select(AppSetting)).all()}

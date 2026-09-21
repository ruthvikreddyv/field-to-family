import json
import smtplib
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from email.message import EmailMessage
from sqlalchemy import select
from sqlalchemy.orm import Session
from .config import get_settings
from .models import AuditLog, Notification, Order, Product

IST = timezone(timedelta(hours=5, minutes=30))
settings = get_settings()


def now_ist() -> datetime:
    return datetime.now(IST)


def calculate_next_delivery(now: datetime | None = None) -> date:
    """Mon/Wed/Fri; before 05:00 on a delivery day means same-day."""
    current = (now or now_ist()).astimezone(IST)
    allowed = {0, 2, 4}  # Monday, Wednesday, Friday
    cutoff = time(5, 0)
    if current.weekday() in allowed and current.time() < cutoff:
        return current.date()
    for offset in range(1, 8):
        candidate = current.date() + timedelta(days=offset)
        if candidate.weekday() in allowed:
            return candidate
    raise RuntimeError('Could not calculate delivery date')


def money(value: Decimal) -> Decimal:
    return Decimal(value).quantize(Decimal('0.01'))


def validate_quantity(product: Product, quantity: Decimal) -> None:
    min_q = Decimal(product.minimum_quantity)
    step = Decimal(product.quantity_step)
    if quantity < min_q:
        raise ValueError(f'{product.name} minimum quantity is {min_q} {product.unit}')
    units = (quantity / step).quantize(Decimal('0.0001'))
    if units != units.to_integral_value():
        raise ValueError(f'{product.name} quantity must be in steps of {step} {product.unit}')


def create_audit(db: Session, user_id: int | None, action: str, entity_type: str, entity_id: str, detail: str = '') -> None:
    db.add(AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, detail=detail))


def enqueue_email(db: Session, recipient: str, event: str, payload: dict) -> None:
    db.add(Notification(channel='EMAIL', event=event, recipient=recipient, payload=json.dumps(payload), status='QUEUED'))


def send_order_confirmation(order: Order) -> None:
    payload = {
        'order_id': order.order_id,
        'name': order.customer_name,
        'total': str(order.total),
        'delivery_date': order.delivery_date.isoformat(),
        'window': f'{order.delivery_window_start.strftime("%H:%M")} - {order.delivery_window_end.strftime("%H:%M")}',
    }
    if not settings.smtp_host:
        print('[F2F email preview]', order.customer_email, payload)
        return
    msg = EmailMessage()
    msg['Subject'] = f'F2F order confirmed — {order.order_id}'
    msg['From'] = settings.smtp_from
    msg['To'] = order.customer_email
    msg.set_content(
        f"Hello {order.customer_name},\n\nYour Field to Family order {order.order_id} is confirmed.\n"
        f"Delivery: {order.delivery_date.strftime('%A, %d %B %Y')} between "
        f"{order.delivery_window_start.strftime('%I:%M %p')} and {order.delivery_window_end.strftime('%I:%M %p')}.\n"
        f"Total: ₹{order.total}\nPayment: Pay the delivery partner upon delivery.\n\n"
        f"Farm Team: {settings.farm_team_phone}\nWhatsApp: https://wa.me/{settings.farm_team_whatsapp}\n"
    )
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
        smtp.starttls()
        if settings.smtp_user and settings.smtp_password:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)

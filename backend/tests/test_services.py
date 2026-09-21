from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo
from app.services import calculate_next_delivery, validate_quantity

IST = ZoneInfo('Asia/Kolkata')

def dt(s): return datetime.fromisoformat(s).replace(tzinfo=IST)

def test_delivery_date_rules():
    assert calculate_next_delivery(dt('2026-09-21T04:30:00')).isoformat() == '2026-09-21'  # Mon before cutoff
    assert calculate_next_delivery(dt('2026-09-21T05:00:00')).isoformat() == '2026-09-23'  # Mon cutoff is exclusive
    assert calculate_next_delivery(dt('2026-09-22T10:00:00')).isoformat() == '2026-09-23'
    assert calculate_next_delivery(dt('2026-09-23T04:59:00')).isoformat() == '2026-09-23'
    assert calculate_next_delivery(dt('2026-09-23T05:20:00')).isoformat() == '2026-09-25'
    assert calculate_next_delivery(dt('2026-09-25T04:59:00')).isoformat() == '2026-09-25'
    assert calculate_next_delivery(dt('2026-09-25T06:00:00')).isoformat() == '2026-09-28'
    assert calculate_next_delivery(dt('2026-09-27T10:00:00')).isoformat() == '2026-09-28'

class P:
    name='Tomato'; unit='kg'; minimum_quantity=Decimal('0.5'); quantity_step=Decimal('0.5')

def test_quantity_validation():
    validate_quantity(P, Decimal('0.5'))
    validate_quantity(P, Decimal('1.5'))
    try: validate_quantity(P, Decimal('0.25'))
    except ValueError: pass
    else: raise AssertionError('minimum quantity should fail')

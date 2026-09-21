from decimal import Decimal

def validate(expected, collected):
    if Decimal(str(collected)) != Decimal(str(expected)):
        raise ValueError('Collected amount must exactly match order total')

def test_payment_match(): validate('245.00','245')

def test_payment_mismatch():
    try: validate('245.00','244')
    except ValueError: pass
    else: raise AssertionError('Mismatch should fail')

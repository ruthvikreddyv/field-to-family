from decimal import Decimal

def test_order_total():
    lines=[Decimal('1')*Decimal('30'), Decimal('0.5')*Decimal('35'), Decimal('2')*Decimal('18')]
    assert sum(lines, Decimal('0')).quantize(Decimal('0.01')) == Decimal('83.50')

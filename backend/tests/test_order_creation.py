from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.background import BackgroundTasks
from app.db import Base
from app.models import Apartment, Product, User
from app.schemas import OrderCreate, OrderItemCreate
from app.routers.orders import create_order

def test_server_side_order_creation_and_total():
    engine = create_engine('sqlite:///:memory:', connect_args={'check_same_thread':False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    apartment = Apartment(name='Test Apartment', address='Test')
    product = Product(name='Tomato', category='Vegetables', unit='kg', selling_price=Decimal('30'), purchase_price=Decimal('20'), minimum_quantity=Decimal('0.5'), quantity_step=Decimal('0.5'), image_url='/products/tomato.svg', active=True)
    db.add_all([apartment,product]); db.commit(); db.refresh(apartment); db.refresh(product)
    payload = OrderCreate(name='Test Customer',phone='9000000000',email='test@example.com',apartment_id=apartment.id,flat_number='101',items=[OrderItemCreate(product_id=product.id,quantity=Decimal('1.5'))])
    order = create_order(payload, BackgroundTasks(), db, None)
    assert order.total == Decimal('45.00')
    assert order.delivery_window_start.hour == 5
    assert order.delivery_window_end.hour == 7

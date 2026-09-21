import os
from decimal import Decimal
from sqlalchemy import select
from .db import Base, SessionLocal, engine
from .auth import hash_password
from .models import Apartment, DeliveryPartner, Product, User, UserRole, Admin

PRODUCTS = [
    ('Tomato','Vegetables','kg','30','20','0.5','0.5','/products/tomato.svg'),
    ('Onion','Vegetables','kg','35','24','0.5','0.5','/products/onion.svg'),
    ('Potato','Vegetables','kg','32','22','0.5','0.5','/products/potato.svg'),
    ('Green Chili','Vegetables','kg','70','48','0.25','0.25','/products/chili.svg'),
    ('Ginger','Vegetables','kg','110','75','0.25','0.25','/products/ginger.svg'),
    ('Garlic','Vegetables','kg','130','90','0.25','0.25','/products/garlic.svg'),
    ('Coriander','Leafy Greens','bunch','15','9','1','1','/products/coriander.svg'),
    ('Curry Leaves','Leafy Greens','bunch','10','6','1','1','/products/curry-leaves.svg'),
    ('Spinach','Leafy Greens','bunch','18','10','1','1','/products/spinach.svg'),
    ('Brinjal','Vegetables','kg','45','30','0.5','0.5','/products/brinjal.svg'),
    ('Okra','Vegetables','kg','50','34','0.5','0.5','/products/okra.svg'),
    ('Cucumber','Vegetables','kg','40','27','0.5','0.5','/products/cucumber.svg'),
]

APARTMENTS = [
    ('Green Meadows Residency','Main Road, Hyderabad','F2F Coordinator','9000000001'),
    ('Lakeview Heights','Lake Road, Hyderabad','F2F Coordinator','9000000002'),
    ('Palm Grove Apartments','Garden Road, Hyderabad','F2F Coordinator','9000000003'),
]


def ensure_user(db, email, password, role):
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(email=email, password_hash=hash_password(password), role=role, is_active=True)
        db.add(user); db.flush()
    return user


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for row in PRODUCTS:
            name, cat, unit, sell, purchase, minimum, step, image = row
            if not db.scalar(select(Product).where(Product.name == name)):
                db.add(Product(name=name, category=cat, unit=unit, selling_price=Decimal(sell), purchase_price=Decimal(purchase), minimum_quantity=Decimal(minimum), quantity_step=Decimal(step), image_url=image, active=True))
        for name, address, coord, phone in APARTMENTS:
            if not db.scalar(select(Apartment).where(Apartment.name == name)):
                db.add(Apartment(name=name, address=address, coordinator_name=coord, coordinator_phone=phone, active=True))
        admin_email = os.getenv('SEED_ADMIN_EMAIL')
        admin_password = os.getenv('SEED_ADMIN_PASSWORD')
        if admin_email and admin_password:
            admin = ensure_user(db, admin_email, admin_password, UserRole.ADMIN)
            if not db.scalar(select(Admin).where(Admin.user_id == admin.id)):
                db.add(Admin(user_id=admin.id, display_name='F2F Admin'))
        partner_email = os.getenv('SEED_PARTNER_EMAIL')
        partner_password = os.getenv('SEED_PARTNER_PASSWORD')
        if partner_email and partner_password:
            partner_user = ensure_user(db, partner_email, partner_password, UserRole.DELIVERY_PARTNER)
            if not db.scalar(select(DeliveryPartner).where(DeliveryPartner.user_id == partner_user.id)):
                db.add(DeliveryPartner(user_id=partner_user.id, name='F2F Delivery Partner', phone='9000000010', is_active=True))
        db.commit()
        print('Seed complete')
    finally:
        db.close()

if __name__ == '__main__':
    main()

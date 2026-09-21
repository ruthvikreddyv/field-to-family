from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Apartment, Product
from ..schemas import ApartmentOut, ProductOut

router = APIRouter(tags=['catalog'])

@router.get('/products', response_model=list[ProductOut])
def products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).where(Product.active.is_(True)).order_by(Product.category, Product.name)).all()

@router.get('/apartments', response_model=list[ApartmentOut])
def apartments(db: Session = Depends(get_db)):
    return db.scalars(select(Apartment).where(Apartment.active.is_(True)).order_by(Apartment.name)).all()

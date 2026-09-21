from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from ..auth import require_role
from ..db import get_db
from ..models import Customer, Order, User, UserRole
from ..routers.orders import serialize

router = APIRouter(prefix='/customer', tags=['customer'])

@router.get('/orders')
def my_orders(user: User = Depends(require_role(UserRole.CUSTOMER)), db: Session = Depends(get_db)):
    customer = db.scalar(select(Customer).where(Customer.user_id == user.id))
    if not customer:
        raise HTTPException(status_code=404, detail='Customer profile not found')
    orders = db.scalars(select(Order).options(joinedload(Order.items)).where(Order.customer_id == customer.id).order_by(Order.created_at.desc())).all()
    return [serialize(o) for o in orders]

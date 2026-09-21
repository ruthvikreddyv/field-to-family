from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..auth import hash_password, make_token, verify_password, current_user
from ..config import get_settings
from ..db import get_db
from ..models import Customer, User, UserRole
from ..schemas import CustomerProfile, CustomerRegister, LoginRequest, UserOut
from ..services import create_audit

router = APIRouter(prefix='/auth', tags=['auth'])
settings = get_settings()

@router.post('/register', response_model=UserOut)
def register(payload: CustomerRegister, response: Response, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail='An account with this email already exists')
    user = User(email=payload.email, password_hash=hash_password(payload.password), role=UserRole.CUSTOMER)
    db.add(user); db.flush()
    customer = Customer(user_id=user.id, name=payload.name, email=payload.email, phone=payload.phone, apartment_id=payload.apartment_id, flat_number=payload.flat_number)
    db.add(customer)
    create_audit(db, user.id, 'CUSTOMER_REGISTERED', 'USER', str(user.id))
    db.commit()
    response.set_cookie('access_token', make_token(user), httponly=True, secure=settings.cookie_secure, samesite='lax', max_age=settings.access_token_expire_minutes * 60)
    return user

@router.post('/login', response_model=UserOut)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    response.set_cookie('access_token', make_token(user), httponly=True, secure=settings.cookie_secure, samesite='lax', max_age=settings.access_token_expire_minutes * 60)
    return user

@router.post('/logout')
def logout(response: Response):
    response.delete_cookie('access_token')
    return {'ok': True}

@router.get('/me', response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user

@router.get('/profile', response_model=CustomerProfile)
def profile(user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail='Customer account required')
    customer = db.scalar(select(Customer).where(Customer.user_id == user.id))
    if not customer:
        raise HTTPException(status_code=404, detail='Customer profile not found')
    return customer

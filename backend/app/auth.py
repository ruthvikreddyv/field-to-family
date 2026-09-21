from datetime import datetime, timedelta, timezone
from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .config import get_settings
from .db import get_db
from .models import User, UserRole

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def make_token(user: User) -> str:
    payload = {'sub': str(user.id), 'role': user.role.value if isinstance(user.role, UserRole) else str(user.role),
               'exp': datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)}
    return jwt.encode(payload, settings.secret_key, algorithm='HS256')


def _decode(access_token: str | None, db: Session) -> User | None:
    if not access_token:
        return None
    try:
        payload = jwt.decode(access_token, settings.secret_key, algorithms=['HS256'])
        user_id = int(payload['sub'])
    except (JWTError, KeyError, ValueError):
        return None
    user = db.get(User, user_id)
    return user if user and user.is_active else None


def current_user(access_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> User:
    user = _decode(access_token, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required')
    return user


def optional_current_user(access_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> User | None:
    return _decode(access_token, db)


def require_role(*roles: UserRole):
    def dependency(user: User = Depends(current_user)) -> User:
        current = user.role.value if isinstance(user.role, UserRole) else str(user.role)
        allowed = {r.value for r in roles}
        if current not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')
        return user
    return dependency

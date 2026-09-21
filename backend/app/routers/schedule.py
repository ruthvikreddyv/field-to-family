from fastapi import APIRouter
from ..services import calculate_next_delivery, now_ist
from ..config import get_settings
from ..db import get_db
from ..models import AppSetting
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

router = APIRouter(prefix='/schedule', tags=['schedule'])

@router.get('/next')
def next_schedule():
    now = now_ist()
    delivery = calculate_next_delivery(now)
    return {'timezone':'Asia/Kolkata','now':now.isoformat(),'delivery_date':delivery.isoformat(),'window_start':'05:00','window_end':'07:00','cutoff':'05:00'}

@router.get('/public-settings')
def public_settings(db: Session = Depends(get_db)):
    rows = {x.key: x.value for x in db.scalars(select(AppSetting)).all()}
    s = get_settings()
    return {'farm_team_phone': rows.get('farm_team_phone', s.farm_team_phone), 'farm_team_whatsapp': rows.get('farm_team_whatsapp', s.farm_team_whatsapp)}

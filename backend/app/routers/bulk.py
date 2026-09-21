from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..config import get_settings
from ..db import get_db
from ..models import BulkInquiry, Notification
from ..schemas import BulkInquiryCreate

router = APIRouter(prefix='/bulk-inquiries', tags=['bulk'])
settings = get_settings()

@router.post('', status_code=201)
def create_inquiry(payload: BulkInquiryCreate, db: Session = Depends(get_db)):
    inquiry = BulkInquiry(**payload.model_dump()); db.add(inquiry); db.flush()
    db.add(Notification(channel='INTERNAL', event='BULK_INQUIRY', recipient='ADMIN', payload=f'{{"inquiry_id":{inquiry.id}}}', status='QUEUED'))
    db.commit()
    return {'id': inquiry.id, 'message': 'Bulk inquiry received. The F2F Farm Team will contact you.'}

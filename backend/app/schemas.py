from datetime import date, time
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    role: str


class CustomerRegister(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=32)
    password: str = Field(min_length=8, max_length=128)
    apartment_id: int | None = None
    flat_number: str = Field(default='', max_length=32)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CustomerProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    phone: str
    apartment_id: int | None
    flat_number: str


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: str
    unit: str
    selling_price: Decimal
    minimum_quantity: Decimal
    quantity_step: Decimal
    image_url: str
    active: bool


class ApartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    address: str
    coordinator_name: str
    coordinator_phone: str
    active: bool


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)


class OrderCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=8, max_length=32)
    email: EmailStr
    apartment_id: int
    flat_number: str = Field(min_length=1, max_length=32)
    delivery_instructions: str = Field(default='', max_length=1000)
    items: list[OrderItemCreate] = Field(min_length=1)
    bulk_flag: bool = False


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: int
    product_name: str
    unit: str
    quantity: Decimal
    unit_price: Decimal
    line_total: Decimal


class OrderOut(BaseModel):
    order_id: str
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    apartment_id: int
    flat_number: str
    apartment_name: str = ''
    delivery_instructions: str
    order_status: str
    payment_status: str
    packing_status: str = 'PENDING'
    delivery_date: date
    delivery_window_start: time
    delivery_window_end: time
    subtotal: Decimal
    delivery_charge: Decimal
    discount: Decimal
    total: Decimal
    items: list[OrderItemOut]


class OrderTrackOut(OrderOut):
    delivery_status: str | None = None
    payment_collected_amount: Decimal = Decimal('0')


class StatusUpdate(BaseModel):
    order_status: str
    notes: str = ''


class AssignDelivery(BaseModel):
    delivery_partner_id: int


class CompleteDelivery(BaseModel):
    collected_amount: Decimal = Field(ge=0)


class DeliveryIssue(BaseModel):
    status: str
    notes: str = ''


class CashOverride(BaseModel):
    collected_amount: Decimal = Field(ge=0)
    reason: str = Field(min_length=3, max_length=500)


class BulkInquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=8, max_length=32)
    email: EmailStr
    apartment_location: str = Field(min_length=2, max_length=240)
    required_delivery_date: date | None = None
    products: str = Field(default='', max_length=2000)
    estimated_quantity: str = Field(default='', max_length=1000)
    message: str = Field(default='', max_length=4000)


class ExpenseCreate(BaseModel):
    expense_date: date
    category: str
    description: str = ''
    amount: Decimal = Field(gt=0)
    payment_method: str = 'CASH'
    reference: str = ''


class ProductUpsert(BaseModel):
    name: str
    category: str
    unit: str
    selling_price: Decimal = Field(gt=0)
    purchase_price: Decimal = Field(ge=0)
    minimum_quantity: Decimal = Field(gt=0)
    quantity_step: Decimal = Field(gt=0)
    image_url: str = ''
    active: bool = True


class ApartmentUpsert(BaseModel):
    name: str
    address: str
    coordinator_name: str = ''
    coordinator_phone: str = ''
    active: bool = True

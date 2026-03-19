from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time, datetime
from decimal import Decimal


# --- Services ---
class ServiceOut(BaseModel):
    id: int
    name: str
    description: str
    duration_min: int
    price: Decimal

    model_config = {"from_attributes": True}


# --- Schedules ---
class ScheduleOut(BaseModel):
    id: int
    professional_id: int
    day_of_week: int
    start_time: time
    end_time: time
    modality: str
    active: bool

    model_config = {"from_attributes": True}


class ScheduleCreate(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    modality: str = "presencial"
    active: bool = True


class ScheduleUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    modality: Optional[str] = None
    active: Optional[bool] = None


# --- Availability ---
class DayAvailability(BaseModel):
    date: str
    available: bool


class SlotOut(BaseModel):
    time: str
    label: str


# --- Appointments ---
class AppointmentCreate(BaseModel):
    service_id: int
    patient_name: str
    patient_email: EmailStr
    patient_phone: str
    appointment_date: date
    appointment_time: time


class AppointmentOut(BaseModel):
    id: int
    professional_id: int
    service_id: Optional[int]
    patient_name: str
    patient_email: str
    patient_phone: Optional[str]
    appointment_date: date
    appointment_time: time
    modality: str
    status: str
    created_at: datetime
    service_name: Optional[str] = None

    model_config = {"from_attributes": True}


class AppointmentStatusUpdate(BaseModel):
    status: str


# --- Auth ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

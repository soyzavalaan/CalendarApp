from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Appointment, Schedule, Service
from schemas import (
    AppointmentOut,
    AppointmentStatusUpdate,
    ScheduleOut,
    ScheduleCreate,
    ScheduleUpdate,
    LoginRequest,
    TokenResponse,
)
from auth import verify_password, create_access_token, get_current_admin
from config import get_settings
from services.emails import send_cancellation_patient, send_cancellation_admin

router = APIRouter()
PROFESSIONAL_ID = 1


# --- Auth ---
@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest):
    settings = get_settings()
    if data.email != settings.admin_email:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not settings.admin_password_hash:
        raise HTTPException(status_code=500, detail="Password de admin no configurado")
    if not verify_password(data.password, settings.admin_password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = create_access_token({"sub": data.email})
    return TokenResponse(access_token=token)


# --- Appointments ---
@router.get("/admin/appointments", response_model=list[AppointmentOut])
def list_appointments(
    status: str | None = None,
    date: str | None = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Appointment).filter(Appointment.professional_id == PROFESSIONAL_ID)

    if status:
        q = q.filter(Appointment.status == status)
    if date:
        q = q.filter(Appointment.appointment_date == date_type.fromisoformat(date))
    else:
        q = q.filter(Appointment.appointment_date >= date_type.today())

    appointments = q.order_by(Appointment.appointment_date, Appointment.appointment_time).all()

    results = []
    for appt in appointments:
        out = AppointmentOut.model_validate(appt)
        if appt.service:
            out.service_name = appt.service.name
        results.append(out)
    return results


@router.put("/admin/appointments/{appointment_id}/status", response_model=AppointmentOut)
async def update_appointment_status(
    appointment_id: int,
    data: AppointmentStatusUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    if data.status not in ("confirmed", "cancelled"):
        raise HTTPException(status_code=400, detail="Estado no válido")

    appt.status = data.status
    db.commit()
    db.refresh(appt)

    service_name = appt.service.name if appt.service else ""

    if data.status == "cancelled":
        try:
            await send_cancellation_patient(appt, service_name)
            await send_cancellation_admin(appt, service_name)
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")

    out = AppointmentOut.model_validate(appt)
    out.service_name = service_name
    return out


# --- Schedules ---
@router.get("/admin/schedules", response_model=list[ScheduleOut])
def list_schedules(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(Schedule)
        .filter(Schedule.professional_id == PROFESSIONAL_ID)
        .order_by(Schedule.day_of_week, Schedule.start_time)
        .all()
    )


@router.post("/admin/schedules", response_model=ScheduleOut, status_code=201)
def create_schedule(
    data: ScheduleCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if data.day_of_week < 0 or data.day_of_week > 6:
        raise HTTPException(status_code=400, detail="Día de la semana inválido (0-6)")

    schedule = Schedule(
        professional_id=PROFESSIONAL_ID,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        modality=data.modality,
        active=data.active,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.put("/admin/schedules/{schedule_id}", response_model=ScheduleOut)
def update_schedule(
    schedule_id: int,
    data: ScheduleUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Horario no encontrado")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(schedule, field, value)

    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/admin/schedules/{schedule_id}", status_code=204)
def delete_schedule(
    schedule_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    db.delete(schedule)
    db.commit()

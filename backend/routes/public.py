import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Service, Appointment, Schedule
from schemas import ServiceOut, SlotOut, DayAvailability, AppointmentCreate, AppointmentOut, RescheduleRequest
from services.slots import get_available_slots, get_days_with_availability
from services.emails import (
    send_confirmation_patient,
    send_confirmation_admin,
    send_cancellation_patient,
    send_cancellation_admin,
    send_reschedule_patient,
    send_reschedule_admin,
)
from config import get_settings

router = APIRouter()
PROFESSIONAL_ID = 1


@router.get("/services/{professional_id}", response_model=list[ServiceOut])
def list_services(professional_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .filter(Service.professional_id == professional_id, Service.active == True)
        .all()
    )


@router.get("/availability/{professional_id}", response_model=list[DayAvailability])
def month_availability(
    professional_id: int,
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    service_id: int | None = None,
    db: Session = Depends(get_db),
):
    year, mon = map(int, month.split("-"))

    duration = 60
    if service_id:
        svc = db.query(Service).filter(Service.id == service_id).first()
        if svc:
            duration = svc.duration_min

    days = get_days_with_availability(db, professional_id, year, mon, duration)
    return days


@router.get("/slots/{professional_id}", response_model=list[SlotOut])
def day_slots(
    professional_id: int,
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    service_id: int | None = None,
    db: Session = Depends(get_db),
):
    from datetime import date as date_type

    target = date_type.fromisoformat(date)

    duration = 60
    if service_id:
        svc = db.query(Service).filter(Service.id == service_id).first()
        if svc:
            duration = svc.duration_min

    return get_available_slots(db, professional_id, target, duration)


@router.post("/appointments", response_model=AppointmentOut)
async def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    settings = get_settings()

    # Validar servicio
    service = db.query(Service).filter(Service.id == data.service_id, Service.active == True).first()
    if not service:
        raise HTTPException(status_code=400, detail="Servicio no encontrado")

    # Validar que el slot esté disponible
    slots = get_available_slots(db, PROFESSIONAL_ID, data.appointment_date, service.duration_min)
    time_str = data.appointment_time.strftime("%H:%M")
    if not any(s["time"] == time_str for s in slots):
        raise HTTPException(status_code=409, detail="El horario seleccionado ya no está disponible")

    # Crear cita
    token = secrets.token_hex(32)
    payment_token = secrets.token_hex(8).upper()[:8]

    valid_modalities = ("presencial", "virtual", "híbrida")
    modality = data.modality if data.modality in valid_modalities else "presencial"

    appointment = Appointment(
        professional_id=PROFESSIONAL_ID,
        service_id=data.service_id,
        patient_name=data.patient_name,
        patient_email=data.patient_email,
        patient_phone=data.patient_phone,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        modality=modality,
        status="confirmed",
        payment_status="pending",
        payment_token=payment_token,
        cancellation_token=token,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Enviar emails
    cancel_url = f"{settings.frontend_url}/cancelar?token={token}"
    try:
        await send_confirmation_patient(appointment, service.name, cancel_url)
        await send_confirmation_admin(appointment, service.name)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

    result = AppointmentOut.model_validate(appointment)
    result.service_name = service.name
    return result


@router.post("/appointments/cancel/{token}")
async def cancel_appointment_by_token(token: str, db: Session = Depends(get_db)):
    if not token or len(token) != 64:
        raise HTTPException(status_code=400, detail="Token inválido")

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.cancellation_token == token,
            Appointment.status != "cancelled",
        )
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada o ya cancelada")

    # Verificar regla de 24 horas
    appt_datetime = datetime.combine(appointment.appointment_date, appointment.appointment_time)
    hours_until = (appt_datetime - datetime.now()).total_seconds() / 3600
    if hours_until < 24:
        raise HTTPException(
            status_code=400,
            detail="Las cancelaciones solo pueden realizarse con al menos 24 horas de anticipación",
        )

    appointment.status = "cancelled"
    db.commit()

    service_name = ""
    if appointment.service:
        service_name = appointment.service.name

    try:
        await send_cancellation_patient(appointment, service_name)
        await send_cancellation_admin(appointment, service_name)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

    return {"message": "Cita cancelada exitosamente"}


@router.post("/appointments/reschedule/{token}", response_model=AppointmentOut)
async def reschedule_appointment_by_token(
    token: str,
    data: RescheduleRequest,
    db: Session = Depends(get_db),
):
    if not token or len(token) != 64:
        raise HTTPException(status_code=400, detail="Token inválido")

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.cancellation_token == token,
            Appointment.status == "confirmed",
        )
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada o no puede ser reagendada")

    # Verificar regla de 24 horas
    appt_datetime = datetime.combine(appointment.appointment_date, appointment.appointment_time)
    hours_until = (appt_datetime - datetime.now()).total_seconds() / 3600
    if hours_until < 24:
        raise HTTPException(
            status_code=400,
            detail="Los cambios solo pueden realizarse con al menos 24 horas de anticipación",
        )

    # Validar nuevo slot
    service = db.query(Service).filter(Service.id == appointment.service_id).first()
    duration = service.duration_min if service else 60
    slots = get_available_slots(db, PROFESSIONAL_ID, data.appointment_date, duration)
    time_str = data.appointment_time.strftime("%H:%M")
    if not any(s["time"] == time_str for s in slots):
        raise HTTPException(status_code=409, detail="El horario seleccionado no está disponible")

    old_date = appointment.appointment_date
    old_time = appointment.appointment_time

    appointment.appointment_date = data.appointment_date
    appointment.appointment_time = data.appointment_time
    db.commit()
    db.refresh(appointment)

    service_name = service.name if service else ""
    try:
        await send_reschedule_patient(appointment, service_name, old_date, old_time)
        await send_reschedule_admin(appointment, service_name, old_date, old_time)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

    result = AppointmentOut.model_validate(appointment)
    result.service_name = service_name
    return result

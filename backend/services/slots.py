from datetime import date, time, datetime, timedelta
from sqlalchemy.orm import Session
from models import Schedule, Appointment


def get_available_slots(
    db: Session,
    professional_id: int,
    target_date: date,
    duration_min: int,
) -> list[dict]:
    day_of_week = target_date.weekday()
    # Python: 0=lunes ... 6=domingo → convertir a 0=domingo ... 6=sábado
    day_of_week = (day_of_week + 1) % 7

    blocks = (
        db.query(Schedule)
        .filter(
            Schedule.professional_id == professional_id,
            Schedule.day_of_week == day_of_week,
            Schedule.active == True,
        )
        .order_by(Schedule.start_time)
        .all()
    )

    if not blocks:
        return []

    booked = (
        db.query(Appointment.appointment_time)
        .filter(
            Appointment.professional_id == professional_id,
            Appointment.appointment_date == target_date,
            Appointment.status.notin_(["cancelled"]),
        )
        .all()
    )
    booked_times = {row.appointment_time for row in booked}

    now = datetime.now()
    slots: list[dict] = []

    for block in blocks:
        block_start = datetime.combine(target_date, block.start_time)
        block_end = datetime.combine(target_date, block.end_time)
        delta = timedelta(minutes=duration_min)

        current = block_start
        while current + delta <= block_end:
            slot_time = current.time()
            # No mostrar slots en el pasado
            if datetime.combine(target_date, slot_time) <= now:
                current += delta
                continue
            # No mostrar slots ya reservados
            if slot_time in booked_times:
                current += delta
                continue

            label = slot_time.strftime("%H:%M")
            slots.append({"time": label, "label": label})
            current += delta

    return slots


def get_days_with_availability(
    db: Session,
    professional_id: int,
    year: int,
    month: int,
    duration_min: int = 60,
) -> list[dict]:
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    # Obtener días de la semana que tienen horarios activos
    active_days = (
        db.query(Schedule.day_of_week)
        .filter(
            Schedule.professional_id == professional_id,
            Schedule.active == True,
        )
        .distinct()
        .all()
    )
    active_day_set = {row.day_of_week for row in active_days}

    results = []
    current = first_day
    today = date.today()

    while current <= last_day:
        # Convertir Python weekday a nuestro formato (0=dom)
        dow = (current.weekday() + 1) % 7

        available = False
        if current >= today and dow in active_day_set:
            slots = get_available_slots(db, professional_id, current, duration_min)
            available = len(slots) > 0

        results.append({
            "date": current.isoformat(),
            "available": available,
        })
        current += timedelta(days=1)

    return results

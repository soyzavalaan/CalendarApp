from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import public, admin
from config import get_settings
from models import Professional, Service, Schedule
from database import SessionLocal
from datetime import time

settings = get_settings()

app = FastAPI(title="Sistema de Citas", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router, tags=["Público"])
app.include_router(admin.router, tags=["Admin"])


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    # Crear profesional por defecto si no existe
    db = SessionLocal()
    try:
        if not db.query(Professional).filter(Professional.id == 1).first():
            db.add(Professional(
                id=1,
                name=settings.professional_name,
                email=settings.admin_email,
                specialty="",
                active=True,
            ))
            db.commit()

        # Crear servicios de ejemplo si no existen
        if db.query(Service).count() == 0:
            servicios = [
                Service(professional_id=1, name="Consulta General", description="Revisión médica general", duration_min=30, price=500, active=True),
                Service(professional_id=1, name="Consulta de Seguimiento", description="Seguimiento a tratamiento previo", duration_min=20, price=350, active=True),
                Service(professional_id=1, name="Valoración Inicial", description="Primera consulta con historial clínico completo", duration_min=45, price=700, active=True),
            ]
            db.add_all(servicios)
            db.commit()

        # Crear horarios de ejemplo si no existen (Lun-Vie 9:00-14:00)
        if db.query(Schedule).count() == 0:
            for day in range(1, 6):  # 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie
                db.add(Schedule(
                    professional_id=1,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(14, 0),
                    active=True,
                ))
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "service": "Sistema de Citas"}

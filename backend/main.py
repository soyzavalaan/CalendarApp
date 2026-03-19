from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import public, admin
from config import get_settings
from models import Professional
from database import SessionLocal

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
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "service": "Sistema de Citas"}

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, Time,
    DateTime, Numeric, ForeignKey, func,
)
from sqlalchemy.orm import relationship
from database import Base


class Professional(Base):
    __tablename__ = "professionals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    specialty = Column(String(100), nullable=False, default="")
    photo_url = Column(String(255), nullable=False, default="")
    active = Column(Boolean, nullable=False, default=True)
    paused_until = Column(Date, nullable=True)

    services = relationship("Service", back_populates="professional")
    schedules = relationship("Schedule", back_populates="professional")
    appointments = relationship("Appointment", back_populates="professional")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, autoincrement=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False, default="")
    duration_min = Column(Integer, nullable=False, default=60)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    active = Column(Boolean, nullable=False, default=True)

    professional = relationship("Professional", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=dom ... 6=sáb
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    modality = Column(String(20), nullable=False, default="presencial")
    active = Column(Boolean, nullable=False, default=True)

    professional = relationship("Professional", back_populates="schedules")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    patient_name = Column(String(100), nullable=False)
    patient_email = Column(String(100), nullable=False)
    patient_phone = Column(String(20), nullable=True)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    modality = Column(String(20), nullable=False, default="presencial")
    status = Column(String(20), nullable=False, default="confirmed")
    payment_status = Column(String(20), nullable=False, default="pending")
    payment_token = Column(String(16), nullable=False, default="")
    payment_receipt_url = Column(Text, nullable=False, default="")
    cancellation_token = Column(String(64), nullable=False, default="", index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    professional = relationship("Professional", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")

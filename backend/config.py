from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:///./booking.db"
    jwt_secret: str = "cambiar-este-secreto-en-produccion"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480
    admin_email: str = "admin@example.com"
    admin_password_hash: str = ""
    resend_api_key: str = ""
    notification_email: str = ""
    frontend_url: str = "http://localhost:5173"
    professional_name: str = "Profesional"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()

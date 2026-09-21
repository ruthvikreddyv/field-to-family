from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', case_sensitive=False, extra='ignore')
    database_url: str = 'postgresql+psycopg://f2f:f2f@localhost:5432/f2f'
    secret_key: str = 'dev-only-change-me'
    access_token_expire_minutes: int = 720
    frontend_origin: str = 'http://localhost:3000'
    farm_team_phone: str = '+91 90000 00000'
    farm_team_whatsapp: str = '919000000000'
    delivery_window_start: str = '05:00'
    delivery_window_end: str = '07:00'
    cutoff_time: str = '05:00'
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = 'orders@fieldtofamily.local'
    cookie_secure: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()

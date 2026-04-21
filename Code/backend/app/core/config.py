from pydantic_settings import BaseSettings
from pydantic import EmailStr
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "CoopConnect AI"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./coopconnect.db" if DEBUG else "postgresql://coopconnect:coopconnect123@localhost:5432/coopconnect"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Phone OTP (Twilio placeholder)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Security
    FRAUD_DETECTION_THRESHOLD: float = 0.8
    
    class Config:
        env_file = ".env"

settings = Settings()

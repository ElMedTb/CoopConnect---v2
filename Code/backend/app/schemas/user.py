from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserBase(BaseModel):
    email: EmailStr
    phone: str  # +33612345678 format

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v.startswith('+33') or len(v) != 13:
            raise ValueError('Phone must be +33XXXXXXXXX')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    role: str
    reputation_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

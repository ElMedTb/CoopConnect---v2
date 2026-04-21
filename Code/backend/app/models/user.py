from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base
import enum

class UserRole(enum.Enum):
    PARTICULIER = "particulier"
    COOPERATIVE = "cooperative" 
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Email + OTP
    role = Column(Enum(UserRole), default=UserRole.PARTICULIER)
    reputation_score = Column(Float, default=5.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    listings = relationship("Listing", back_populates="owner")
    matches = relationship("Match", foreign_keys="[Match.user1_id, Match.user2_id]")
    exchanges = relationship("Exchange", back_populates="user")

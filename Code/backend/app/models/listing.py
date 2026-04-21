from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base
import enum

class ListingType(enum.Enum):
    OFFRE = "offre"
    BESOIN = "besoin"
    DON = "don"

class ListingStatus(enum.Enum):
    ACTIVE = "active"
    EXPIRE = "expire"
    FINALISE = "finalise"

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ListingType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100))  # AI-generated
    keywords = Column(String(500))  # AI-extracted
    quantity = Column(Float, nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    address = Column(String(300))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="listings")
    matches_as_offer = relationship("Match", foreign_keys="[Match.listing1_id]")
    matches_as_need = relationship("Match", foreign_keys="[Match.listing2_id]")

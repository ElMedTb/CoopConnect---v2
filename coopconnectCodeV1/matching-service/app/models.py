from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ListingType(str, Enum):
    ITEM = "ITEM"
    SERVICE = "SERVICE"
    SKILL = "SKILL"
    SPACE = "SPACE"
    TRANSPORT = "TRANSPORT"


class ExchangeIntent(str, Enum):
    OFFER = "OFFER"
    NEED = "NEED"
    DONATE = "DONATE"


class ListingInput(BaseModel):
    id: str
    title: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    listing_type: Optional[ListingType] = None
    exchange_intent: Optional[ExchangeIntent] = None
    tags: Optional[list[str]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    owner_trust_score: Optional[float] = 3.0
    estimated_value: Optional[float] = None


class MatchRequest(BaseModel):
    query: ListingInput
    candidates: list[ListingInput]
    max_results: int = Field(default=10, ge=1, le=50)
    max_distance_km: Optional[float] = 100.0


class ScoreBreakdown(BaseModel):
    content_similarity: float
    category_match: float
    geo_score: float
    complementarity: float
    price_proximity: float
    trust_weight: float


class MatchResult(BaseModel):
    listing_id: str
    score: float
    score_breakdown: ScoreBreakdown
    distance_km: Optional[float] = None
    explanation: str


class MatchResponse(BaseModel):
    query_id: str
    matches: list[MatchResult]
    total_candidates: int


class RecommendationRequest(BaseModel):
    user_id: str
    user_categories: list[str] = []
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None
    all_listings: list[ListingInput] = []
    max_results: int = Field(default=10, ge=1, le=50)

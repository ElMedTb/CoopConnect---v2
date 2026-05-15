import os
import asyncio
from functools import partial
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.models import MatchRequest, MatchResponse, RecommendationRequest, ListingInput, ExchangeIntent
from app.matching import compute_matches
from app.price_estimator import clear_cache, _price_cache, estimate_price

router = APIRouter(prefix="/api/match", tags=["matching"])


@router.post("/", response_model=MatchResponse)
async def find_matches(request: MatchRequest):
    if not request.candidates:
        raise HTTPException(status_code=400, detail="No candidates provided")

    loop = asyncio.get_event_loop()
    matches = await loop.run_in_executor(
        None,
        partial(
            compute_matches,
            request.query,
            request.candidates,
            request.max_results,
            request.max_distance_km or 100.0,
        ),
    )

    return MatchResponse(
        query_id=request.query.id,
        matches=matches,
        total_candidates=len(request.candidates),
    )


@router.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    if not request.all_listings:
        return {"user_id": request.user_id, "recommendations": [], "total": 0}

    user_text = " ".join(request.user_categories)
    dummy_query = ListingInput(
        id="__user__",
        title=user_text or "ressources échanges coopération",
        description=user_text or "recherche ressources locales",
        latitude=request.user_latitude,
        longitude=request.user_longitude,
        exchange_intent=ExchangeIntent.NEED,
    )

    loop = asyncio.get_event_loop()
    matches = await loop.run_in_executor(
        None,
        partial(compute_matches, dummy_query, request.all_listings, request.max_results, 100.0),
    )

    return {
        "user_id": request.user_id,
        "recommendations": [m.model_dump() for m in matches],
        "total": len(matches),
    }


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "CoopConnect AI Matching",
        "gemini_enabled": bool(os.environ.get("GEMINI_API_KEY")),
        "price_cache_size": len(_price_cache),
    }


class PriceTestRequest(BaseModel):
    listing_id: str
    title: str
    description: str
    category: Optional[str] = None
    city: Optional[str] = None


@router.post("/estimate-price")
async def test_price_estimation(req: PriceTestRequest):
    loop = asyncio.get_event_loop()
    price = await loop.run_in_executor(
        None,
        partial(estimate_price, req.listing_id, req.title, req.description, req.category, req.city),
    )
    return {
        "listing_id": req.listing_id,
        "estimated_price_mad": price,
        "cache_size": len(_price_cache),
    }


@router.post("/cache/clear")
async def clear_price_cache():
    clear_cache()
    return {"status": "ok", "message": "Price cache cleared"}

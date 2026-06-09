import math
import re
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import ListingInput, MatchResult, ScoreBreakdown, ExchangeIntent
from app.price_estimator import estimate_price, price_proximity_score


COMPLEMENTARY_PAIRS = {
    (ExchangeIntent.OFFER, ExchangeIntent.OFFER),  # troc pur : les deux ont quelque chose à donner
    (ExchangeIntent.OFFER, ExchangeIntent.NEED),
    (ExchangeIntent.NEED, ExchangeIntent.OFFER),
    (ExchangeIntent.DONATE, ExchangeIntent.NEED),
    (ExchangeIntent.NEED, ExchangeIntent.DONATE),
}

WEIGHTS = {
    "content": 0.20,
    "category": 0.10,
    "geo": 0.25,
    "complementarity": 0.10,
    "price": 0.35,
}


def _preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _build_text(listing: ListingInput) -> str:
    parts = [listing.title, listing.description]
    if listing.tags:
        parts.extend(listing.tags)
    if listing.category:
        parts.append(listing.category)
    if listing.subcategory:
        parts.append(listing.subcategory)
    return _preprocess_text(" ".join(parts))


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _geo_score(query: ListingInput, candidate: ListingInput, max_km: float) -> tuple[float, Optional[float]]:
    if not all([query.latitude, query.longitude, candidate.latitude, candidate.longitude]):
        return 0.5, None
    dist = haversine_km(query.latitude, query.longitude, candidate.latitude, candidate.longitude)
    score = max(0.0, 1.0 - dist / max_km)
    return score, round(dist, 2)


def _category_score(query: ListingInput, candidate: ListingInput) -> float:
    if not query.category or not candidate.category:
        return 0.5
    if query.category == candidate.category:
        if query.subcategory and candidate.subcategory:
            return 1.0 if query.subcategory == candidate.subcategory else 0.85
        return 1.0
    return 0.1


def _complementarity_score(query: ListingInput, candidate: ListingInput) -> float:
    if not query.exchange_intent or not candidate.exchange_intent:
        return 0.5
    pair = (query.exchange_intent, candidate.exchange_intent)
    return 1.0 if pair in COMPLEMENTARY_PAIRS else 0.2


def _trust_score(candidate: ListingInput) -> float:
    raw = candidate.owner_trust_score or 0.0
    return max(0.0, min(1.0, raw / 5.0))


def _get_price(listing: ListingInput) -> Optional[float]:
    if listing.estimated_value and listing.estimated_value > 0:
        return listing.estimated_value
    return estimate_price(
        listing_id=listing.id,
        title=listing.title,
        description=listing.description,
        category=listing.category,
        city=listing.city,
    )


def _build_explanation(
    query: ListingInput,
    candidate: ListingInput,
    score: float,
    dist_km: Optional[float],
    breakdown: ScoreBreakdown,
    price_a: Optional[float],
    price_b: Optional[float],
) -> str:
    parts = []

    if breakdown.complementarity >= 0.9:
        pair = (query.exchange_intent, candidate.exchange_intent) if query.exchange_intent and candidate.exchange_intent else None
        if pair == (ExchangeIntent.OFFER, ExchangeIntent.OFFER):
            parts.append("Échange direct possible — les deux parties ont quelque chose à proposer")
        elif query.exchange_intent == ExchangeIntent.OFFER:
            parts.append("Votre offre répond directement à ce besoin")
        elif query.exchange_intent == ExchangeIntent.NEED:
            parts.append("Cette offre correspond à votre besoin")
        else:
            parts.append("Complémentarité forte détectée")

    if breakdown.content_similarity >= 0.7:
        parts.append(f"contenu très similaire ({int(breakdown.content_similarity * 100)}%)")
    elif breakdown.content_similarity >= 0.4:
        parts.append(f"contenu comparable ({int(breakdown.content_similarity * 100)}%)")

    if breakdown.category_match >= 0.9:
        parts.append("même catégorie")

    if breakdown.price_proximity >= 0.85 and price_a and price_b:
        avg = int((price_a + price_b) / 2)
        parts.append(f"valeur estimée similaire (~{avg} MAD)")
    elif breakdown.price_proximity >= 0.6 and price_a and price_b:
        parts.append(f"valeur comparable ({int(price_a)} MAD / {int(price_b)} MAD)")

    if dist_km is not None:
        if dist_km < 5:
            parts.append(f"à seulement {dist_km:.1f} km")
        elif dist_km < 20:
            parts.append(f"à {dist_km:.1f} km")
        else:
            parts.append(f"à {int(dist_km)} km")

    if not parts:
        parts.append(f"score de compatibilité : {int(score * 100)}%")

    return ", ".join(parts).capitalize() + "."


def compute_matches(
    query: ListingInput,
    candidates: list[ListingInput],
    max_results: int = 10,
    max_distance_km: float = 100.0,
) -> list[MatchResult]:
    if not candidates:
        return []

    query_text = _build_text(query)
    candidate_texts = [_build_text(c) for c in candidates]

    all_texts = [query_text] + candidate_texts
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_features=5000,
        sublinear_tf=True,
    )
    try:
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        query_vec = tfidf_matrix[0:1]
        candidate_vecs = tfidf_matrix[1:]
        content_scores = cosine_similarity(query_vec, candidate_vecs)[0]
    except Exception:
        content_scores = np.zeros(len(candidates))

    query_price = _get_price(query)

    results = []
    for i, candidate in enumerate(candidates):
        if candidate.id == query.id:
            continue

        content = float(content_scores[i])
        category = _category_score(query, candidate)
        geo, dist_km = _geo_score(query, candidate, max_distance_km)
        complementarity = _complementarity_score(query, candidate)

        if dist_km is not None and dist_km > max_distance_km:
            continue

        candidate_price = _get_price(candidate)
        price = price_proximity_score(query_price, candidate_price)

        composite = (
            content * WEIGHTS["content"]
            + category * WEIGHTS["category"]
            + geo * WEIGHTS["geo"]
            + complementarity * WEIGHTS["complementarity"]
            + price * WEIGHTS["price"]
        )

        breakdown = ScoreBreakdown(
            content_similarity=round(content, 3),
            category_match=round(category, 3),
            geo_score=round(geo, 3),
            complementarity=round(complementarity, 3),
            price_proximity=round(price, 3),
            trust_weight=0.0,
        )

        explanation = _build_explanation(
            query, candidate, composite, dist_km, breakdown, query_price, candidate_price
        )

        results.append(
            MatchResult(
                listing_id=candidate.id,
                score=round(composite, 4),
                score_breakdown=breakdown,
                distance_km=dist_km,
                explanation=explanation,
            )
        )

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:max_results]

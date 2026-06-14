import os
import re
import logging
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_price_cache: dict[str, float] = {}

_gemini_client = None


def _get_client():
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    try:
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        _gemini_client = genai.GenerativeModel(model_name)
    except Exception as e:
        logger.warning(f"Gemini client init failed: {e}")
        _gemini_client = None
    return _gemini_client


def estimate_price(
    listing_id: str,
    title: str,
    description: str,
    category: Optional[str],
    city: Optional[str],
) -> Optional[float]:
    if listing_id in _price_cache:
        return _price_cache[listing_id]

    client = _get_client()
    if client is None:
        return None

    location_hint = f", situé à {city}" if city else " au Maroc"
    category_hint = f", catégorie : {category}" if category else ""

    prompt = (
        f"Tu es un expert du marché de l'occasion au Maroc.\n"
        f"Bien physique{location_hint}{category_hint}.\n"
        f"Titre : {title}\n"
        f"Description : {description[:300]}\n\n"
        f"Estime la valeur marchande réaliste en dirhams marocains (MAD) "
        f"de ce bien physique dans le contexte marocain actuel "
        f"(référence : Avito.ma, Jumia Maroc, marchés locaux). "
        f"Réponds UNIQUEMENT avec un nombre entier, sans unité, sans explication."
    )

    try:
        response = client.generate_content(prompt)
        raw = response.text.strip()
        match = re.search(r"\d[\d\s]*", raw)
        if match:
            price = float(match.group().replace(" ", ""))
            _price_cache[listing_id] = price
            return price
    except Exception as e:
        logger.warning(f"Gemini price estimation failed for {listing_id}: {e}")

    return None


def price_proximity_score(price_a: Optional[float], price_b: Optional[float]) -> float:
    """Barter-tolerance scoring: ±10% = perfect, ±30% = acceptable, beyond = steep drop."""
    if price_a is None or price_b is None:
        return 0.5
    if price_a <= 0 or price_b <= 0:
        return 0.5
    ratio = abs(price_a - price_b) / max(price_a, price_b)
    if ratio <= 0.10:
        return 1.0
    elif ratio <= 0.30:
        return 1.0 - (ratio - 0.10) / 0.20 * 0.3
    else:
        return max(0.0, 0.7 - (ratio - 0.30) * 1.4)


def clear_cache():
    _price_cache.clear()

"""
sentiment.py — Pulls social sentiment signals from Elfa AI API.
Docs: https://elfaai.notion.site/Elfa-x-Pacifica-Powering-Hackathon-Teams-with-Social-Intelligence

Elfa AI provides:
  - Smart mention counts (Twitter/X, quality-filtered)
  - Sentiment score per token
  - Trending score
"""

import os
import requests

ELFA_API_KEY = os.getenv("ELFA_API_KEY", "")
ELFA_BASE_URL = "https://api.elfa.ai/v1"


def _elfa_get(path: str, params: dict = None) -> dict:
    headers = {"x-elfa-api-key": ELFA_API_KEY}
    url = f"{ELFA_BASE_URL}{path}"
    resp = requests.get(url, headers=headers, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_token_sentiment(symbol: str) -> dict:
    """
    Fetches sentiment + mention data for a token symbol (e.g. "BTC", "ETH").

    Returns:
        {
          "symbol": str,
          "sentiment_score": float,   # -1.0 (very bearish) to +1.0 (very bullish)
          "mention_count": int,       # smart mention count last 24h
          "trending_score": float,    # 0–100, how much it's spiking vs baseline
          "summary": str              # plain-English summary for the dashboard
        }
    """
    if not ELFA_API_KEY:
        return _mock_sentiment(symbol)

    try:
        data = _elfa_get("/mentions/token-stats", params={"symbol": symbol})
        sentiment = data.get("sentimentScore", 0.0)
        mentions = data.get("mentionCount", 0)
        trending = data.get("trendingScore", 0.0)

        return {
            "symbol": symbol,
            "sentiment_score": float(sentiment),
            "mention_count": int(mentions),
            "trending_score": float(trending),
            "summary": _build_summary(symbol, sentiment, mentions, trending),
        }
    except Exception as e:
        print(f"[Elfa] Warning: could not fetch sentiment for {symbol}: {e}")
        return _mock_sentiment(symbol)


def _build_summary(symbol: str, sentiment: float, mentions: int, trending: float) -> str:
    mood = "bullish" if sentiment > 0.2 else "bearish" if sentiment < -0.2 else "neutral"
    trend = "spiking" if trending > 60 else "elevated" if trending > 30 else "normal"
    return (
        f"{symbol} social mood is {mood} (score {sentiment:+.2f}), "
        f"with {mentions} quality mentions in 24h — trending activity is {trend}."
    )


def _mock_sentiment(symbol: str) -> dict:
    """Fallback mock if Elfa key not set — returns neutral data."""
    return {
        "symbol": symbol,
        "sentiment_score": 0.0,
        "mention_count": 0,
        "trending_score": 0.0,
        "summary": f"[Mock] No Elfa API key — sentiment data unavailable for {symbol}.",
    }
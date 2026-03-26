"""
market.py — Fetches market data from Pacifica REST API.
Endpoints used:
  GET /markets/prices          → latest mark/index prices
  GET /markets/candles         → OHLCV candles for trend signal
  GET /markets/funding/history → recent funding rates
"""

import os
import requests
from typing import Optional

BASE_URL = os.getenv("PACIFICA_BASE_URL", "https://test-api.pacifica.fi/api/v1")


def _get(path: str, params: dict = None) -> dict:
    url = f"{BASE_URL}{path}"
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_prices(symbol: str) -> dict:
    """
    Returns latest price info for a symbol.
    Example response keys: markPrice, indexPrice, lastPrice, change24h, volume24h
    """
    
    data = _get("/info/prices")

    for item in data.get("data", []):
        if item.get("symbol") == symbol:
            return item

    # raise ValueError(f"Symbol {symbol} not found")
    # # Pacifica returns a list; find our symbol
    # if isinstance(data, list):
    #     for item in data:
    #         if item.get("symbol") == symbol:
    #             return item
    #     raise ValueError(f"Symbol {symbol} not found in prices response")
    # return data


def get_candles(symbol: str, interval: str = "5m", limit: int = 20) -> list:
    """
    Returns OHLCV candles.
    interval options: 1m, 5m, 15m, 1h, 4h, 1d
    Each candle: [timestamp, open, high, low, close, volume]
    """
    data = _get("/markets/candles", params={
        "symbol": symbol,
        "interval": interval,
        "limit": limit,
    })
    return data if isinstance(data, list) else data.get("candles", [])


def get_funding_rate(symbol: str) -> Optional[float]:
    """
    Returns the latest funding rate for a symbol (as a float, e.g. 0.0001).
    Positive = longs pay shorts. Negative = shorts pay longs.
    """
    try:
        data = _get("/markets/funding/history", params={"symbol": symbol, "limit": 1})
        if isinstance(data, list) and data:
            return float(data[0].get("fundingRate", 0))
    except Exception:
        pass
    return None


def compute_rsi(closes: list, period: int = 14) -> Optional[float]:
    """Simple RSI from a list of close prices."""
    if len(closes) < period + 1:
        return None
    gains, losses = [], []
    for i in range(1, len(closes)):
        diff = closes[i] - closes[i - 1]
        gains.append(max(diff, 0))
        losses.append(max(-diff, 0))
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def get_market_snapshot(symbol: str) -> dict:
    prices = get_prices(symbol)

    return {
        "symbol": symbol,
        "mark_price": float(prices.get("mark", 0)),
        "index_price": float(prices.get("index", 0)),
        "change_24h": float(prices.get("change24h", 0)),
        "volume_24h": float(prices.get("volume24h", 0)),
        "rsi_14": None,              # ❌ no candles → no RSI
        "candles": [],
        "funding_rate": 0,           # ❌ not available
    }
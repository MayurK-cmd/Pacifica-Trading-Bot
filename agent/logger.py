"""
logger.py — Persists every agent decision + trade to trades.json.
Also prints a clean human-readable log to stdout.
The React dashboard reads trades.json to show the trade feed.
"""

import json
import os
from datetime import datetime, timezone

LOG_FILE = os.path.join(os.path.dirname(__file__), "..", "trades.json")


def _load() -> list:
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return []


def _save(trades: list):
    with open(LOG_FILE, "w") as f:
        json.dump(trades, f, indent=2)


def log_decision(decision: dict, market: dict, sentiment: dict, order_result: dict = None):
    """
    Logs a complete agent cycle.

    decision: from strategy.decide()
    market:   from market.get_market_snapshot()
    sentiment: from sentiment.get_token_sentiment()
    order_result: from executor.place_market_order() — None if HOLD
    """
    entry = {
        "id": datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_") + decision["symbol"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "symbol": decision["symbol"],
        "action": decision["action"],
        "confidence": decision["confidence"],
        "reasoning": decision["reasoning"],
        "size_pct": decision.get("size_pct", 0),
        "mark_price": decision.get("mark_price", market.get("mark_price")),
        "rsi_14": market.get("rsi_14"),
        "funding_rate": market.get("funding_rate"),
        "change_24h": market.get("change_24h"),
        "sentiment_score": sentiment.get("sentiment_score"),
        "mention_count": sentiment.get("mention_count"),
        "order": order_result,
        "pnl_usdc": None,   # filled in later by pnl tracker (future feature)
    }

    trades = _load()
    trades.insert(0, entry)   # newest first
    trades = trades[:500]     # keep last 500
    _save(trades)

    # Pretty stdout log
    action_emoji = {"LONG": "📈", "SHORT": "📉", "HOLD": "⏸️"}.get(decision["action"], "❓")
    print(
        f"\n{action_emoji}  [{entry['timestamp']}] {decision['symbol']} → {decision['action']} "
        f"(confidence {decision['confidence']:.0%})\n"
        f"   Price: ${decision.get('mark_price', '?'):,.2f}  |  RSI: {market.get('rsi_14', '?')}  "
        f"|  Sentiment: {sentiment.get('sentiment_score', 0):+.2f}\n"
        f"   Reason: {decision['reasoning']}\n"
    )

    return entry


def get_recent_trades(limit: int = 50) -> list:
    return _load()[:limit]
"""
strategy.py — Uses Gemini 2.5 Flash to decide long / short / hold
              based on market data + Elfa sentiment.

Returns a structured decision dict + a plain-English explanation
suitable for display in the dashboard.
"""

import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are PacificaPilot — an autonomous trading agent for Pacifica perpetuals markets.
You receive market data + social sentiment and must decide: LONG, SHORT, or HOLD.

Rules:
- Only go LONG or SHORT if there is a clear signal. Default to HOLD when uncertain.
- Consider RSI: below 35 is oversold (lean long), above 65 is overbought (lean short).
- Positive funding rate means crowded longs — be cautious going long.
- Negative funding rate means crowded shorts — be cautious going short.
- High sentiment + rising price = bullish confirmation.
- Negative sentiment + falling price = bearish confirmation.
- Always explain your reasoning in 2–3 plain-English sentences a non-expert can understand.

Respond ONLY with valid JSON in this exact format:
{
  "action": "LONG" | "SHORT" | "HOLD",
  "confidence": 0.0 to 1.0,
  "reasoning": "plain-English explanation here",
  "size_pct": 0.25 | 0.5 | 0.75 | 1.0
}
size_pct is fraction of MAX_POSITION_USDC to use (only matters if action is LONG or SHORT).
"""


def decide(market: dict, sentiment: dict) -> dict:
    """
    market: output of market.get_market_snapshot()
    sentiment: output of sentiment.get_token_sentiment()

    Returns:
    {
        "action": "LONG" | "SHORT" | "HOLD",
        "confidence": float,
        "reasoning": str,
        "size_pct": float,
        "symbol": str,
        "mark_price": float,
    }
    """
    user_message = f"""
Market data for {market['symbol']}:
- Mark price: {market['mark_price']}
- Index price: {market['index_price']}
- 24h change: {market['change_24h']}%
- RSI (14, 5m): {market['rsi_14']}
- Funding rate: {market['funding_rate']} (positive = longs pay shorts)

Social sentiment (Elfa AI):
- Sentiment score: {sentiment['sentiment_score']} (-1 bearish → +1 bullish)
- Mention count (24h): {sentiment['mention_count']}
- Trending score: {sentiment['trending_score']} (0–100)
- Summary: {sentiment['summary']}

What is your trading decision?
"""

    if not GEMINI_API_KEY:
        return _fallback_rule_based(market, sentiment)

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        response = model.generate_content(user_message)
        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        decision = json.loads(text)
        decision["symbol"] = market["symbol"]
        decision["mark_price"] = market["mark_price"]
        return decision

    except Exception as e:
        print(f"[Strategy] Gemini error for {market['symbol']}: {e}")
        return _fallback_rule_based(market, sentiment)


def _fallback_rule_based(market: dict, sentiment: dict) -> dict:
    """
    Simple rule-based fallback when Gemini is unavailable.
    Uses RSI + sentiment score only.
    """
    rsi = market.get("rsi_14") or 50
    sent = sentiment.get("sentiment_score", 0)
    funding = market.get("funding_rate") or 0

    action = "HOLD"
    confidence = 0.5
    reasoning = "Fallback rule-based decision (Gemini unavailable). "

    if rsi < 35 and sent > 0 and funding < 0.001:
        action = "LONG"
        confidence = 0.65
        reasoning += f"RSI={rsi} is oversold, sentiment is positive ({sent:+.2f}), funding not crowded long."
    elif rsi > 65 and sent < 0 and funding > -0.001:
        action = "SHORT"
        confidence = 0.65
        reasoning += f"RSI={rsi} is overbought, sentiment is negative ({sent:+.2f}), funding not crowded short."
    else:
        reasoning += f"No clear signal — RSI={rsi}, sentiment={sent:+.2f}, funding={funding}."

    return {
        "action": action,
        "confidence": confidence,
        "reasoning": reasoning,
        "size_pct": 0.5,
        "symbol": market["symbol"],
        "mark_price": market["mark_price"],
    }
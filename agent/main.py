"""
main.py — PacificaPilot agent loop.

Runs every LOOP_INTERVAL_SECONDS (default 5 min):
  1. Fetch market data (Pacifica API)
  2. Fetch sentiment (Elfa AI)
  3. Decide (Gemini 2.5 Flash)
  4. Execute (Pacifica SDK)
  5. Log (trades.json)

Usage:
    python main.py

Environment:
    Copy agent/.env.example → agent/.env and fill in your keys.
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the agent directory
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

import market as mkt
import sentiment as snt
import strategy as strat
import executor as exe
import logger as log

SYMBOLS = [s.strip() for s in os.getenv("TRADE_SYMBOLS", "BTC,ETH").split(",")]
INTERVAL = int(os.getenv("LOOP_INTERVAL_SECONDS", "300"))
MAX_POS = float(os.getenv("MAX_POSITION_USDC", "50"))
DRY_RUN = os.getenv("DRY_RUN", "true").lower() == "true"


def run_cycle():
    print(f"\n{'='*60}")
    print(f"🤖  PacificaPilot — running cycle for {SYMBOLS}")
    print(f"    Mode: {'DRY RUN' if DRY_RUN else '🔴 LIVE'}  |  Max position: ${MAX_POS} USDC")
    print(f"{'='*60}")

    for symbol in SYMBOLS:
        try:
            # 1. Market data
            print(f"\n[{symbol}] Fetching market data...")
            market_data = mkt.get_market_snapshot(symbol)
            print(f"  Price: ${market_data['mark_price']:,.2f}  RSI: {market_data['rsi_14']}  "
                  f"Funding: {market_data['funding_rate']}")

            # 2. Sentiment
            print(f"[{symbol}] Fetching Elfa AI sentiment...")
            sentiment_data = snt.get_token_sentiment(symbol)
            print(f"  Sentiment: {sentiment_data['sentiment_score']:+.2f}  "
                  f"Mentions: {sentiment_data['mention_count']}")

            # 3. Decide
            print(f"[{symbol}] Asking Gemini for decision...")
            decision = strat.decide(market_data, sentiment_data)
            print(f"  Decision: {decision['action']} (confidence {decision['confidence']:.0%})")

            # 4. Execute
            order_result = None
            if decision["action"] in ("LONG", "SHORT"):
                side = "bid" if decision["action"] == "LONG" else "ask"
                usdc_size = MAX_POS * decision.get("size_pct", 0.5)
                print(f"[{symbol}] Placing {decision['action']} order — ${usdc_size:.2f} USDC...")
                order_result = exe.place_market_order(symbol, side, usdc_size)
            else:
                print(f"[{symbol}] Holding — no order placed.")

            # 5. Log
            log.log_decision(decision, market_data, sentiment_data, order_result)

        except Exception as e:
            print(f"[{symbol}] ❌ Error during cycle: {e}")
            import traceback
            traceback.print_exc()


def main():
    print("\n🚀  PacificaPilot starting up...")
    print(f"   Watching: {SYMBOLS}")
    print(f"   Interval: every {INTERVAL}s")
    print(f"   Testnet:  {BASE_URL}")
    print(f"   DRY RUN:  {DRY_RUN}\n")

    # Run immediately, then loop
    run_cycle()
    while True:
        print(f"\n⏳  Sleeping {INTERVAL}s until next cycle...")
        time.sleep(INTERVAL)
        run_cycle()


BASE_URL = os.getenv("PACIFICA_BASE_URL", "https://test-api.pacifica.fi/api/v1")

if __name__ == "__main__":
    main()
"""
main.py — PacificaPilot agent loop.

Changes:
  - Fetches account info once per cycle
  - Passes account_context (balance, equity, spot holdings) to strategy.decide()
  - Agent will HOLD if available_to_spend is too low
"""

import os, time, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

import market as mkt
import sentiment as snt
import strategy as strat
import executor as exe
import logger as log

BACKEND_URL  = os.getenv("BACKEND_URL", "")
AGENT_SECRET = os.getenv("AGENT_API_SECRET", "")
DRY_RUN      = os.getenv("DRY_RUN", "true").lower() == "true"

if not BACKEND_URL:
    print("[FATAL] BACKEND_URL is not set. Agent cannot start.")
    exit(1)
if not AGENT_SECRET:
    print("[FATAL] AGENT_API_SECRET is not set. Agent cannot authenticate with backend.")
    exit(1)


def _agent_headers() -> dict:
    return {"Content-Type": "application/json", "x-agent-key": AGENT_SECRET}


def fetch_config() -> dict | None:
    try:
        r = requests.get(
            f"{BACKEND_URL}/api/agent/config",
            headers=_agent_headers(),
            timeout=5,
        )
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        log.push_log("[Config] Backend is not running — agent paused. Retry in 30s...")
        return None
    except requests.exceptions.Timeout:
        log.push_log("[Config] Backend timed out — agent paused. Retry in 30s...")
        return None
    except requests.exceptions.HTTPError as e:
        log.push_log(f"[Config] Backend returned error {e.response.status_code} — agent paused.")
        return None
    except Exception as e:
        log.push_log(f"[Config] Unexpected error: {e} — agent paused.")
        return None


def run_cycle(cfg: dict, cycle_count: int):
    symbols     = cfg["symbols"]
    max_pos     = cfg["maxPositionUsdc"]
    min_conf    = cfg["minConfidence"]
    wallet      = cfg["walletAddress"]
    stop_loss   = cfg["stopLossPct"]
    take_profit = cfg["takeProfitPct"]

    log.push_log(f"{'='*56}")
    log.push_log(f"[PacificaPilot] Cycle #{cycle_count} — {symbols}")
    log.push_log(f"  Mode: {'DRY RUN' if DRY_RUN else 'LIVE'}  |  Max: ${max_pos}  |  MinConf: {min_conf:.0%}")
    log.push_log(f"  Wallet: {wallet[:8]}...{wallet[-4:]}  |  SL: {stop_loss}%  TP: {take_profit}%")
    log.push_log(f"{'='*56}")

    # ── Fetch live account info ONCE per cycle ─────────────────────────────────
    account_context = None
    try:
        raw_account = exe.get_account_info(wallet)
        if raw_account:
            spot_balances = [
                {
                    "symbol": b.get("symbol"),
                    "amount": float(b.get("amount", 0) or 0),
                }
                for b in (raw_account.get("spot_balances") or [])
                if float(b.get("amount", 0) or 0) > 0
            ]
            account_context = {
                "usdcBalance":      float(raw_account.get("balance",            0) or 0),
                "accountEquity":    float(raw_account.get("account_equity",     0) or 0),
                "spotCollateral":   float(raw_account.get("spot_collateral",    0) or 0),
                "availableToSpend": float(raw_account.get("available_to_spend", 0) or 0),
                "usedMargin":       float(raw_account.get("total_margin_used",  0) or 0),
                "spotBalances":     spot_balances,
            }
            spot_str = ", ".join(
                f"{b['symbol']} {b['amount']}" for b in spot_balances
            ) or "none"
            log.push_log(
                f"  Account: USDC ${account_context['usdcBalance']:.2f}  "
                f"Equity ${account_context['accountEquity']:.2f}  "
                f"Free ${account_context['availableToSpend']:.2f}  "
                f"Spot: {spot_str}"
            )
    except Exception as e:
        log.push_log(f"  [Account] Could not fetch account info: {e} — proceeding without balance context")

    # ── Fetch live positions ───────────────────────────────────────────────────
    live_positions = exe.get_open_positions(wallet)
    if live_positions:
        log.push_log(f"  Open positions: {list(live_positions.keys())}")

    # ── Per-symbol loop ────────────────────────────────────────────────────────
    for symbol in symbols:
        try:
            # 1. Market data
            log.push_log(f"[{symbol}] Fetching market data...")
            market = mkt.get_market_snapshot(symbol)
            rsi_s  = f"{market['rsi_14']:.2f}" if market.get("rsi_14") else "N/A"
            rsi_1h = f"{market['rsi_1h']:.2f}"  if market.get("rsi_1h")  else "N/A"
            log.push_log(
                f"  Price: ${market['mark_price']:,.2f}  "
                f"RSI 5m: {rsi_s}  RSI 1h: {rsi_1h}  "
                f"Funding: {market['funding_rate']:.6f}"
            )

            current_price = market["mark_price"]

            # 2. Stop-loss / take-profit
            exit_triggered, exit_reason = exe.should_exit(
                symbol, current_price, stop_loss, take_profit
            )
            if exit_triggered:
                log.push_log(f"[{symbol}] EXIT triggered: {exit_reason}")
                pnl          = exe.compute_pnl(symbol, current_price)
                close_result = exe.close_position(symbol, reason=exit_reason)
                log.log_decision(
                    decision={
                        "action": "EXIT", "confidence": 1.0,
                        "reasoning": f"Auto-exit: {exit_reason}",
                        "size_pct": 0, "symbol": symbol, "mark_price": current_price,
                    },
                    market=market,
                    sentiment={"sentiment_score": 0, "mention_count": 0, "trending_score": 0, "summary": ""},
                    order_result=close_result,
                    pnl_usdc=pnl,
                )
                log.send_heartbeat(symbol=symbol)
                continue

            pos = live_positions.get(symbol)
            market["open_position"]  = (
                f"{pos['side']} ${pos['size']:.2f} @ ${pos['entry_price']:,.2f}"
                if pos else "None"
            )
            market["unrealized_pnl"] = f"${pos.get('unrealized_pnl', 0):.2f}" if pos else "N/A"

            # 3. Sentiment
            log.push_log(f"[{symbol}] Fetching Elfa AI sentiment...")
            sentiment = snt.get_token_sentiment(symbol)
            log.push_log(
                f"  Engagement: {sentiment['sentiment_score']:.2f}  "
                f"Mentions: {sentiment['mention_count']}  "
                f"Trending: {sentiment['trending_score']:.0f}"
            )

            # 4. Decision — passes account_context and max_pos to Gemini
            log.push_log(f"[{symbol}] Asking Gemini...")
            decision = strat.decide(market, sentiment, account_context, max_pos)
            log.push_log(
                f"  Decision: {decision['action']} "
                f"(conf {decision['confidence']:.0%})  "
                f"Reason: {decision['reasoning'][:100]}..."
            )

            # 5. Execute
            order_result = None
            pnl_usdc     = exe.compute_pnl(symbol, current_price)

            if decision["action"] in ("LONG", "SHORT"):
                if decision["confidence"] < min_conf:
                    log.push_log(
                        f"[{symbol}] Confidence {decision['confidence']:.0%} "
                        f"below min {min_conf:.0%} — skipping"
                    )
                    decision["action"] = "HOLD"
                elif pos and pos["side"] == ("bid" if decision["action"] == "LONG" else "ask"):
                    log.push_log(f"[{symbol}] Already in same-direction position — skipping")
                    decision["action"] = "HOLD"
                else:
                    side      = "bid" if decision["action"] == "LONG" else "ask"
                    usdc_size = max_pos * decision.get("size_pct", 0.5)
                    log.push_log(f"[{symbol}] Placing {decision['action']} ${usdc_size:.2f}...")
                    order_result = exe.place_market_order(symbol, side, usdc_size, max_pos)
                    if order_result and not order_result.get("skipped"):
                        exe.record_entry(symbol, side, current_price, usdc_size)
            else:
                log.push_log(f"[{symbol}] HOLD — no order placed")

            # 6. Log to backend
            log.log_decision(decision, market, sentiment, order_result, pnl_usdc=pnl_usdc)
            log.send_heartbeat(symbol=symbol)

        except Exception as e:
            import traceback
            log.push_log(f"[{symbol}] Cycle error: {e}")
            log.push_log(traceback.format_exc())
            log.send_heartbeat(symbol=symbol, error=str(e))


def main():
    log.push_log(f"[PacificaPilot] Starting — Backend: {BACKEND_URL}  DRY_RUN: {DRY_RUN}")
    log.push_log("[PacificaPilot] All trading config pulled from backend — env vars are NOT used as fallback.")
    cycle = 0

    while True:
        cfg = fetch_config()

        if cfg is None:
            time.sleep(30)
            continue

        if not cfg.get("enabled", False):
            log.push_log("[PacificaPilot] Agent disabled by user — sleeping 30s...")
            time.sleep(30)
            continue

        if not cfg.get("walletAddress"):
            log.push_log("[PacificaPilot] No walletAddress in config — complete onboarding first. Sleeping 60s...")
            time.sleep(60)
            continue

        if not cfg.get("symbols"):
            log.push_log("[PacificaPilot] No symbols configured — sleeping 30s...")
            time.sleep(30)
            continue

        run_cycle(cfg, cycle)
        cycle += 1

        interval = cfg.get("loopIntervalSeconds", 300)
        log.push_log(f"[PacificaPilot] Sleeping {interval}s until next cycle...")
        time.sleep(interval)


if __name__ == "__main__":
    main()
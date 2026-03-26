# 🤖 PacificaPilot

Autonomous AI trading agent for [Pacifica](https://pacifica.fi) perpetuals markets.

Monitors BTC/ETH perps → fetches sentiment via Elfa AI → makes long/short/hold decisions using Gemini 2.5 Flash → executes trades via Pacifica SDK → logs everything for the React dashboard.

**Tracks:** Trading Applications & Bots + Most Innovative Use of Pacifica (special award)

---

## Project Structure

```
pacifica-pilot/
├── agent/
│   ├── main.py          # agent loop (run this)
│   ├── market.py        # Pacifica REST API: prices, candles, funding
│   ├── sentiment.py     # Elfa AI: social signals
│   ├── strategy.py      # Gemini 2.5 Flash: decision engine
│   ├── executor.py      # Pacifica SDK: Ed25519 signing + order placement
│   ├── logger.py        # trade log → trades.json
│   └── .env.example     # copy to .env and fill in keys
├── trades.json          # auto-generated trade log (read by dashboard)
├── requirements.txt
└── README.md
```

---

## Setup & Build

### 1. Install Python dependencies

```bash
cd pacifica-pilot
pip install -r requirements.txt
```

### 2. Set up your keys

```bash
cp agent/.env.example agent/.env
```

Edit `agent/.env`:

```env
PACIFICA_PRIVATE_KEY=<your base58 private key from Pacifica testnet>
PACIFICA_BASE_URL=https://test-api.pacifica.fi/api/v1
ELFA_API_KEY=<from Elfa AI hackathon dashboard>
GEMINI_API_KEY=<from Google AI Studio>
TRADE_SYMBOLS=BTC,ETH
LOOP_INTERVAL_SECONDS=300
DRY_RUN=true          # ← keep true until you've tested
MAX_POSITION_USDC=50
```

### 3. Get your Pacifica private key (testnet)

1. Go to [https://test-app.pacifica.fi](https://test-app.pacifica.fi) (use invite code `Pacifica`)
2. Connect your wallet
3. Go to Settings → API Keys → Create Agent Key
4. Copy the Base58 private key → paste into `.env`

### 4. Test market data (no keys needed)

```bash
cd agent
python -c "import market; print(market.get_market_snapshot('BTC'))"
```

You should see price + RSI + funding data for BTC.

### 5. Run the agent (dry run first!)

```bash
cd agent
python main.py
```

With `DRY_RUN=true`, it will print decisions but NOT place real orders.  
Watch the output — every 5 minutes it will print something like:

```
📈  [2026-03-26T12:00:00] BTC → LONG (confidence 72%)
   Price: $87,500.00  |  RSI: 34.2  |  Sentiment: +0.41
   Reason: RSI is in oversold territory and social sentiment is bullish...
```

### 6. Enable live trading

Once happy with dry-run decisions:

```env
DRY_RUN=false
MAX_POSITION_USDC=50   # keep small for testnet
```

---

## How the Agent Decides

Every 5 minutes per symbol:

| Input | Source |
|-------|--------|
| Mark price, RSI, candles | Pacifica REST API |
| Funding rate | Pacifica REST API |
| Social sentiment, mentions | Elfa AI API |
| Decision + plain-English reason | Gemini 2.5 Flash |

**RSI < 35 + positive sentiment + low funding** → considers LONG  
**RSI > 65 + negative sentiment + high funding** → considers SHORT  
**Everything else** → HOLD

Gemini synthesizes all signals and writes a 2–3 sentence explanation for every decision.

---

## Dashboard (React)

The agent writes all decisions to `trades.json`. The React frontend reads this file and shows:
- Live trade feed with reasoning
- PnL chart over time  
- Sentiment gauge

*(Dashboard code in `/frontend` — run `npm run dev` from that folder)*

---

## API References

- [Pacifica REST API](https://pacifica.gitbook.io/docs/api-documentation/api/rest-api)
- [Pacifica Signing](https://pacifica.gitbook.io/docs/api-documentation/api/signing/implementation)
- [Elfa AI × Pacifica](https://elfaai.notion.site/Elfa-x-Pacifica-Powering-Hackathon-Teams-with-Social-Intelligence)
- [Hackathon Page](https://pacifica.gitbook.io/docs/hackathon/pacifica-hackathon)
# PacificaPilot 🤖

> **An autonomous AI trading agent for Pacifica Perpetual Futures — powered by Gemini AI, Elfa social intelligence, and a non-custodial security model.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-green.svg)](https://python.org)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://react.dev)
[![Track](https://img.shields.io/badge/track-Trading%20Applications%20%26%20Bots-orange.svg)]()
[![Hackathon](https://img.shields.io/badge/Pacifica-Hackathon%202026-purple.svg)]()

**🏆 Pacifica Hackathon Submission** — Trading Applications & Bots · Most Innovative Use of Pacifica

---

## 🎥 Demo

| Resource | Link |
|----------|------|
| **Live Dashboard** | [pacificia-trading-bot.vercel.app](https://pacificia-trading-bot.vercel.app) |
| **Backend API** | [pacificia-trading-bot.onrender.com](https://pacificia-trading-bot.onrender.com) |
| **Demo Video** | [https://youtu.be/LT4O4Zh5wqg](https://youtu.be/LT4O4Zh5wqg) |
| **Pacifica Testnet** | [test-app.pacifica.fi](https://test-app.pacifica.fi) |

---

## The Problem

Most retail traders on perpetual futures DEXs are at a systematic disadvantage — they lack the tooling to monitor funding rates, process social signals, and execute decisions at the speed institutions can. Existing bots are either too complex to set up, require handing over your private keys to a third party, or make decisions based on price data alone.

**PacificaPilot solves this.** It is a fully autonomous, non-custodial trading agent that combines on-chain market data, AI reasoning, and real-time social sentiment to trade Pacifica perpetuals on your behalf — while your private keys never leave your machine.

---

## What It Does

PacificaPilot runs a continuous decision loop for each symbol you configure:

1. **Fetches live market data** from Pacifica — mark price, RSI, funding rate, basis spread
2. **Pulls social sentiment** from Elfa AI — token mention counts, engagement scores, trending rank
3. **Sends everything to Gemini 2.5 Flash** — the AI reasons across all signals and returns LONG / SHORT / HOLD with a confidence score and written reasoning
4. **Executes the trade** on Pacifica if confidence clears your threshold
5. **Monitors open positions** with trailing stop-loss and take-profit, closes when triggered, logs realized PnL
6. **Streams all activity** to a live React dashboard — every decision, every trade, every log line, in real time

---

## Why It's Different

| Feature | PacificaPilot | Typical Trading Bot |
|---------|--------------|---------------------|
| AI Reasoning Engine | ✅ Gemini 2.5 Flash | ❌ Rule-based only |
| Social Sentiment Layer | ✅ Elfa AI integration | ❌ Price data only |
| Non-custodial by design | ✅ Keys never leave your machine | ❌ Often requires key upload |
| Live PnL Dashboard | ✅ Real-time unrealized + realized PnL | ❌ Terminal output or none |
| Sponsor Tool Depth | ✅ Pacifica + Elfa + Privy | — |
| Dry Run / Paper Mode | ✅ Default ON | ⚠️ Rarely included |
| Resilient Fallback | ✅ Binance kline circuit breaker | ❌ Fails silently |

---

## Sponsor Tools Used

| Sponsor | Integration |
|---------|------------|
| **Pacifica** | Core DEX — all market data fetching, order placement, and position management via the Pacifica REST + WebSocket API |
| **Elfa AI** | Social intelligence — token mention counts, engagement scores, and trending rank fed directly into the Gemini AI prompt |
| **Privy** | Wallet-based auth — users connect their Ethereum wallet; all dashboard routes are JWT-protected via Privy server SDK |

---

## Architecture

PacificaPilot uses a **hybrid security model**. The dashboard and backend are hosted — but the trading agent always runs on your own machine. Your Pacifica private key is used locally to sign transactions and is never transmitted anywhere.

```
┌──────────────────────────────────────────────┐
│           YOUR MACHINE  (Required)           │
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │           AGENT  (Python)            │   │
│   │                                      │   │
│   │  • Runs the trading loop 24/7        │   │
│   │  • Signs transactions locally        │   │
│   │  • Private key never transmitted     │   │
│   └──────────────────┬───────────────────┘   │
│                      │  HTTPS + x-agent-key  │
└──────────────────────┼───────────────────────┘
                       │
          ┌────────────▼──────────────┐
          │      BACKEND  (Render)    │
          │      Express + JWT Auth   │
          └───────────┬───────────────┘
               ┌──────┴───────┐
        ┌──────▼──────┐ ┌─────▼───────┐
        │  MongoDB    │ │  FRONTEND   │
        │  (Atlas)    │ │  (Vercel)   │
        │  Configs +  │ │  Dashboard  │
        │  Trade Logs │ │  + PnL View │
        └─────────────┘ └─────────────┘
```

| We Provide (Hosted) | You Run (Your Machine — Required) |
|---------------------|-----------------------------------|
| Frontend Dashboard (Vercel) | Agent (Python script) |
| Backend API (Render) | Your Pacifica private keys |
| MongoDB (configs, trade history) | Full control of funds |
| Authentication via Privy | Local `.env` configuration |

---

## Features

### 🧠 AI Decision Engine
- Gemini 2.5 Flash receives RSI (5m + 1h), funding rate, basis spread vs Binance, and Elfa sentiment in a single structured prompt
- Returns: direction (LONG / SHORT / HOLD), confidence (0–100%), position size (25/50/75/100%), and 2–3 sentence written reasoning
- Rule-based fallback activates automatically if the Gemini call fails — no silent failures

### 📊 Live PnL Dashboard (4 tabs)
- **Portfolio** — open positions, collateral balances, unrealized PnL per trade updated in real time
- **Decisions** — every AI decision logged with full reasoning, confidence score, and outcome
- **Logs** — live Server-Sent Events (SSE) stream of all agent activity with text filtering
- **Config** — edit all trading parameters from the browser; agent picks up changes on next cycle without restart

### 🔒 Non-Custodial Security
- Private keys stored only in your local `agent/.env` and used only to sign transactions on your machine
- Backend stores no private keys; AES-256-CBC encryption applied only if you optionally save API keys via the dashboard
- Agent authenticates to the backend via a shared `x-agent-key` secret over HTTPS

### ⚙️ Risk Management
- Trailing stop-loss with high-water mark tracking to lock in profits automatically
- Hard position size cap (configurable, default $50 USDC)
- Minimum AI confidence gate — no trade placed below your threshold
- Dry run mode ON by default — zero real orders until you explicitly disable it
- Circuit breaker: auto-fallback to Binance klines if Pacifica data API is unavailable

### 🔄 Multi-Symbol Parallel Execution
- Independent decision loops per symbol (BTC, ETH, SOL, and more)
- Each symbol has its own position state, trailing stop tracker, and cycle timer
- State persists across agent restarts via `positions.json`

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool |
| Privy | 3.x | Web3 authentication |
| React Router | 7.x | Client-side routing |
| Framer Motion | 12.x | Animations |
| Tailwind CSS | 4.x | Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.x | REST API server |
| MongoDB Atlas + Mongoose | 9.x | Database + ODM |
| Privy Server Auth | 1.x | JWT verification |
| AES-256-CBC | — | Key encryption at rest |

### Trading Agent
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| google-generativeai | 1.0+ | Gemini AI integration |
| solders | 0.18+ | Solana keypair + signing |
| requests | 2.31+ | HTTP client |
| websockets | 12.0+ | Pacifica WebSocket feed |
| python-dotenv | 1.0+ | Environment config |

### External APIs
| Service | Purpose |
|---------|---------|
| **Pacifica** | Perpetual futures DEX — trading, market data, positions |
| **Elfa AI** | Social sentiment — Twitter/X mentions and engagement |
| **Google Gemini 2.5 Flash** | AI trading decisions |
| **Privy** | Wallet authentication |
| **Binance** | Fallback kline data |

---

## Getting Started

### Prerequisites
- [Pacifica Testnet account](https://test-app.pacifica.fi) — use code `Pacifica`
- [Google Gemini API key](https://aistudio.google.com/app/apikey)
- [Elfa AI API key](https://elfa.ai) *(optional but strongly recommended)*
- Node.js 18+ and Python 3.11+

### 1. Clone

```bash
git clone https://github.com/MayurK-cmd/Pacifica-Trading-Bot.git
cd Pacifica-Trading-Bot
```

### 2. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../agent && pip install -r requirements.txt
```

### 3. Configure Environment Files

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pacifica-pilot
PRIVY_APP_ID=<your_privy_app_id>
PRIVY_APP_SECRET=<your_privy_app_secret>
ENCRYPTION_SECRET=<random_32_char_hex>
AGENT_API_SECRET=<secure_random_string>
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3001
VITE_PRIVY_APP_ID=<your_privy_app_id>
```

**`agent/.env`**
```env
BACKEND_URL=http://localhost:3001
AGENT_API_SECRET=<same_as_backend>

PACIFICA_BASE_URL=https://test-api.pacifica.fi/api/v1
PACIFICA_WS_URL=wss://test-ws.pacifica.fi/ws
PACIFICA_PRIVATE_KEY=<your_base58_private_key>
PACIFICA_AGENT_PRIVATE_KEY=<agent_wallet_secret>
PACIFICA_AGENT_PUBLIC_KEY=<agent_api_key>

GEMINI_API_KEY=<your_gemini_key>
ELFA_API_KEY=<your_elfa_key>

DRY_RUN=true
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm start          # → http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm run dev       # → http://localhost:5173

# Terminal 3 — Agent (must run locally; your private key stays on your machine)
cd agent && python main.py
```

Open the dashboard, connect your wallet, configure your parameters, and watch the agent trade.

---

## Trading Logic

### Decision Cycle (per symbol, every 5 min by default)

```
FETCH market data  (Pacifica)
  └─► FETCH sentiment  (Elfa AI)
        └─► PROMPT Gemini 2.5 Flash with all signals
              └─► IF confidence > threshold AND no open position
                    └─► PLACE market order  (Pacifica)
                          └─► TRACK with trailing stop-loss
                                └─► CLOSE on SL/TP hit → LOG realized PnL
```

### Signal Reference

| Signal | Source | Bullish | Bearish |
|--------|--------|---------|---------|
| RSI-14 (1h) | Pacifica / Binance fallback | < 35 (oversold) | > 65 (overbought) |
| RSI-14 (5m) | Pacifica / Binance fallback | < 35 | > 65 |
| Funding Rate | Pacifica | Negative (shorts pay longs) | Positive (longs pay shorts) |
| Basis Spread | Pacifica vs Binance | Pacifica < Binance | > 2% premium flag |
| Social Engagement | Elfa AI | High score + trending | Low / falling score |

### Risk Profiles

| Profile | Stop Loss | Take Profit | Min Confidence |
|---------|-----------|-------------|----------------|
| Conservative | 2% | 4% | 75% |
| Balanced (default) | 3% | 6% | 60% |
| Aggressive | 5% | 10% | 45% |

---

## Pacifica API Integration

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /order/create_market` | Execute LONG / SHORT trades |
| `GET /api/v1/info/prices` | Real-time mark prices |
| `GET /api/v1/position` | Fetch open positions |
| `GET /api/v1/balance` | Account balance and equity |
| `GET /api/v1/trades` | Trade history |
| `GET /api/v1/funding` | Funding rate data |
| `GET /api/v1/orderbook` | Order book depth |

**Authentication:** Ed25519-signed requests using Pacifica API keypair.

---

## Configuration Reference

All parameters are editable live from the **Config tab** — no agent restart needed.

| Parameter | Default | Description |
|-----------|---------|-------------|
| Symbols | BTC, ETH | Comma-separated trading pairs |
| Loop Interval | 300s | Seconds between decision cycles |
| Max Position | $50 USDC | Hard cap per trade |
| Min Confidence | 60% | AI confidence gate |
| Stop Loss | 3% | Trailing stop distance |
| Take Profit | 6% | Exit target |
| Risk Level | Balanced | conservative / balanced / aggressive |
| Dry Run | true | Paper trade with real market data |
| Binance Fallback | true | Use Binance klines if Pacifica unavailable |

---

## API Reference

### User Routes (JWT via Privy)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Register / sync wallet user |
| POST | `/api/auth/keys` | Save encrypted Pacifica keys |
| GET | `/api/auth/me` | Get user profile |
| GET | `/api/config` | Fetch trading config |
| POST | `/api/config` | Update trading config |
| GET | `/api/trades` | Full trade history |
| GET | `/api/trades/stats` | Aggregated PnL stats |
| GET | `/api/portfolio` | Portfolio balances + open positions |

### Agent Routes (`x-agent-key` header)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/config` | Pull current config |
| POST | `/api/agent/heartbeat` | Send liveness ping |
| POST | `/api/agent/toggle` | Enable / disable agent |
| POST | `/api/trades` | Log executed trade + PnL |
| POST | `/api/logs` | Push log entry |

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/status` | Agent online / offline status |
| GET | `/api/logs` | Recent log entries |
| GET | `/api/logs/stream` | SSE live log stream |

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  privyUserId: String,            // unique
  email: String,
  walletAddress: String,          // Ethereum wallet from Privy
  pacificaAddress: String,        // Solana wallet pubkey
  pacificaPrivateKey: String,     // AES-256 encrypted
  pacificaApiKey: String,         // AES-256 encrypted
  onboarded: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Config Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,               // ref: User (unique)
  symbols: [String],              // e.g. ["BTC", "ETH"]
  loopIntervalSeconds: Number,    // default: 300
  maxPositionUsdc: Number,        // default: 50
  minConfidence: Number,          // default: 0.6
  stopLossPct: Number,            // default: 3.0
  takeProfitPct: Number,          // default: 6.0
  dryRun: Boolean,                // default: true
  enabled: Boolean,               // default: false
  createdAt: Date,
  updatedAt: Date
}
```

### Trades Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,               // ref: User
  symbol: String,
  action: String,                 // LONG / SHORT / HOLD / EXIT
  confidence: Number,
  reasoning: String,
  size_pct: Number,
  pnl_usdc: Number,
  createdAt: Date
}
```

---

## Security Model

| Asset | Where It Lives | Protection |
|-------|---------------|------------|
| Pacifica private key | Your local `agent/.env` | Never transmitted |
| Pacifica agent key | Your local `agent/.env` | Never transmitted |
| User wallet | Browser (Privy-managed) | Privy handles custody |
| Optional stored API keys | MongoDB Atlas | AES-256-CBC encrypted |
| Agent ↔ Backend | `x-agent-key` over HTTPS | Shared secret |
| User ↔ Backend | JWT | Signed by Privy wallet |

---

## Project Structure

```
pacifica-pilot/
├── agent/                    # Python trading agent
│   ├── main.py              # Main loop (entry point)
│   ├── executor.py          # Order execution
│   ├── market.py            # Market data + RSI
│   ├── sentiment.py         # Elfa AI sentiment
│   ├── strategy.py          # Gemini AI decisions
│   └── logger.py            # Log streaming
│
├── backend/                  # Node.js Express API
│   ├── index.js             # Server entry point
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   └── middleware/          # Auth + encryption
│
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── App.jsx          # Main app
│   │   ├── Dashboard.jsx    # 4-tab dashboard
│   │   ├── LoginPage.jsx    # Privy login
│   │   ├── Onboarding.jsx   # Pacifica key setup
│   │   └── tabs/            # Portfolio, Config, Decisions, Logs
│   └── vercel.json          # Vercel config
│
├── requirements.txt          # Python dependencies
└── README.md
```

---

## Deployment

The backend and frontend can be hosted. **The agent must run on your local machine** — this is the security guarantee, not a limitation. Your private key signs all transactions locally and never touches any remote server.

### Backend → Render
```
Root Directory: backend
Build Command:  npm install
Start Command:  npm start
```

### Frontend → Vercel
```
Root Directory: frontend
Build Command:  npm run build
Output Dir:     dist
```
`vercel.json` is included in the frontend directory.

### Agent → Your Machine Only
```bash
cd agent && python main.py
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Agent shows Offline | Toggle "Enabled" ON in the Config tab |
| Agent won't connect | Verify `BACKEND_URL` and `AGENT_API_SECRET` match on both sides |
| No market data | Check Pacifica keys; enable Binance fallback in Config |
| Login fails | Verify Privy App ID / Secret; check MongoDB connection |
| PnL not updating | Confirm agent is running and heartbeating; check the Logs tab |
| Circuit breaker active | Pacifica API degraded; Binance fallback takes over automatically |

Enable verbose agent logging:
```python
# agent/main.py
DEBUG = True
```

---

## Contributing

1. Fork the repo
2. `git checkout -b feature/your-feature`
3. `git commit -am 'Add feature'`
4. `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE)

---

## Acknowledgements

Built during the [Pacifica Hackathon 2026](https://pacifica.gitbook.io/docs/hackathon/pacifica-hackathon).

| Tool | Role |
|------|------|
| [Pacifica](https://pacifica.fi) | Perpetuals DEX + API |
| [Elfa AI](https://elfa.ai) | Social sentiment intelligence |
| [Privy](https://privy.io) | Wallet authentication |
| [Google Gemini](https://ai.google.dev) | AI reasoning engine |

---

## Disclaimer

Trading perpetual futures involves substantial risk, including potential loss of your entire position. Always run in **dry run mode** first and verify behaviour before switching to live trading. Past strategy performance does not guarantee future results. You are solely responsible for your trading decisions.
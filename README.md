# PacificaPilot

Autonomous AI trading agent for Pacifica perpetual futures markets, with a real-time React dashboard for monitoring and configuration.

**Hackathon Tracks:** Trading Applications & Bots + Most Innovative Use of Pacifica

---

## 🏆 Pacifica Hackathon Submission

**Eligibility:** This project uses Pacifica API for all trading operations and market data.

### Pacifica API Endpoints Used
| Endpoint | Purpose |
|----------|---------|
| `POST /order/create_market` | Execute LONG/SHORT trades |
| `GET /api/v1/info/prices` | Real-time mark prices |
| `GET /api/v1/position` | Fetch open positions |
| `GET /api/v1/balance` | Account balance & equity |
| `GET /api/v1/trades` | Trade history |
| `GET /api/v1/funding` | Funding rate data |
| `GET /api/v1/orderbook` | Order book depth |

**Authentication:** Ed25519-signed requests using Pacifica API keypair.

---

## Overview

PacificaPilot is a full-stack autonomous trading system that:
- Fetches real-time market data from Pacifica (perpetual futures DEX on Solana)
- Enriches data with social sentiment from Elfa AI
- Makes trading decisions using Google Gemini 2.5 Flash AI
- Executes trades via Pacifica's API with proper position management
- Streams live logs and decisions to a React dashboard

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| Privy | Web3 authentication (wallet login) |
| CSS Variables | Theming system |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Privy Server Auth | JWT verification |
| AES-256-CBC | Encryption for sensitive keys |
| CORS | Cross-origin requests |

### Trading Agent
| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Runtime |
| Requests | HTTP client |
| Google GenAI SDK | Gemini AI integration |
| Solders | Solana keypair management |
| python-dotenv | Environment configuration |

### External APIs
| Service | Purpose |
|---------|---------|
| Pacifica | Perpetual futures trading, market data |
| Elfa AI | Social sentiment analysis (Twitter/X) |
| Google Gemini 2.5 Flash | AI trading decisions |
| Binance | Fallback kline data |
| Privy | Wallet authentication |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                    │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐   │
│  │  Login   │→ │ Onboarding │→ │ Dashboard │→ │   Config    │   │
│  │ (Privy)  │  │ (Keys)     │  │ (4 tabs)  │  │  Settings   │   │
│  └──────────┘  └────────────┘  └───────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ JWT Auth
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express + MongoDB)                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  /api/auth      │  /api/config  │  /api/trades           │   │
│  │  /api/portfolio │  /api/agent   │  /api/logs (SSE)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐      ┌─────────────┐     ┌─────────────┐       │
│  │  MongoDB    │      │  AES-256    │     │  In-Memory  │       │
│  │  (Users,    │      │  Encryption │     │  Log Buffer │       │
│  │   Config)   │      │  (Keys)     │     │  (500 lines)│       │
│  └─────────────┘      └─────────────┘     └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │ x-agent-key
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT (Python 3.11+)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN LOOP: Every 5 min per symbol                       │   │
│  │  1. Fetch config from backend /api/agent/config          │   │
│  │  2. Get market snapshot (RSI 5m+1h, funding, price)      │   │
│  │  3. Fetch Elfa AI sentiment                              │   │
│  │  4. Ask Gemini for decision (LONG/SHORT/HOLD)            │   │
│  │  5. Execute order if confidence > threshold              │   │
│  │  6. Log decision + send heartbeat                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐      ┌─────────────┐     ┌─────────────┐       │
│  │  market.py  │      │ sentiment.py│     │ strategy.py │       │
│  │  - RSI 14   │      │  - Elfa AI  │     │  - Gemini   │       │
│  │  - Funding  │      │  - Trending │     │  - Fallback │       │
│  │  - Binance  │      │  - Score    │     │  - Rules    │       │
│  │    fallback │      │             │     │             │       │
│  └─────────────┘      └─────────────┘     └─────────────┘       │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   executor.py                           │    │
│  │  - Place market orders (create_market)                  │    │
│  │  - Close positions (reduce_only)                        │    │
│  │  - Track positions in-memory                            │    │
│  │  - Sign requests with Ed25519                           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │ Ed25519 signed
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pacifica  │  │   Elfa AI   │  │   Gemini    │              │
│  │  perpetual  │  │  sentiment  │  │  2.5 Flash  │              │
│  │    futures  │  │  analysis   │  │  AI engine  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
pacifica-plot/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── App.jsx          # Main app with auth routing
│   │   ├── Dashboard.jsx    # 4-tab dashboard
│   │   ├── LoginPage.jsx    # Privy login
│   │   ├── Onboarding.jsx   # Pacifica key setup
│   │   ├── useApi.js        # API hook with JWT
│   │   ├── components/
│   │   │   └── AgentStatusBar.jsx  # Live status + toggle
│   │   └── tabs/
│   │       ├── PortfolioTab.jsx    # Balances + positions
│   │       ├── ConfigTab.jsx       # Agent settings
│   │       ├── DecisionsTab.jsx    # Trade history
│   │       └── LogsTab.jsx         # Live SSE logs
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express + MongoDB
│   ├── index.js             # Server entry point
│   ├── models/
│   │   ├── User.js          # User + encrypted keys
│   │   └── Config.js        # Agent config
│   ├── routes/
│   │   ├── auth.js          # Privy sync, keys
│   │   ├── config.js        # CRUD config
│   │   ├── trades.js        # Trade history
│   │   ├── portfolio.js     # Pacifica data
│   │   ├── agent.js         # Heartbeat, status
│   │   └── logs.js          # Log buffer + SSE
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── crypto.js        # AES encryption
│   └── package.json
│
├── agent/                    # Python trading agent
│   ├── main.py              # Main loop
│   ├── executor.py          # Order execution
│   ├── market.py            # Market data + RSI
│   ├── sentiment.py         # Elfa AI sentiment
│   ├── strategy.py          # Gemini decisions
│   ├── logger.py            # Log streaming
│   └── .env                 # Agent config
│
└── README.md
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  privyUserId: String (unique),
  email: String,
  walletAddress: String,           // Ethereum wallet from Privy
  pacificaAddress: String,         // Solana wallet pubkey
  pacificaPrivateKey: String,      // AES-256 encrypted
  pacificaApiKey: String,          // AES-256 encrypted
  onboarded: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Config Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  symbols: [String],               // e.g., ["BTC", "ETH"]
  loopIntervalSeconds: Number,     // default: 300
  maxPositionUsdc: Number,         // default: 50
  minConfidence: Number,           // default: 0.6
  dryRun: Boolean,                 // default: true
  riskLevel: String,               // conservative/balanced/aggressive
  enabled: Boolean,                // default: true
  stopLossPct: Number,             // default: 3.0
  takeProfitPct: Number,           // default: 6.0
  useBinanceFallback: Boolean,     // default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Trades Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  symbol: String,
  action: String,                  // LONG/SHORT/HOLD/EXIT
  confidence: Number,
  reasoning: String,
  size_pct: Number,
  mark_price: Number,
  rsi_14: Number,
  rsi_1h: Number,
  funding_rate: Number,
  sentiment_score: Number,
  order: Object,
  dry_run: Boolean,
  pnl_usdc: Number,
  createdAt: Date
}
```

---

## Deployment Guide

### Prerequisites

1. **MongoDB Atlas** - Free tier at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Privy App** - Create at [privy.io](https://privy.io)
3. **Pacifica Account** - Set up at [test-app.pacifica.fi](https://test-app.pacifica.fi)
4. **Elfa AI API Key** - Get from [elfa.ai](https://elfa.ai)
5. **Google Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com)
6. **Node.js 18+** and **Python 3.11+**

---

### Step 1: Clone and Install Dependencies

```bash
cd pacifica-plot

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Agent
cd ../agent
pip install requests google-genai solders python-dotenv websockets
```

---

### Step 2: Configure Backend

Create `backend/.env`:

```env
# MongoDB Atlas connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pacifica-pilot

# Privy authentication (from privy.io dashboard)
PRIVY_APP_ID=<your_privy_app_id>
PRIVY_APP_SECRET=<your_privy_app_secret>

# AES-256 encryption key (generate random 32-char hex)
ENCRYPTION_SECRET=<random_32_char_hex_string>

# Agent authentication (must match agent/.env)
AGENT_API_SECRET=<secure_random_string_for_agent>
```

---

### Step 3: Configure Frontend

Create `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001
```

---

### Step 4: Configure Agent

Create `agent/.env`:

```env
# Backend connection
BACKEND_URL=http://localhost:3001
AGENT_API_SECRET=<same_as_backend>

# Pacifica API (testnet)
PACIFICA_BASE_URL=https://test-api.pacifica.fi/api/v1
PACIFICA_WS_URL=wss://test-ws.pacifica.fi/ws
PACIFICA_PRIVATE_KEY=<your_main_wallet_private_key_base58>
PACIFICA_AGENT_PRIVATE_KEY=<agent_wallet_private_key>
PACIFICA_AGENT_API_KEY=<agent_api_key_from_pacifica>

# AI services
GEMINI_API_KEY=<your_gemini_key>
ELFA_API_KEY=<your_elfa_key>

# Safety - START WITH DRY_RUN=true
DRY_RUN=true

# Trading parameters (can also set via dashboard)
TRADE_SYMBOLS=BTC,ETH
LOOP_INTERVAL_SECONDS=300
MAX_POSITION_USDC=50
MIN_CONFIDENCE=0.6
STOP_LOSS_PCT=3.0
TAKE_PROFIT_PCT=6.0
USE_BINANCE_KLINE_FALLBACK=true
```

---

### Step 5: Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend: http://localhost:5173
```

**Terminal 3 - Agent:**
```bash
cd agent
python main.py
# Agent polls backend every 5 minutes
```

---

### Step 6: User Onboarding

1. **Open frontend** at http://localhost:5173

2. **Login with Privy** - Click "Login / Connect Wallet"

3. **Complete Onboarding** - Enter:
   - **Solana wallet address**: Your Phantom wallet pubkey (main wallet)
   - **Agent private key**: From test-app.pacifica.fi/apikey (the "Secret")
   - **Agent API key**: From test-app.pacifica.fi/apikey (the "API Key")

4. **Configure Agent** (Config tab):
   - Select symbols: BTC, ETH, SOL, etc. (max 10)
   - Set max position size ($50 default)
   - Set min confidence (60% default)
   - Set stop-loss (3%) and take-profit (6%)
   - Enable "Dry run" for testing
   - Toggle "Enabled" to start the agent

5. **Monitor** (Dashboard tabs):
   - **Portfolio**: Pacifica account balances and positions
   - **Config**: Live agent settings
   - **Decisions**: AI trading decisions with reasoning
   - **Logs**: Real-time log stream via SSE

---

## Agent Status Bar

The status bar below the navigation shows:
- **Green dot**: Agent running (heartbeat received)
- **Yellow dot**: Enabled but offline (starting up)
- **Grey**: Disabled (toggle to enable)

---

## API Reference

### Authentication Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/sync` | JWT | Sync Privy user |
| POST | `/api/auth/keys` | JWT | Save Pacifica keys |
| GET | `/api/auth/me` | JWT | Get user profile |

### Config Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/config` | JWT | Get config |
| POST | `/api/config` | JWT | Update config |

### Agent Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/agent/config` | x-agent-key | Get trading config |
| POST | `/api/agent/heartbeat` | x-agent-key | Send heartbeat |
| GET | `/api/agent/status` | None | Get agent status |
| POST | `/api/agent/toggle` | JWT | Enable/disable agent |

### Trading Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trades` | JWT | Get trade history |
| GET | `/api/trades/stats` | JWT | Get stats |
| POST | `/api/trades` | x-agent-key | Log trade |
| GET | `/api/portfolio` | JWT | Get portfolio |

### Log Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/logs` | None | Get logs |
| GET | `/api/logs/stream` | None | SSE stream |
| POST | `/api/logs` | x-agent-key | Push log |

---

## Trading Decision Flow

Every cycle (default: 5 minutes) for each symbol:

```
1. FETCH MARKET DATA
   ├─ Mark price from Pacifica
   ├─ RSI-14 (5-minute candles)
   ├─ RSI-14 (1-hour candles)
   ├─ Funding rate
   └─ 24h volume/change

2. FETCH SENTIMENT
   ├─ Elfa AI top mentions (24h)
   ├─ Engagement score (0-1)
   ├─ Trending rank (0-100)
   └─ Mention count

3. AI DECISION (Gemini 2.5 Flash)
   ├─ Analyzes all signals
   ├─ Returns: LONG/SHORT/HOLD
   ├─ Confidence: 0-100%
   ├─ Size: 25%/50%/75%/100%
   └─ Reasoning: 2-3 sentences

4. EXECUTE (if confidence > threshold)
   ├─ Check no existing position
   ├─ Place market order
   ├─ Track entry price
   └─ Log decision

5. MONITOR EXISTING POSITIONS
   ├─ Check stop-loss/take-profit
   ├─ Close if triggered
   └─ Log PnL
```

---

## Decision Logic

| Signal | Bullish | Bearish |
|--------|---------|---------|
| RSI-14 (1h) | < 35 (oversold) | > 65 (overbought) |
| RSI-14 (5m) | < 35 | > 65 |
| Funding Rate | Negative (shorts pay) | Positive (longs pay) |
| Sentiment Score | High engagement | Low engagement |

**Gemini synthesizes all signals** and outputs a plain-English explanation.

---

## Security

1. **Key Encryption**: Pacifica keys encrypted with AES-256-CBC before MongoDB storage
2. **JWT Auth**: All user routes require Privy JWT verification
3. **Agent Auth**: Agent routes use `x-agent-key` header
4. **Dry Run Default**: Agent starts in simulation mode

---

## Troubleshooting

### "Agent disabled" message
- Go to Config tab → Toggle "Enabled" ON
- Or use the toggle in the Agent Status Bar

### Agent won't connect
- Verify `BACKEND_URL` matches your backend
- Ensure `AGENT_API_SECRET` matches in both `.env` files
- Check backend is running (http://localhost:3001/health)

### No market data
- Verify Pacifica keys are correct
- Enable Binance fallback in config
- Check logs for circuit breaker messages

### Login fails
- Verify Privy app ID/secret in backend/.env
- Check MongoDB connection
- Ensure frontend VITE_API_URL is correct

---

## Production Deployment

### Backend (Render/Railway)
```env
MONGODB_URI=<mongodb_atlas_uri>
PRIVY_APP_ID=<privy_id>
PRIVY_APP_SECRET=<privy_secret>
ENCRYPTION_SECRET=<32_char_hex>
AGENT_API_SECRET=<secure_string>
PORT=3001
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
```

### Agent (VPS)
```env
BACKEND_URL=https://your-backend.onrender.com
AGENT_API_SECRET=<same_as_backend>
DRY_RUN=false  # Production only!
```

---

## External Resources

- [Pacifica Docs](https://pacifica.gitbook.io/docs)
- [Elfa AI x Pacifica](https://elfaai.notion.site/Elfa-x-Pacifica)
- [Google Gemini API](https://ai.google.dev)
- [Privy Docs](https://docs.privy.io)

---

## License

MIT

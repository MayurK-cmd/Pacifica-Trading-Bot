# PacificaPilot

> **Autonomous AI Trading Agent for Pacifica Perpetual Futures Markets**

A full-stack trading system that combines real-time market data, AI-powered decision making, and social sentiment analysis to execute autonomous trades on Pacifica's perpetual futures DEX.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Trading Logic](#trading-logic)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

PacificaPilot is an autonomous trading agent that:

- **Fetches real-time market data** from Pacifica (perpetual futures DEX on Solana)
- **Analyzes social sentiment** using Elfa AI (Twitter/X mentions and engagement)
- **Makes AI-powered decisions** using Google Gemini 2.5 Flash
- **Executes trades** with proper position management and risk controls
- **Streams live logs** to a React dashboard for real-time monitoring

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **AI Decision Engine** | Gemini 2.5 Flash analyzes RSI, funding rates, basis spread, and social sentiment |
| **Social Sentiment** | Elfa AI integration for trending tokens and engagement scores |
| **Risk Management** | Configurable stop-loss, take-profit, position sizing, and confidence thresholds |
| **Trailing Stops** | High-water mark tracking to lock in profits automatically |
| **Parallel Execution** | Multi-threaded processing for multiple symbols simultaneously |
| **Circuit Breaker** | Auto-fallback to Binance klines after Pacifica API failures |
| **Persistent State** | Survives restarts with position tracking in `positions.json` |

---

## Live Demo

### Production URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend Dashboard** | [https://pacificia-trading-bot.vercel.app](https://pacificia-trading-bot.vercel.app) | Live |
| **Backend API** | [https://pacificia-trading-bot.onrender.com](https://pacificia-trading-bot.onrender.com) | Live |

### Quick Start for Users

1. Visit the [frontend dashboard](https://pacificia-trading-bot.vercel.app)
2. Connect your Ethereum wallet via Privy
3. Complete onboarding with your Pacifica API credentials
4. Configure trading parameters in the Config tab
5. Run the agent locally or deploy to a VPS
6. Monitor trades in real-time from the dashboard

---

## Architecture

### Hybrid Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR MACHINE (or VPS)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AGENT (Python)                        │   │
│  │  - Runs 24/7 independently                               │   │
│  │  - Holds YOUR Pacifica private keys (NEVER sent to us)   │   │
│  │  - Fetches config from backend API                       │   │
│  │  - Executes trades on your behalf                        │   │
│  │  - Logs decisions + sends heartbeats                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │ x-agent-key                      │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HOSTED SERVICES (We Provide)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │   FRONTEND      │  │    BACKEND      │  │    MongoDB     │   │
│  │   (Vercel)      │─▶│   (Render)      │─▶│    (Atlas)     │  │
│  │   React + Vite  │  │   Express API   │  │   User Config  │   │
│  │   Dashboard UI  │  │   + JWT Auth    │  │   Trade History│   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Why Hybrid?

| We Provide (Hosted) | You Run (Your Control) |
|---------------------|------------------------|
| Frontend Dashboard | Agent (Python script) |
| Backend API | Your Pacifica private keys |
| MongoDB (configs, trade history) | Your choice: local PC or VPS |
| Authentication | Full control of funds |

**Security First:** Your Pacifica private keys NEVER leave your machine. We can't access your funds even if we wanted to.

---

## Features

### Trading Features

- **Multi-Symbol Support**: Trade BTC, ETH, SOL, and other Pacifica perpetuals simultaneously
- **AI + Rule-Based Fallback**: Gemini AI makes primary decisions; rule-based logic backs up if AI fails
- **Position Management**: Automatic tracking with trailing stop-loss and take-profit
- **Balance-Aware Sizing**: Caps orders at 90% of available collateral
- **Dry Run Mode**: Paper trading with real market data (no real orders)

### Monitoring Features

- **Real-Time Logs**: Server-Sent Events (SSE) stream live agent activity to dashboard
- **4-Tab Dashboard**:
  - **Portfolio**: Balances, open positions, unrealized PnL
  - **Config**: Live agent settings and risk parameters
  - **Decisions**: AI trading decisions with reasoning
  - **Logs**: Real-time log stream with filtering

### Agent Status Indicator

| Status | Color | Meaning |
|--------|-------|---------|
| Online | Green | Agent running, heartbeats received |
| Starting | Yellow | Enabled but no heartbeat yet |
| Offline | Grey | Agent disabled in config |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| Privy | 3.x | Web3 authentication |
| React Router | 7.x | Client-side routing |
| Framer Motion | 12.x | Animations |
| Tailwind CSS | 4.x | Styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.x | REST API server |
| MongoDB | Atlas | Database |
| Mongoose | 9.x | ODM |
| Privy Server Auth | 1.x | JWT verification |
| AES-256-CBC | - | Key encryption |

### Trading Agent

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| Requests | 2.31+ | HTTP client |
| Google GenAI | 1.0+ | Gemini AI integration |
| Solders | 0.18+ | Solana keypair management |
| Websockets | 12.0+ | WebSocket client |
| python-dotenv | 1.0+ | Environment config |

### External APIs

| Service | Purpose | Documentation |
|---------|---------|---------------|
| Pacifica | Perpetual futures DEX | [pacifica.gitbook.io/docs](https://pacifica.gitbook.io/docs) |
| Elfa AI | Social sentiment | [elfa.ai](https://elfa.ai) |
| Google Gemini | AI decisions | [ai.google.dev](https://ai.google.dev) |
| Privy | Wallet auth | [docs.privy.io](https://docs.privy.io) |
| Binance | Fallback kline data | [binance.com/api](https://binance.com/api) |

---

## Getting Started

### Prerequisites

1. **Pacifica Testnet Account**: [test-app.pacifica.fi](https://test-app.pacifica.fi)
2. **Google Gemini API Key**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
3. **Elfa AI API Key** (optional): [elfa.ai](https://elfa.ai)
4. **Node.js 18+**: [nodejs.org](https://nodejs.org)
5. **Python 3.11+**: [python.org](https://python.org)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/MayurK-cmd/Pacificia-Trading-Bot.git
cd Pacificia-Trading-Bot
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4. Install Agent Dependencies

```bash
cd ../agent
pip install -r requirements.txt
```

### Configuration

#### Backend Environment (`backend/.env`)

```env
# MongoDB Atlas connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pacifica-pilot

# Privy authentication
PRIVY_APP_ID=<your_privy_app_id>
PRIVY_APP_SECRET=<your_privy_app_secret>

# AES-256 encryption key (32-char hex)
ENCRYPTION_SECRET=<random_32_char_hex_string>

# Agent authentication secret
AGENT_API_SECRET=<secure_random_string>
```

#### Frontend Environment (`frontend/.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Privy app ID
VITE_PRIVY_APP_ID=<your_privy_app_id>

# Logo.dev API key for token icons (optional)
VITE_LOGO_DEV_API_KEY=<your_logo_dev_key>
```

#### Agent Environment (`agent/.env`)

```env
# Backend connection
BACKEND_URL=http://localhost:3001
AGENT_API_SECRET=<same_as_backend>

# Pacifica API
PACIFICA_BASE_URL=https://test-api.pacifica.fi/api/v1
PACIFICA_WS_URL=wss://test-ws.pacifica.fi/ws
PACIFICA_PRIVATE_KEY=<your_base58_private_key>
PACIFICA_AGENT_PRIVATE_KEY=<agent_wallet_secret>
PACIFICA_AGENT_PUBLIC_KEY=<agent_api_key>

# AI services
GEMINI_API_KEY=<your_gemini_key>
ELFA_API_KEY=<your_elfa_key>

# Safety
DRY_RUN=true
```

### Running Locally

#### Terminal 1 - Backend

```bash
cd backend
npm start
# Server: http://localhost:3001
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# Frontend: http://localhost:5173
```

#### Terminal 3 - Agent

```bash
cd agent
python main.py
# Agent polls backend every 5 minutes
```

---

## Configuration

### Trading Parameters

Configure these via the **Config Tab** in the dashboard:

| Parameter | Default | Description |
|-----------|---------|-------------|
| **Symbols** | BTC, ETH | Comma-separated list of trading pairs |
| **Loop Interval** | 300s | Time between decision cycles per symbol |
| **Max Position** | $50 USDC | Maximum position size |
| **Min Confidence** | 60% | Minimum AI confidence to execute trade |
| **Stop Loss** | 3% | Trailing stop-loss percentage |
| **Take Profit** | 6% | Take-profit percentage |
| **Risk Level** | Balanced | conservative/balanced/aggressive |
| **Dry Run** | true | Paper trading mode |
| **Binance Fallback** | true | Use Binance klines if Pacifica fails |

### Risk Profiles

| Profile | Stop Loss | Take Profit | Min Confidence | Best For |
|---------|-----------|-------------|----------------|----------|
| **Conservative** | 2% | 4% | 75% | Low-risk, high-conviction trades |
| **Balanced** | 3% | 6% | 60% | Default for most users |
| **Aggressive** | 5% | 10% | 45% | Frequent trading, higher risk |

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/sync` | JWT | Sync Privy user to database |
| POST | `/api/auth/keys` | JWT | Save Pacifica keys (encrypted) |
| GET | `/api/auth/me` | JWT | Get current user profile |

### Config Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/config` | JWT | Get user config |
| POST | `/api/config` | JWT | Update config |

### Agent Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/agent/config` | x-agent-key | Get trading config |
| POST | `/api/agent/heartbeat` | x-agent-key | Send heartbeat |
| GET | `/api/agent/status` | None | Get agent status |
| POST | `/api/agent/toggle` | JWT | Enable/disable agent |

### Trading Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trades` | JWT | Get trade history |
| GET | `/api/trades/stats` | JWT | Get trading statistics |
| POST | `/api/trades` | x-agent-key | Log new trade |
| GET | `/api/portfolio` | JWT | Get portfolio data |

### Log Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/logs` | None | Get recent logs |
| GET | `/api/logs/stream` | None | SSE log stream |
| POST | `/api/logs` | x-agent-key | Push log entry |

---

## Trading Logic

### Decision Flow

```
Every cycle (default: 5 minutes) for each symbol:

1. FETCH MARKET DATA
   - Mark price from Pacifica
   - RSI-14 (5-minute candles)
   - RSI-14 (1-hour candles)
   - Funding rate
   - 24h volume and price change

2. FETCH SENTIMENT (Elfa AI)
   - Top mentions (24h count)
   - Engagement score (0-1)
   - Trending rank (0-100)

3. AI DECISION (Gemini 2.5 Flash)
   - Analyzes all signals
   - Returns: LONG / SHORT / HOLD
   - Confidence: 0-100%
   - Position size: 25%/50%/75%/100%
   - Reasoning: 2-3 sentences

4. EXECUTE (if confidence > threshold)
   - Check no existing position
   - Place market order
   - Track entry price
   - Log decision to backend

5. MONITOR EXISTING POSITIONS
   - Check stop-loss / take-profit
   - Close if triggered
   - Log PnL
```

### Signal Reference

| Signal | Bullish | Bearish |
|--------|---------|---------|
| **RSI-14 (1h)** | < 35 (oversold) | > 65 (overbought) |
| **RSI-14 (5m)** | < 35 | > 65 |
| **Funding Rate** | Negative (shorts pay longs) | Positive (longs pay shorts) |
| **Sentiment Score** | High engagement, trending | Low engagement |
| **Basis Spread** | Pacifica < Binance (arbitrage) | Pacifica > Binance (>2% flag) |

---

## Security

### Key Management

| Key Type | Storage | Encryption |
|----------|---------|------------|
| Pacifica Private Key | Agent's `.env` only | Never transmitted |
| Pacifica Agent Key | Agent's `.env` only | Never transmitted |
| User Wallet (Privy) | User's browser | Privy handles |
| Database Keys | MongoDB | AES-256-CBC |

### Authentication

- **User Routes**: JWT from Privy wallet signature
- **Agent Routes**: `x-agent-key` header with shared secret
- **Key Encryption**: AES-256-CBC before MongoDB storage

### Safety Features

- **Dry Run Default**: Agent starts in simulation mode
- **Confidence Threshold**: Won't trade below minimum confidence
- **Position Limits**: Hard cap on position size
- **Circuit Breaker**: Falls back to Binance after API failures

---

## Deployment

### Production Deployment

#### Backend (Render)

1. Create new Web Service at [render.com](https://render.com)
2. Connect GitHub repository
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables:

```env
MONGODB_URI=<mongodb_atlas_uri>
PRIVY_APP_ID=<privy_app_id>
PRIVY_APP_SECRET=<privy_app_secret>
ENCRYPTION_SECRET=<32_char_hex>
AGENT_API_SECRET=<secure_string>
PORT=3001
```

#### Frontend (Vercel)

1. Import project at [vercel.com](https://vercel.com)
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_PRIVY_APP_ID=<privy_app_id>
```

The `vercel.json` configuration file is included in the frontend directory.

#### Agent (VPS or Render)

1. Deploy to VPS or Render Web Service
2. Root Directory: `agent`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python main.py`
5. Environment Variables:

```env
BACKEND_URL=https://your-backend.onrender.com
AGENT_API_SECRET=<same_as_backend>
PACIFICA_PRIVATE_KEY=<your_key>
PACIFICA_AGENT_PRIVATE_KEY=<your_agent_key>
GEMINI_API_KEY=<your_gemini_key>
ELFA_API_KEY=<your_elfa_key>
DRY_RUN=false  # Production only!
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **"Agent disabled"** | Go to Config tab and toggle "Enabled" ON |
| **Agent won't connect** | Verify `BACKEND_URL` and `AGENT_API_SECRET` match |
| **No market data** | Check Pacifica keys; enable Binance fallback |
| **Login fails** | Verify Privy app ID/secret; check MongoDB connection |
| **Circuit breaker triggered** | Pacifica API failing; check logs for details |

### Debug Mode

Enable verbose logging in the agent:

```python
# In agent/main.py, set:
DEBUG = True
```

### Getting Help

- Check the **Logs Tab** for real-time agent activity
- Review backend logs at your deployment provider
- Open an issue on GitHub with error details

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## External Resources

- [Pacifica Documentation](https://pacifica.gitbook.io/docs)
- [Elfa AI x Pacifica Integration](https://elfaai.notion.site/Elfa-x-Pacifica)
- [Google Gemini API Docs](https://ai.google.dev)
- [Privy Documentation](https://docs.privy.io)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js)

---

## Disclaimer

**Trading cryptocurrencies involves significant risk.** This software is provided for educational and testing purposes only. Past performance does not guarantee future results. Always test thoroughly in dry run mode before considering live trading.

**You are responsible for your own trading decisions.** The authors and contributors are not liable for any losses incurred through use of this software.

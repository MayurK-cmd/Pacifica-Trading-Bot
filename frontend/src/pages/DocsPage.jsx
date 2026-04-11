import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function DocsPage() {
  const blue = "#00d1ff";
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-zinc-300 font-sans selection:bg-[#00d1ff] selection:text-black flex">
      <div className="flex w-full">
        {/* Sidebar Navigation - Scrollable independently */}
        <aside className="w-full md:w-80 border-r border-[#1a2b3b] bg-black p-10 flex flex-col h-screen overflow-y-auto custom-scrollbar flex-shrink-0">
          <Link to="/" className="text-white font-black tracking-[0.4em] text-sm mb-16 uppercase flex items-center gap-3 group">
            <div className="w-4 h-4 rotate-45 border-2 transition-all group-hover:bg-[#00d1ff]" style={{ borderColor: blue }} />
            ← <span className="group-hover:text-[#00d1ff]">PILOT_HOME</span>
          </Link>

          <nav className="space-y-12 uppercase font-mono text-[11px] tracking-widest">
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">01_Intro</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#hybrid-architecture" className="hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#agent-strengths" className="hover:text-white transition-colors">Agent_Strengths</a></li>
              </ul>
            </div>
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">02_User_Guide</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#for-end-users" className="hover:text-white transition-colors">For_End_Users</a></li>
                <li><a href="#onboarding-steps" className="hover:text-white transition-colors">Onboarding_Steps</a></li>
              </ul>
            </div>
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">03_Deployment</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#option1-hybrid" className="hover:text-white transition-colors">Full Local Setup</a></li>
                <li><a href="#env-vars" className="hover:text-white transition-colors">Environment_Vars</a></li>
              </ul>
            </div>
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">03_Trading</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#risk-profiles" className="hover:text-white transition-colors">Risk_Profiles</a></li>
                <li><a href="#simulation-mode" className="hover:text-white transition-colors">Simulation_Mode</a></li>
              </ul>
            </div>
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">04_Signals</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#signal-mechanics" className="hover:text-white transition-colors">Signal_Mechanics</a></li>
                <li><a href="#decision-flow" className="hover:text-white transition-colors">Decision_Flow</a></li>
              </ul>
            </div>
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">05_Help</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#troubleshooting" className="hover:text-white transition-colors">Troubleshooting</a></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-black overflow-y-auto custom-scrollbar" style={{ maxHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto p-12 md:p-24 space-y-40 pb-40">

            {/* 01. Overview */}
            <section id="overview">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">01. Overview</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="space-y-10">
                <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">What is PacificaPilot?</h3>
                <p className="text-zinc-400 text-lg leading-relaxed uppercase tracking-tighter">
                  Autonomous AI trading agent for Pacifica perpetual futures with real-time dashboard monitoring.
                </p>

                {/* Architecture */}
                <div id="hybrid-architecture" className="mt-24 space-y-10">
                  <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">Architecture</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-tight">
                    PacificaPilot runs entirely on your machine — frontend, backend, and agent all local. Your private keys NEVER leave your environment.
                  </p>

                  <div className="p-6 border border-[#00d1ff]/30 bg-[#00d1ff]/5">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4" style={{ color: blue }}>Local Architecture</h4>
                    <pre className="text-zinc-400 text-[10px] font-mono leading-5 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────┐
│              YOUR MACHINE (All Components)              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           AGENT (Python) — Trading Logic        │    │
│  │  • Holds YOUR Pacifica private keys             │    │
│  │  • Fetches config from local backend            │    │
│  │  • Executes trades on Pacifica                  │    │
│  │  • Logs decisions + sends heartbeats            │    │
│  └──────────────────┬──────────────────────────────┘    │
│                     │ HTTPS localhost                   │
│  ┌──────────────────▼──────────────────────────────┐    │
│  │           BACKEND (Express — port 3001)         │    │
│  │  • Config storage (MongoDB Atlas)               │    │
│  │  • Trade history + logs                         │    │
│  │  • Auth via Privy JWT                           │    │
│  └──────────────────┬──────────────────────────────┘    │
│                     │ localhost                         │
│  ┌──────────────────▼──────────────────────────────┐    │
│  │           FRONTEND (Vite — port 5173)           │    │
│  │  • Dashboard UI                                 │    │
│  │  • Real-time logs & positions                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘`}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-zinc-800 bg-zinc-950/30">
                      <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4" style={{ color: blue }}>You Run Locally</h4>
                      <ul className="space-y-3 text-zinc-500 text-[10px] uppercase tracking-tight">
                        <li className="flex gap-3"><span>•</span> Frontend (Vite) — Dashboard UI on :5173</li>
                        <li className="flex gap-3"><span>•</span> Backend (Express) — API + Auth on :3001</li>
                        <li className="flex gap-3"><span>•</span> MongoDB (Atlas) — Cloud DB only</li>
                      </ul>
                    </div>
                    <div className="p-6 border border-[#22c55e]/30 bg-[#22c55e]/5">
                      <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4" style={{ color: "#22c55e" }}>You Run (Your Control)</h4>
                      <ul className="space-y-3 text-zinc-500 text-[10px] uppercase tracking-tight">
                        <li className="flex gap-3"><span>✓</span> Agent (Python) — Trading logic</li>
                        <li className="flex gap-3"><span>✓</span> Private keys stay local</li>
                        <li className="flex gap-3"><span>✓</span> Run on PC or VPS 24/7</li>
                        <li className="flex gap-3"><span>✓</span> Full control of funds</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border border-[#22c55e]/50 bg-[#22c55e]/5">
                    <p className="text-[10px] uppercase tracking-tight text-[#22c55e]">
                      <span className="font-bold">Security First:</span> Your Pacifica private keys are NEVER sent anywhere. They stay in your agent's .env file forever.
                    </p>
                  </div>

                  <div className="p-6 border border-[#00d1ff]/30 bg-[#00d1ff]/5 mt-6">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4" style={{ color: blue }}>🔒 Why Run Everything Locally?</h4>
                    <p className="text-[10px] uppercase tracking-tight text-zinc-400 mb-4">
                      Private keys = Your responsibility. No hosted service should ever touch them. Running locally gives you full control over every component.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[9px]">
                      <div>
                        <span className="text-zinc-500 block mb-2">YOU RUN (LOCAL):</span>
                        <ul className="space-y-1 text-zinc-300">
                          <li>• Frontend Dashboard (:5173)</li>
                          <li>• Backend API (:3001)</li>
                          <li>• Agent (Python)</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-zinc-500 block mb-2">EXTERNAL ONLY:</span>
                        <ul className="space-y-1 text-zinc-300">
                          <li>• MongoDB Atlas (DB)</li>
                          <li>• Gemini / Elfa APIs</li>
                          <li>• Pacifica DEX</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Real-time market data (RSI, funding, basis)",
                      "Social sentiment (Elfa AI Twitter analysis)",
                      "AI reasoning (Google Gemini 2.5 Flash)",
                      "Automated execution (Ed25519-signed orders)",
                      "Risk management (Trailing stops, limits)"
                    ].map((item, i) => (
                      <div key={i} className="p-5 border border-zinc-900 bg-zinc-950/30 flex gap-4 items-center">
                        <span style={{ color: blue }}>[+]</span>
                        <span className="text-[11px] uppercase font-mono">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* For End Users */}
                <div id="for-end-users" className="mt-24 space-y-10">
                  <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">For_End_Users</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-tight">
                    Clone the repo and run all three services locally. Follow these steps:
                  </p>

                  <div id="onboarding-steps" className="space-y-6">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs">Quick Start Guide</h4>
                    {[
                      { step: "1", title: "Clone Repo", desc: "git clone https://github.com/MayurK-cmd/Pacificia-Trading-Bot.git" },
                      { step: "2", title: "Get Required Keys", desc: "Gather Pacifica keys, Gemini API key, Elfa key, Privy credentials, and MongoDB URI" },
                      { step: "3", title: "Configure .env Files", desc: "Fill in backend/.env, frontend/.env, and agent/.env with your credentials" },
                      { step: "4", title: "Start Backend", desc: "cd backend && npm install && npm start — runs on http://localhost:3001" },
                      { step: "5", title: "Start Frontend", desc: "cd frontend && npm install && npm run dev — opens at http://localhost:5173" },
                      { step: "6", title: "Connect Wallet", desc: "Open localhost:5173, click Login and connect your Ethereum wallet (MetaMask)" },
                      { step: "7", title: "Complete Onboarding", desc: "Enter Solana wallet address, Agent private key, Agent API key" },
                      { step: "8", title: "Configure Trading", desc: "Set symbols, position size, stop-loss, take-profit in Config tab" },
                      { step: "9", title: "Run Agent", desc: "cd agent && pip install -r requirements.txt && python main.py" },
                      { step: "10", title: "Monitor", desc: "Watch trades execute in real-time from the Dashboard" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-start p-6 bg-zinc-950/20 border border-zinc-900">
                        <span style={{ color: blue }} className="text-2xl font-black flex-shrink-0">{item.step}</span>
                        <div>
                          <h5 className="text-white font-bold uppercase tracking-widest text-xs mb-1">{item.title}</h5>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-tight">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border border-yellow-900/50 bg-yellow-950/10 mt-8">
                    <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-3">⚠ Important Notes</h4>
                    <ul className="space-y-2 text-zinc-500 text-[10px] uppercase tracking-tight">
                      <li>• All three services run on YOUR machine — nothing is hosted externally</li>
                      <li>• Private keys NEVER leave your .env file (stored only in memory)</li>
                      <li>• Start with DRY_RUN=true for paper trading first</li>
                      <li>• For 24/7 trading, deploy agent to Render/VPS (not your laptop)</li>
                    </ul>
                  </div>
                </div>

                {/* Agent Strengths */}
                <div id="agent-strengths" className="mt-24 space-y-10">
                  <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">Agent_Strengths</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      {
                        title: "Parallel Symbol Processing",
                        desc: "Thread pool executes BTC, ETH, SOL analysis concurrently — no blocking on slow API calls."
                      },
                      {
                        title: "Trailing Stop-Loss System",
                        desc: "High-water mark tracking locks in profits. Long trails peak, short trails trough — never resets against you."
                      },
                      {
                        title: "Balance-Aware Sizing",
                        desc: "Dynamic cap at 90% of available collateral. Prevents overextension and failed orders."
                      },
                      {
                        title: "Persistent Position State",
                        desc: "positions.json survives agent restarts. No lost trades on crash or redeploy."
                      },
                      {
                        title: "Dual Signal Architecture",
                        desc: "Gemini 2.5 Flash primary + rule-based fallback. Always has a decision path."
                      },
                      {
                        title: "Basis Spread Detection",
                        desc: "Pacifica mark vs Binance spot. Flags arbitrage opportunities (>2% spread alert)."
                      }
                    ].map((s, i) => (
                      <div key={i} className="p-6 bg-zinc-950/20 border border-zinc-900 hover:border-[#00d1ff]/50 transition-all">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2" style={{ color: blue }}>{s.title}</h4>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-tight">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 02. Deployment Options */}
            <section id="option1-hybrid">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">02. How to Use</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Full Local */}
              <div className="space-y-10 mb-24">
                <h3 id="option1-hybrid" style={{ color: blue }} className="text-2xl font-black uppercase tracking-widest italic border-b border-[#1a2b3b] pb-4">Run Everything Locally</h3>
                <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-tight">
                  Frontend, backend, and agent all run on your machine. Full control. No hosted dependencies.
                </p>

                <div className="p-6 border border-[#00d1ff]/30 bg-[#00d1ff]/5">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Architecture</h4>
                  <pre className="text-zinc-400 text-xs font-mono leading-6">
{`┌─────────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   YOUR AGENT        │      │  YOUR BACKEND    │      │  YOUR FRONTEND   │
│   python main.py    │─────▶│  localhost:3001  │◀─────│  localhost:5173  │
│   (Trading Logic)   │      │  (Express API)   │      │  (Dashboard UI)  │
└─────────────────────┘      └──────────────────┘      └──────────────────┘`}
                  </pre>
                </div>

                <div className="space-y-6">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step 1: Get Required Keys</h4>
                  {[
                    { step: "1", text: "Pacifica account: test-app.pacifica.fi (get private key + API key)" },
                    { step: "2", text: "Google Gemini key: aistudio.google.com/apikey" },
                    { step: "3", text: "Elfa AI key (optional): elfa.ai" },
                    { step: "4", text: "Privy App ID + Secret: privy.io (create a free app)" },
                    { step: "5", text: "MongoDB URI: mongodb.com/atlas (free M0 cluster)" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-center p-6 bg-zinc-950/20 border border-zinc-900">
                      <span style={{ color: blue }} className="text-2xl font-black">{item.step}</span>
                      <p className="text-zinc-400 text-sm uppercase tracking-tight">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div id="env-vars" className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step 2: Setup Environment Files</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7 overflow-x-auto shadow-2xl">
{`# Clone repo
git clone https://github.com/MayurK-cmd/Pacificia-Trading-Bot.git
cd Pacificia-Trading-Bot

# backend/.env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pacifica
PRIVY_APP_ID=<your_privy_app_id>
PRIVY_APP_SECRET=<your_privy_app_secret>
ENCRYPTION_SECRET=<32_char_hex>
AGENT_API_SECRET=<your_chosen_secret>

# frontend/.env
VITE_API_URL=http://localhost:3001
VITE_PRIVY_APP_ID=<your_privy_app_id>

# agent/.env
BACKEND_URL=http://localhost:3001
AGENT_API_SECRET=<same_as_backend>

# Your Pacifica keys (NEVER leave your machine!)
PACIFICA_PRIVATE_KEY=<your_base58_private_key>
PACIFICA_AGENT_PRIVATE_KEY=<your_agent_wallet_key>
PACIFICA_AGENT_PUBLIC_KEY=<your_agent_api_key>

# AI services
GEMINI_API_KEY=<your_gemini_key>
ELFA_API_KEY=<your_elfa_key>

# Safety - start with paper trading!
DRY_RUN=true`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step 3: Run All Services</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7">
{`# Terminal 1 — Backend
cd backend && npm install && npm start
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Terminal 3 — Agent
cd agent && pip install -r requirements.txt && python main.py`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step 4: Connect Dashboard</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7">
{`1. Open: http://localhost:5173
2. Login with Privy (connect Ethereum wallet)
3. Complete onboarding (enter Pacifica keys)
4. Configure trading (symbols, risk params)
5. Watch your agent trade in real-time!`}
                  </pre>
                </div>

                <div className="p-4 border border-[#22c55e]/50 bg-[#22c55e]/5">
                  <p className="text-[10px] uppercase tracking-tight text-[#22c55e]">
                    <span className="font-bold">✓ Fully Local:</span> Your private keys stay in YOUR agent's .env — never sent anywhere. Only MongoDB Atlas and external AI APIs are called remotely.
                  </p>
                </div>
              </div>
            </section>

            {/* 03. Trading Modes */}
            <section id="risk-profiles">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">04. Trading Modes</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Risk Profiles */}
              <div id="risk-profiles" className="space-y-10 mb-24">
                <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">Risk Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Conservative",
                      color: "#22c55e",
                      sl: "2%", tp: "4%", conf: "75%",
                      desc: "Lower risk, smaller positions. Waits for high-conviction setups."
                    },
                    {
                      name: "Balanced",
                      color: "#00d1ff",
                      sl: "3%", tp: "6%", conf: "60%",
                      desc: "Moderate risk. Default profile for most users."
                    },
                    {
                      name: "Aggressive",
                      color: "#f59e0b",
                      sl: "5%", tp: "10%", conf: "45%",
                      desc: "Higher risk, larger positions. Takes more frequent trades."
                    }
                  ].map((p, i) => (
                    <div key={i} className="p-6 border bg-zinc-950/20" style={{ borderColor: p.color }}>
                      <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4" style={{ color: p.color }}>{p.name}</h4>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-tight mb-4">{p.desc}</p>
                      <div className="space-y-2 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                        <div className="flex justify-between"><span>Stop Loss:</span><span style={{ color: p.color }}>{p.sl}</span></div>
                        <div className="flex justify-between"><span>Take Profit:</span><span style={{ color: p.color }}>{p.tp}</span></div>
                        <div className="flex justify-between"><span>Min Confidence:</span><span style={{ color: p.color }}>{p.conf}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Mode */}
              <div id="simulation-mode" className="space-y-10">
                <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">Simulation Mode (DRY_RUN)</h3>
                <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-tight">
                  Paper trading — agent makes decisions but no real orders execute.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-[#22c55e]/30 bg-[#22c55e]/5">
                    <h4 className="text-[#22c55e] font-bold uppercase tracking-widest text-xs mb-4">DRY_RUN=true</h4>
                    <ul className="space-y-3 text-zinc-500 text-[10px] uppercase tracking-tight">
                      <li className="flex gap-3"><span>✓</span> Simulates all decisions</li>
                      <li className="flex gap-3"><span>✓</span> Logs reasoning + signals</li>
                      <li className="flex gap-3"><span>✓</span> Tracks PnL as if real</li>
                      <li className="flex gap-3"><span>✓</span> Safe for strategy testing</li>
                      <li className="flex gap-3"><span>✓</span> No funds at risk</li>
                    </ul>
                  </div>
                  <div className="p-6 border border-red-900/30 bg-red-950/5">
                    <h4 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-4">DRY_RUN=false</h4>
                    <ul className="space-y-3 text-zinc-500 text-[10px] uppercase tracking-tight">
                      <li className="flex gap-3"><span>⚠</span> Real orders on Pacifica</li>
                      <li className="flex gap-3"><span>⚠</span> Uses actual wallet funds</li>
                      <li className="flex gap-3"><span>⚠</span> Full execution active</li>
                      <li className="flex gap-3"><span>⚠</span> Real money at risk</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 border border-[#00d1ff]/30 bg-[#00d1ff]/5">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4" style={{ color: blue }}>How Simulation Works</h4>
                  <div className="space-y-4 text-zinc-400 text-sm uppercase tracking-tight">
                    <p>
                      <span className="text-white font-bold">1. Signal Fetch:</span> Agent fetches RSI, funding, basis, sentiment — identical to live mode.
                    </p>
                    <p>
                      <span className="text-white font-bold">2. AI Decision:</span> Gemini analyzes and outputs LONG/SHORT/HOLD with confidence.
                    </p>
                    <p>
                      <span className="text-white font-bold">3. Order Simulation:</span> If confidence &gt; threshold, agent logs what it WOULD have traded (size, entry price).
                    </p>
                    <p>
                      <span className="text-white font-bold">4. Virtual Tracking:</span> Agent tracks the simulated position, updates trailing stops, calculates PnL.
                    </p>
                    <p>
                      <span className="text-white font-bold">5. Exit Simulation:</span> Stop-loss/take-profit triggers are logged as if executed.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-yellow-900/50 bg-yellow-950/10">
                  <p className="text-[10px] uppercase tracking-tight text-yellow-500">
                    <span className="font-bold">TIP:</span> Run DRY_RUN=true for at least 24 hours before going live. Verify the agent's decisions align with your risk tolerance.
                  </p>
                </div>
              </div>
            </section>

            {/* 04. Signal Mechanics */}
            <section id="signal-mechanics">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">05. Signal Mechanics</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <div id="signal-mechanics" className="bg-[#050a12]/30 border border-[#1a2b3b] p-10">
                <h3 style={{ color: blue }} className="text-sm font-black uppercase mb-10 tracking-widest italic">Signal_Interpretation</h3>
                <table className="w-full border-collapse text-left font-mono text-[11px] text-zinc-500">
                  <thead>
                    <tr className="border-b border-zinc-800 uppercase">
                      <th className="py-4 pr-4 font-black">Signal</th>
                      <th className="py-4 pr-4 font-black text-white italic">Bullish</th>
                      <th className="py-4 font-black text-white italic">Bearish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 uppercase tracking-tighter">
                    <tr><td className="py-6 font-bold">RSI-14 (1H)</td><td className="py-6 text-[#00d1ff]">&lt; 35</td><td className="py-6 text-red-900">&gt; 65</td></tr>
                    <tr><td className="py-6 font-bold">RSI-14 (5M)</td><td className="py-6 text-[#00d1ff]">&lt; 35</td><td className="py-6 text-red-900">&gt; 65</td></tr>
                    <tr><td className="py-6 font-bold">Funding</td><td className="py-6 text-[#00d1ff]">Negative</td><td className="py-6 text-red-900">Positive</td></tr>
                    <tr><td className="py-6 font-bold">Basis</td><td className="py-6 text-[#00d1ff]">Discount</td><td className="py-6 text-red-900">Premium</td></tr>
                    <tr><td className="py-6 font-bold">Sentiment</td><td className="py-6 text-[#00d1ff]">&gt; 0.3</td><td className="py-6 text-zinc-700">&lt; 0.1</td></tr>
                  </tbody>
                </table>
              </div>

              <div id="decision-flow" className="mt-24 space-y-12">
                <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">Decision_Flow</h3>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { id: "A", t: "FETCH_CONFIG", d: "Poll /api/agent/config every 5 min for symbols, risk params." },
                    { id: "B", t: "MARKET_DATA", d: "RSI-14 (5m/1h), funding, basis vs Binance — parallel per symbol." },
                    { id: "C", t: "SENTIMENT", d: "Elfa AI engagement score, mention count, trending rank." },
                    { id: "D", t: "GEMINI_AI", d: "Synthesizes all signals. Outputs action, confidence, size_pct, reasoning." },
                    { id: "E", t: "EXECUTE", d: "If confidence &gt; minConfidence, place order. Track entry + trailing marks." },
                    { id: "F", t: "MONITOR", d: "Check trailing stop-loss / take-profit each cycle. Close if triggered." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-8 p-8 bg-zinc-950/20 border border-zinc-900 hover:border-[#00d1ff]/50 transition-all">
                       <span className="text-zinc-800 text-4xl font-black italic">{step.id}</span>
                       <div>
                          <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-1" style={{ color: blue }}>{step.t}</h4>
                          <p className="text-zinc-500 text-xs leading-relaxed uppercase">{step.d}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 05. FAQ & Troubleshooting */}
            <section id="faq">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">06. Help</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* FAQ */}
              <div id="faq" className="space-y-10 mb-24">
                <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">FAQ</h3>
                <div className="space-y-6">
                  {[
                    {
                      q: "What is the minimum capital required?",
                      a: "Pacifica requires $10 minimum per order. Recommended starting capital: $50-100 for testing."
                    },
                    {
                      q: "Is my private key stored anywhere?",
                      a: "No. Keys are AES-256 encrypted in MongoDB. Agent holds keys only in memory during execution."
                    },
                    {
                      q: "Can I run multiple symbols?",
                      a: "Yes. Up to 10 symbols concurrently. Agent uses thread pool for parallel analysis."
                    },
                    {
                      q: "How often does the agent trade?",
                      a: "Default cycle: 5 minutes per symbol. Actual trades depend on market conditions and confidence thresholds."
                    },
                    {
                      q: "What happens if Gemini API fails?",
                      a: "Fallback rule-based engine activates. Uses RSI, funding, and sentiment signals for decisions."
                    },
                    {
                      q: "Can I use this on mainnet?",
                      a: "Yes. Switch PACIFICA_BASE_URL to mainnet and set DRY_RUN=false. Be cautious."
                    }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-zinc-950/20 border border-zinc-900">
                      <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3" style={{ color: blue }}>{item.q}</h4>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-tight leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Troubleshooting */}
              <div id="troubleshooting" className="space-y-10">
                <h3 style={{ color: blue }} className="text-xl font-bold uppercase tracking-widest italic">Troubleshooting</h3>
                <div className="space-y-6">
                  {[
                    {
                      issue: "Agent shows 'Backend not running'",
                      fix: "Ensure backend is running on port 3001 (npm start in /backend). Check BACKEND_URL=http://localhost:3001 in agent/.env."
                    },
                    {
                      issue: "No market data appearing",
                      fix: "Verify Pacifica keys are correct. Enable 'useBinanceFallback' in config."
                    },
                    {
                      issue: "Agent disconnected after sleep",
                      fix: "Agent requires constant connection. Deploy to Render/VPS for 24/7 uptime."
                    },
                    {
                      issue: "Orders failing with 'insufficient balance'",
                      fix: "Reduce maxPositionUsdc or fund your Pacifica wallet. Agent caps at 90% of available balance."
                    },
                    {
                      issue: "Gemini API errors",
                      fix: "Check GEMINI_API_KEY is valid. Verify at aistudio.google.com/apikey"
                    },
                    {
                      issue: "Heartbeat timeout in UI",
                      fix: "Agent sends heartbeat every cycle. If offline >10 min, check agent terminal for errors."
                    },
                    {
                      issue: "Frontend can't reach backend",
                      fix: "Verify backend is running on port 3001 and VITE_API_URL=http://localhost:3001 in frontend/.env."
                    }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-zinc-950/20 border border-zinc-900">
                      <h4 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-3">⚠ {item.issue}</h4>
                      <p className="text-zinc-400 text-[10px] uppercase tracking-tight leading-relaxed"><span style={{ color: blue }} className="font-bold">FIX:</span> {item.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* Footer - inside main so it scrolls with content */}
          <footer className="border-t border-[#1a2b3b] bg-black px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[12px] font-mono uppercase tracking-[0.3em] text-zinc-500 mt-20">
            <div className="flex flex-col md:flex-row gap-12">
              <span className="cursor-default italic text-zinc-700">© 2026_PILOT_CORE</span>
              <a href="https://github.com/MayurK-cmd/Pacificia-Trading-Bot" target="_blank" rel="noreferrer" className="underline underline-offset-8 decoration-zinc-800 hover:text-white transition-colors font-bold">Github_Source</a>
              <a href="https://pacifica.gitbook.io/docs/hackathon/pacifica-hackathon" target="_blank" rel="noreferrer" className="underline underline-offset-8 decoration-zinc-800 hover:text-white transition-colors font-bold">Pacifica_Hackathon</a>
              <button className="hover:text-white transition-colors text-zinc-600">Protocol_Status: {systemTime}</button>
            </div>
            <div className="flex gap-10 items-center">
              <div className="flex items-center gap-4 border border-zinc-900 px-6 py-3 bg-zinc-950/50 rounded-sm">
                 <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: blue, boxShadow: `0 0 15px ${blue}` }}
                 />
                 <span className="text-zinc-300 font-black tracking-[0.1em]">SYSTEM_ACTIVE</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
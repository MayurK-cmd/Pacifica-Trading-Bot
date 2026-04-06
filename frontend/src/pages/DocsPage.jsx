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
                <li><a href="#agent-strengths" className="hover:text-white transition-colors">Agent_Strengths</a></li>
              </ul>
            </div>
            <div>
              <p style={{ color: blue }} className="mb-6 opacity-80 italic font-bold border-b border-zinc-900 pb-2">02_Deployment</p>
              <ul className="space-y-4 pl-4 border-l border-zinc-800">
                <li><a href="#option1-hybrid" className="hover:text-white transition-colors">Option 1: Hybrid</a></li>
                <li><a href="#option2-local" className="hover:text-white transition-colors">Option 2: Full Local</a></li>
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
            </section>

            {/* 02. Deployment Options */}
            <section id="option1-hybrid">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">02. Deployment Options</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Option 1 */}
              <div className="space-y-10 mb-24">
                <h3 id="option1-hybrid" style={{ color: blue }} className="text-2xl font-black uppercase tracking-widest italic border-b border-[#1a2b3b] pb-4">Option 1: Hybrid (Recommended)</h3>
                <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-tight">
                  Frontend + Backend on your machine. Agent deployed to Render (runs 24/7).
                </p>

                <div className="p-6 border border-[#00d1ff]/30 bg-[#00d1ff]/5">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Architecture</h4>
                  <pre className="text-zinc-400 text-xs font-mono leading-6">
{`┌─────────────────────┐      ┌──────────────────┐
│  FRONTEND (Local)   │      │  BACKEND (Local) │
│  localhost:5173     │─────▶│  localhost:3001  │
└─────────────────────┘      └────────┬─────────┘
                                      │
                                      ▼
                              ┌──────────────────┐
                              │  AGENT (Render)  │
                              │  24/7 Uptime     │
                              └──────────────────┘`}
                  </pre>
                </div>

                <div className="space-y-6">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step A: Deploy Agent to Render</h4>
                  {[
                    { step: "1", text: "Create Render account at render.com" },
                    { step: "2", text: "New Web Service → Connect your GitHub repo" },
                    { step: "3", text: "Root Directory: agent" },
                    { step: "4", text: "Build Command: pip install -r requirements.txt" },
                    { step: "5", text: "Start Command: python main.py" },
                    { step: "6", text: "Add environment variables (see below)" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-center p-6 bg-zinc-950/20 border border-zinc-900">
                      <span style={{ color: blue }} className="text-2xl font-black">{item.step}</span>
                      <p className="text-zinc-400 text-sm uppercase tracking-tight">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Render Environment Variables</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7 overflow-x-auto shadow-2xl">
{`BACKEND_URL=https://YOUR_BACKEND.ngrok.io
AGENT_API_SECRET=<same_as_backend.env>

PACIFICA_BASE_URL=https://test-api.pacifica.fi/api/v1
PACIFICA_PRIVATE_KEY=<your_main_wallet_key>
PACIFICA_AGENT_PRIVATE_KEY=<agent_wallet_key>
PACIFICA_AGENT_API_KEY=<agent_api_key>

GEMINI_API_KEY=<gemini_key>
ELFA_API_KEY=<elfa_key>

DRY_RUN=true
TRADE_SYMBOLS=BTC,ETH
LOOP_INTERVAL_SECONDS=300`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step B: Local Backend (.env)</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7 overflow-x-auto">
{`MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pacifica
PRIVY_APP_ID=<privy_id>
PRIVY_APP_SECRET=<privy_secret>
ENCRYPTION_SECRET=<32_char_hex>
AGENT_API_SECRET=<secure_random_string>`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">Step C: Local Frontend (.env)</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7 overflow-x-auto">
{`VITE_API_URL=http://localhost:3001
VITE_PRIVY_APP_ID=<privy_id>`}
                  </pre>
                </div>

                <div className="p-4 border border-yellow-900/50 bg-yellow-950/10">
                  <p className="text-[10px] uppercase tracking-tight text-yellow-500">
                    <span className="font-bold">NOTE:</span> For backend exposed to Render agent, use ngrok:
                    <code className="text-zinc-300 ml-2">ngrok http 3001</code> and update BACKEND_URL in Render.
                  </p>
                </div>
              </div>

              {/* Option 2 */}
              <div id="option2-local" className="space-y-10">
                <h3 style={{ color: blue }} className="text-2xl font-black uppercase tracking-widest italic border-b border-[#1a2b3b] pb-4">Option 2: Fully Local</h3>
                <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-tight">
                  Frontend + Backend + Agent all on your machine. For development/testing.
                </p>

                <div className="p-6 border border-red-900/30 bg-red-950/5">
                  <h4 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-4">Limitations</h4>
                  <ul className="space-y-2 text-zinc-500 text-[10px] uppercase tracking-tight">
                    <li>⚠ Agent stops when terminal closes</li>
                    <li>⚠ No trading when computer sleeps</li>
                    <li>⚠ Not suitable for production</li>
                  </ul>
                </div>

                <div className="space-y-6">
                  {[
                    { step: "1", text: "Clone repo: git clone https://github.com/MayurK-cmd/Pacificia-Trading-Bot.git" },
                    { step: "2", text: "Backend: cd backend && npm install && npm start" },
                    { step: "3", text: "Frontend: cd frontend && npm install && npm run dev" },
                    { step: "4", text: "Agent: cd agent && pip install -r requirements.txt && python main.py" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-center p-6 bg-zinc-950/20 border border-zinc-900">
                      <span style={{ color: blue }} className="text-2xl font-black">{item.step}</span>
                      <p className="text-zinc-400 text-sm uppercase tracking-tight">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs">All Environment Files</h4>
                  <pre className="bg-[#050a12] border border-[#1a2b3b] p-8 text-zinc-300 text-sm font-mono leading-7 overflow-x-auto shadow-2xl">
{`# backend/.env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pacifica
PRIVY_APP_ID=<privy_id>
PRIVY_APP_SECRET=<privy_secret>
ENCRYPTION_SECRET=<32_char_hex>
AGENT_API_SECRET=local_dev_secret_123

# frontend/.env
VITE_API_URL=http://localhost:3001
VITE_PRIVY_APP_ID=<privy_id>

# agent/.env
BACKEND_URL=http://localhost:3001
AGENT_API_SECRET=local_dev_secret_123

PACIFICA_BASE_URL=https://test-api.pacifica.fi/api/v1
PACIFICA_PRIVATE_KEY=<your_wallet_key>
PACIFICA_AGENT_PRIVATE_KEY=<agent_key>
PACIFICA_AGENT_API_KEY=<agent_api_key>

GEMINI_API_KEY=<gemini_key>
ELFA_API_KEY=<elfa_key>

DRY_RUN=true
TRADE_SYMBOLS=BTC,ETH
LOOP_INTERVAL_SECONDS=300`}
                  </pre>
                </div>
              </div>
            </section>

            {/* 03. Trading Modes */}
            <section id="risk-profiles">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">03. Trading Modes</h2>
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
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">04. Signal Mechanics</h2>
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
                <h2 className="text-white text-4xl font-black tracking-tight uppercase italic">05. Help</h2>
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
                      fix: "Ensure backend is running on port 3001. Check BACKEND_URL in agent/.env matches."
                    },
                    {
                      issue: "No market data appearing",
                      fix: "Verify Pacifica keys are correct. Enable 'useBinanceFallback' in config."
                    },
                    {
                      issue: "Agent disconnected after sleep",
                      fix: "Agent requires constant connection. Deploy to Render for 24/7 uptime."
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

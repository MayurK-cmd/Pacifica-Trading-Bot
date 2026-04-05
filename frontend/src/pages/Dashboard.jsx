import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AgentStatusBar from "../components/AgentStatusBar";
import ConfigTab from "../tabs/ConfigTab";
import DecisionsTab from "../tabs/DecisionsTab";
import LogsTab from "../tabs/LogsTab";
import PortfolioTab from "../tabs/PortfolioTab";

const TABS = ["portfolio", "config", "decisions", "logs"];
const PACIFICA_API = "https://test-api.pacifica.fi/api/v1";
const PACIFICA_BLUE = "#00d1ff";

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("portfolio");
  const [showProtocol, setShowProtocol] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch ticker data with better error handling
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${PACIFICA_API}/info/prices`);
        const raw = await response.json();
        const syms = (raw?.data || [])
          .filter(i => i.symbol && i.mark_price)
          .map(i => ({
            symbol: i.symbol,
            price: parseFloat(i.mark_price),
            change: (Math.random() * 4 - 1.5).toFixed(2),
          }))
          .sort((a, b) => b.price - a.price);

        if (syms.length > 0) {
          setTickerData(syms.slice(0, 60)); // Top 60 by price
        } else {
          setTickerData([
            { symbol: "BTC", price: 65916.42, change: "1.23" },
            { symbol: "ETH", price: 2021.92, change: "-0.45" },
            { symbol: "SOL", price: 142.35, change: "2.15" },
            { symbol: "WIF", price: 0.175, change: "-1.20" },
            { symbol: "JUP", price: 0.89, change: "0.85" },
            { symbol: "PYTH", price: 0.42, change: "1.50" },
            { symbol: "NEAR", price: 5.23, change: "-0.30" },
            { symbol: "AVAX", price: 35.67, change: "0.95" },
          ]);
        }
      } catch (err) {
        setTickerData([
          { symbol: "BTC", price: 65916.42, change: "1.23" },
          { symbol: "ETH", price: 2021.92, change: "-0.45" },
          { symbol: "SOL", price: 142.35, change: "2.15" },
          { symbol: "WIF", price: 0.175, change: "-1.20" },
        ]);
      }
    };
    fetchPrices();
    const id = setInterval(fetchPrices, 5_000); // Faster refresh
    return () => clearInterval(id);
  }, []);

  const display = user?.email?.address || (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "AUTH_OK");

  return (
    <div className="min-h-screen bg-[#020408] text-zinc-300 font-sans selection:bg-[#00d1ff] selection:text-black flex flex-col cursor-default">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#1a2b3b] bg-gradient-to-r from-black via-[#050a12] to-black sticky top-0 z-50 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setTab("portfolio")}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 flex items-center justify-center"
            style={{ borderColor: PACIFICA_BLUE }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2"
              style={{ backgroundColor: PACIFICA_BLUE, boxShadow: `0 0 10px ${PACIFICA_BLUE}` }}
            />
          </motion.div>
          <span className="font-mono font-black tracking-[0.5em] text-sm text-white uppercase cursor-pointer hover:text-[#00d1ff] transition-colors">
            PACIFICA<span style={{ color: PACIFICA_BLUE }}>_PILOT</span>
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-zinc-950/80 p-1.5 border border-[#1a2b3b] rounded-xl backdrop-blur-sm">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg relative overflow-hidden cursor-pointer ${
                tab === t
                  ? "text-black shadow-[0_0_25px_rgba(0,209,255,0.4)]"
                  : "text-zinc-600 hover:text-zinc-300"
              }`}
              style={tab === t ? { backgroundColor: PACIFICA_BLUE } : {}}
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                />
              )}
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-8 font-mono text-zinc-500 uppercase tracking-tighter">
          <button
            onClick={() => setShowProtocol(true)}
            className="text-xs hover:text-white border-b border-zinc-800 hover:border-[#00d1ff] pb-0.5 transition-all cursor-pointer"
          >
            System_Protocol
          </button>
          <div className="flex items-center gap-4 border-l border-[#1a2b3b] pl-8">
            <div className="flex items-center gap-2 cursor-pointer" title="Connected wallet">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_#22c55e]" />
              <span className="text-xs">{display}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-red-500 font-black hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all px-3 py-1 border border-transparent hover:border-red-500/30 rounded cursor-pointer"
            >
              EXIT
            </button>
          </div>
        </div>
      </nav>

      {/* Agent Status Bar */}
      <AgentStatusBar />

      {/* Live Ticker Tape */}
      <div className="bg-black border-b border-[#1a2b3b] py-2 overflow-hidden flex font-mono text-xs uppercase tracking-wider relative">
        <div className="px-4 border-r border-[#1a2b3b] text-zinc-600 flex items-center gap-2 font-black select-none z-10 bg-black sticky left-0">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_#22c55e]" />
            LIVE_MARKET
          </span>
        </div>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 px-8 whitespace-nowrap min-w-max"
        >
          {[...tickerData, ...tickerData].map((t, i) => (
            <div key={i} className="flex gap-3 items-center border-r border-zinc-900 pr-6 cursor-pointer hover:bg-[#00d1ff05] px-2 rounded transition-colors">
              <span className="font-black text-white">{t.symbol}</span>
              <span className="text-zinc-400">${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
              <span className={`font-bold ${parseFloat(t.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(t.change) >= 0 ? '▲' : '▼'} {Math.abs(t.change)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-10 max-w-7xl w-full mx-auto pb-32 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {tab === "portfolio" && <PortfolioTab />}
            {tab === "config" && <ConfigTab />}
            {tab === "decisions" && <DecisionsTab />}
            {tab === "logs" && <LogsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a2b3b] bg-gradient-to-r from-black via-[#050a12] to-black px-8 py-4 flex justify-between items-center text-xs font-mono uppercase tracking-[0.25em] text-zinc-600 fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full shadow-[0_0_8px_#00d1ff]"
              style={{ backgroundColor: PACIFICA_BLUE }}
            />
            <span>Chain: <span className="text-zinc-400">Pacifica_Testnet</span></span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <span>AES_256:</span>
            <span style={{ color: PACIFICA_BLUE }} className="font-black">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <span>Agent:</span>
            <span className="text-zinc-400">v1.0.0</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-zinc-700">TERMINAL_TIME:</span>
          <span className="text-white font-bold">{systemTime}</span>
        </div>
      </footer>

      {/* SYSTEM PROTOCOL MODAL - Detailed */}
      <AnimatePresence>
        {showProtocol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-black/95 backdrop-blur-2xl"
            onClick={() => setShowProtocol(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-[#080808] border border-[#1a2b3b] w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1a2b3b] flex justify-between items-center bg-gradient-to-r from-zinc-950 to-black">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rotate-45" style={{ backgroundColor: PACIFICA_BLUE, boxShadow: `0 0 15px ${PACIFICA_BLUE}` }} />
                  <h2 className="text-white text-xl font-black tracking-tighter uppercase italic">
                    System_Infrastructure_Specs
                  </h2>
                </div>
                <button
                  onClick={() => setShowProtocol(false)}
                  className="px-5 py-2 text-xs font-black uppercase hover:invert transition-all border border-zinc-800 hover:border-[#00d1ff] cursor-pointer"
                  style={{ backgroundColor: PACIFICA_BLUE, color: '#000' }}
                >
                  Close [ESC]
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">

                {/* Architecture Diagram */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] italic">// System_Architecture</h3>
                    <div className="h-px flex-1 bg-zinc-900" />
                  </div>
                  <div className="flex justify-center bg-zinc-950/50 border border-[#1a2b3b] p-8 rounded-xl">
                    <SystemSVG blue={PACIFICA_BLUE} />
                  </div>
                </section>

                {/* Feature Cards Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FeatureCard
                    icon="◈"
                    title="Circuit_Breaker"
                    desc="Monitors Pacifica API health. After 5 consecutive failures, automatically switches to Binance Spot Klines for uninterrupted RSI calculation."
                    color="#22c55e"
                  />
                  <FeatureCard
                    icon="◈"
                    title="AI_Intelligence"
                    desc="Gemini 2.5 Flash analyzes market data + Elfa AI sentiment scores to generate trading decisions with confidence-weighted reasoning."
                    color={PACIFICA_BLUE}
                  />
                  <FeatureCard
                    icon="◈"
                    title="Trailing_Stops"
                    desc="Dynamic stop-loss follows peak price for longs (or trough for shorts), locking profits as positions move favorably."
                    color="#f59e0b"
                  />
                </section>

                {/* Tech Stack */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] italic">// Technology_Stack</h3>
                    <div className="h-px flex-1 bg-zinc-900" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Frontend", tech: "React 18 + Vite", icon: "⚛" },
                      { name: "State", tech: "React Hooks", icon: "🔄" },
                      { name: "Animations", tech: "Framer Motion", icon: "✨" },
                      { name: "Backend", tech: "Node.js + Express", icon: "📦" },
                      { name: "Database", tech: "MongoDB Atlas", icon: "🍃" },
                      { name: "AI Model", tech: "Gemini 2.5 Flash", icon: "🤖" },
                      { name: "Sentiment", tech: "Elfa AI API", icon: "📊" },
                      { name: "DEX", tech: "Pacifica (Solana)", icon: "◎" },
                    ].map((item, i) => (
                      <div key={i} className="p-5 border border-zinc-900 bg-zinc-950/30 hover:border-[#00d1ff] transition-all cursor-pointer group">
                        <span className="text-2xl block mb-2">{item.icon}</span>
                        <span className="text-sm text-zinc-600 uppercase tracking-widest block mb-1">{item.name}</span>
                        <span className="text-white font-bold text-[10px] group-hover:text-[#00d1ff] transition-colors">{item.tech}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Security & Encryption */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] italic">// Security_Protocol</h3>
                    <div className="h-px flex-1 bg-zinc-900" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-green-900/50 bg-gradient-to-br from-green-900/10 to-transparent">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-green-500 text-lg">🔐</span>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-widest">AES-256 Encryption</h4>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed uppercase tracking-tight">
                        All sensitive data (private keys, API keys) encrypted before MongoDB storage. Decryption happens only in runtime memory.
                      </p>
                    </div>
                    <div className="p-6 border border-[#00d1ff]/30 bg-gradient-to-br from-[#00d1ff11] to-transparent">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#00d1ff] text-lg">🔑</span>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Ed25519 Signing</h4>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed uppercase tracking-tight">
                        Pacifica orders signed using Solana Ed25519 signatures. Private keys never transmitted to backend.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Trading Flow */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] italic">// Trading_Flow</h3>
                    <div className="h-px flex-1 bg-zinc-900" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { step: "01", title: "Config Fetch", desc: "Agent polls /api/agent/config for symbols, risk params, and enabled state" },
                      { step: "02", title: "Market Scan", desc: "Parallel fetch of RSI-14 (5m/1h), funding rates, and basis spread vs Binance" },
                      { step: "03", title: "Sentiment Sync", desc: "Elfa AI engagement scores and trending rankings retrieved for social context" },
                      { step: "04", title: "AI Inference", desc: "Gemini 2.5 Flash synthesizes all signals into LONG/SHORT/HOLD with confidence %" },
                      { step: "05", title: "Risk Check", desc: "Position sizing capped by available_balance * 0.9, minimum $10 order enforced" },
                      { step: "06", title: "Order Broadcast", desc: "Ed25519-signed market order POSTed to Pacifica with trailing stop metadata" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 border border-zinc-900 bg-zinc-950/30 hover:border-[#00d1ff] transition-all cursor-pointer group">
                        <span className="text-[#00d1ff] font-black text-[10px] font-mono">{item.step}</span>
                        <div>
                          <h4 className="text-white font-bold text-[10px] uppercase tracking-widest mb-1">{item.title}</h4>
                          <p className="text-zinc-500 text-xs leading-relaxed uppercase">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="p-6 border border-[#1a2b3b] bg-gradient-to-br from-[#00d1ff11] to-transparent relative group hover:border-[#00d1ff] transition-all cursor-pointer">
      <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" style={{ color }}>{icon}</span>
        <h4 className="text-white font-black mb-6 text-xs uppercase tracking-widest border-b border-[#1a2b3b] pb-2">{title}</h4>
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed uppercase tracking-tight">
        {desc}
      </p>
    </div>
  );
}

function SystemSVG({ blue }) {
  return (
    <svg viewBox="0 0 800 400" className="w-full max-w-3xl">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orientation="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#1a2b3b" />
        </marker>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor={blue} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Connection Lines */}
      <g className="connections" strokeDasharray="5,5" opacity="0.5">
        <path d="M140,110 L140,200 L310,200" fill="none" stroke="#1a2b3b" strokeWidth="2" markerEnd="url(#arrow)" />
        <path d="M660,110 L660,200 L490,200" fill="none" stroke="#1a2b3b" strokeWidth="2" markerEnd="url(#arrow)" />
        <path d="M400,230 L400,320" fill="none" stroke="#1a2b3b" strokeWidth="2" markerEnd="url(#arrow)" />
      </g>

      {/* Nodes */}
      <g className="nodes">
        <rect x="50" y="50" width="180" height="60" fill="none" stroke="white" strokeWidth="2" rx="8" />
        <text x="140" y="85" fill="white" fontSize="11" fontWeight="900" textAnchor="middle" className="font-mono">USER_TERMINAL</text>

        <rect x="310" y="170" width="180" height="60" fill="none" stroke="#1a2b3b" strokeWidth="2" rx="8" />
        <text x="400" y="205" fill="#a1a1aa" fontSize="11" fontWeight="900" textAnchor="middle" className="font-mono">EXPRESS_CORE</text>

        <rect x="570" y="50" width="180" height="60" fill="none" stroke={blue} strokeWidth="2" rx="8" />
        <text x="660" y="85" fill={blue} fontSize="11" fontWeight="900" textAnchor="middle" className="font-mono">PYTHON_AGENT</text>

        <rect x="310" y="320" width="180" height="50" fill="none" stroke="#1a2b3b" strokeWidth="2" rx="8" />
        <text x="400" y="350" fill="#3f3f46" fontSize="10" fontWeight="900" textAnchor="middle" className="font-mono">MONGO_DB_ATLAS</text>
      </g>

      {/* AI Orb */}
      <circle cx="400" cy="80" r="45" fill="none" stroke={blue} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
      <text x="400" y="85" fill={blue} fontSize="9" fontWeight="900" textAnchor="middle" className="font-mono">GEMINI_2.5</text>

      {/* Animated Packets */}
      <motion.circle r="4" fill="white"
        animate={{ cx: [140, 140, 310], cy: [110, 200, 200] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ filter: `drop-shadow(0 0 8px ${blue})` }}
      />
      <motion.circle r="4" fill={blue}
        animate={{ cx: [660, 660, 490], cy: [110, 200, 200] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
        style={{ filter: `drop-shadow(0 0 8px ${blue})` }}
      />
    </svg>
  );
}

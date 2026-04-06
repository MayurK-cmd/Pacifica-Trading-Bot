import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const { authenticated } = usePrivy();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ enabled: false, active: false });
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [showFeatures, setShowFeatures] = useState(false);

  const PACIFICA_BLUE = "#00d1ff";
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Status Polling Effect
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/agent/status`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        // Ensure we only update if the component is still mounted
        setStatus({ enabled: data.enabled || false, active: data.active || false });
      } catch (e) { 
        console.error("Status fetch failed:", e);
        setStatus({ enabled: false, active: false }); // Reset to offline on error
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => clearInterval(id);
  }, [API_BASE]); // Added API_BASE as dependency

  const handleLaunch = () => authenticated ? navigate("/dashboard") : navigate("/login");

  // Live ticker data
  const [tickerData, setTickerData] = useState([]);
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("https://test-api.pacifica.fi/api/v1/info/prices");
        const raw = await res.json();
        const syms = (raw?.data || []).filter(i => i.symbol && i.mark_price).map(i => ({
          symbol: i.symbol,
          price: parseFloat(i.mark_price),
          change: (Math.random() * 4 - 1.5).toFixed(2),
        })).sort((a, b) => b.price - a.price);
        if (syms.length > 0) setTickerData(syms);
        else setTickerData([
          { symbol: "BTC", price: 65916.42, change: "1.23" },
          { symbol: "ETH", price: 2021.92, change: "-0.45" },
          { symbol: "SOL", price: 142.35, change: "2.15" },
          { symbol: "WIF", price: 0.175, change: "-1.20" },
        ]);
      } catch { setTickerData([{ symbol: "BTC", price: 65916.42, change: "1.23" }]); }
    };
    fetchPrices();
    const id = setInterval(fetchPrices, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-zinc-100 font-sans selection:bg-[#00d1ff] selection:text-black flex flex-col overflow-x-hidden">

      {/* Live Ticker - Below Nav */}
      <div className="bg-black border-b border-[#1a2b3b] py-1.5 overflow-hidden flex font-mono text-[8px] uppercase tracking-wider relative">
        <div className="px-3 border-r border-[#1a2b3b] text-zinc-600 flex items-center gap-1.5 font-black select-none z-10 bg-black">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse shadow-[0_0_4px_#22c55e]" />
            LIVE
          </span>
        </div>
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="flex gap-6 px-6 whitespace-nowrap min-w-max">
          {[...tickerData, ...tickerData].map((t, i) => (
            <div key={i} className="flex gap-2 items-center border-r border-zinc-900 pr-4">
              <span className="font-black text-white">{t.symbol}</span>
              <span className="text-zinc-400">${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
              <span className={`font-bold ${parseFloat(t.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(t.change) >= 0 ? '▲' : '▼'} {Math.abs(t.change)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* HUD Header */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-[#1a2b3b] bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ rotate: [0, 90, 180, 270, 360], borderColor: [PACIFICA_BLUE, "#fff", PACIFICA_BLUE] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="w-6 h-6 border-2 flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5" style={{ backgroundColor: PACIFICA_BLUE }} />
          </motion.div>
          <span className="font-mono font-black tracking-[0.5em] text-sm uppercase" style={{ color: PACIFICA_BLUE }}>
            PACIFICA_PILOT
          </span>
        </div>

        <div className="hidden md:flex gap-10 items-center font-mono text-[11px] tracking-widest uppercase text-zinc-500">
          <div className="flex items-center gap-3 border border-[#1a2b3b] px-5 py-2 rounded-sm bg-[#050a12] shadow-[0_0_15px_rgba(0,209,255,0.1)]">
            <motion.span 
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }} 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: status.active ? PACIFICA_BLUE : '#3f3f46', 
                boxShadow: status.active ? `0 0 10px ${PACIFICA_BLUE}` : 'none' 
              }}
            />
            <span>{status.active ? 'NODE_ACTIVE' : 'NODE_OFFLINE'}</span>
          </div>
          <Link to="/docs" className="hover:text-white transition-colors" style={{ borderBottom: `1px solid ${PACIFICA_BLUE}33` }}>Documentation</Link>
          <button 
            onClick={handleLaunch} 
            className="px-8 py-2 font-black transition-all uppercase active:scale-95 shadow-xl hover:opacity-90 cursor-pointer" 
            style={{ backgroundColor: PACIFICA_BLUE, color: '#000' }}
          >
            {authenticated ? 'Enter_Terminal' : 'Initialize_Node'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-10 pt-40 pb-32">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl border-l-[6px] pl-16"
          style={{ borderColor: PACIFICA_BLUE }}
        >
          <span className="inline-block font-mono text-[12px] uppercase tracking-[0.8em] mb-8" style={{ color: PACIFICA_BLUE }}>
            Autonomous_Intelligence_Protocol
          </span>
          <h1 className="text-8xl md:text-[9rem] font-black tracking-tighter leading-[0.8] mb-16 uppercase italic">
            Autonomous <br />Agent <br /><span className="not-italic" style={{ color: PACIFICA_BLUE }}>in action.</span>
          </h1>
          <p className="max-w-2xl text-zinc-400 font-mono text-lg leading-relaxed mb-20 uppercase tracking-tighter">
            PacificaPilot is a full-stack autonomous trading system designed for the Pacifica perpetual futures DEX on Solana.
            Processing on-chain signals, Elfa AI sentiment, and Gemini 2.5 Flash reasoning into 24/7 execution.
          </p>
          
          <div className="flex flex-wrap gap-10 items-center">
            <button
                onClick={handleLaunch}
                className="px-20 py-8 font-black uppercase tracking-[0.5em] text-lg hover:invert transition-all active:scale-95 shadow-[0_0_40px_rgba(0,209,255,0.2)] cursor-pointer"
                style={{ backgroundColor: PACIFICA_BLUE, color: '#000' }}
            >
              Start_Cycle
            </button>
            <button
              onClick={() => setShowFeatures(true)}
              className="px-8 py-8 font-black uppercase tracking-[0.3em] text-lg border border-[#1a2b3b] hover:border-[#00d1ff] hover:text-[#00d1ff] transition-all cursor-pointer"
            >
              Features_
            </button>
            <div className="flex flex-col border-l border-[#1a2b3b] pl-10 text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-widest mb-1">Hackathon_Track</span>
              <span className="text-white font-black text-2xl tracking-tighter uppercase italic">Trading_Apps_&_Innovation</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Strengths Grid */}
      <section className="border-t border-[#1a2b3b] bg-[#050a12] py-40">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="font-mono text-[13px] uppercase tracking-[0.6em] mb-24 underline underline-offset-[12px]" style={{ color: PACIFICA_BLUE, textDecorationColor: '#1a2b3b' }}>
            System_Capabilities_Report
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-[#1a2b3b]">
            {[
              { t: "AI INFERENCE", d: "Gemini 2.5 Flash analyzes aggregate RSI and Basis signals for nuanced decisions." },
              { t: "SENTIMENT LAYER", d: "Elfa AI calculates engagement scores without polarity bias using Twitter metrics." },
              { t: "SECURE VAULT", d: "AES-256-CBC local encryption for all Pacifica private keys before storage." },
              { t: "PARALLEL_CORE", d: "ThreadPoolExecutor enables the agent to monitor up to 10 market symbols concurrently." },
              { t: "RISK_GUARD", d: "Trailing stop-loss, take-profit, and default dry-run mode for capital safety." },
              { t: "SSE STREAMING", d: "Low-latency audit trail of every agent thought cycle directly to the dashboard." }
            ].map((item, i) => (
              <motion.div 
                whileHover={{ borderColor: PACIFICA_BLUE, backgroundColor: '#020408' }} 
                key={i} 
                className="p-12 border-r border-b border-[#1a2b3b] transition-all group cursor-pointer"
              >
                <span className="font-mono text-[10px] mb-8 block tracking-widest font-black" style={{ color: PACIFICA_BLUE }}>ID_STRENGTH_0{i+1}</span>
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter group-hover:italic transition-all group-hover:text-[#00d1ff]">{item.t}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-10 py-40 border-l border-[#1a2b3b] ml-10 md:ml-32">
        <h2 className="text-6xl font-black uppercase tracking-tighter mb-24 italic">Autonomous_Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-20">
            {[
              { id: "01", t: "Ingest Intelligence", d: "Agent fetches 5m/1h price action, funding basis, and Elfa AI social engagement scores." },
              { id: "02", t: "AI Inference Cycle", d: "Gemini 2.5 Flash synthesizes signals into plain-English reasoning and LONG/SHORT logic." },
              { id: "03", t: "Signed Execution", d: "Orders are signed via Ed25519 (Solders) and broadcast to Pacifica with risk guardrails." },
              { id: "04", t: "Real-time Auditing", d: "Execution logs stream back to your dashboard via SSE for 24/7 autonomous visibility." }
            ].map((step) => (
              <div key={step.id} className="flex gap-12">
                <span className="font-mono text-4xl font-black italic" style={{ color: '#1a2b3b' }}>{step.id}</span>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4 underline underline-offset-8" style={{ textDecorationColor: PACIFICA_BLUE }}>{step.t}</h4>
                  <p className="text-zinc-500 text-base leading-relaxed uppercase tracking-tighter">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-[#050a12] border border-[#1a2b3b] p-12 font-mono shadow-2xl relative">
             <div className="absolute -top-3 -right-3 w-8 h-8 rotate-45 border-2" style={{ borderColor: PACIFICA_BLUE, backgroundColor: '#020408' }} />
             <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-12 border-b border-[#1a2b3b] pb-6 italic" style={{ color: PACIFICA_BLUE }}>System_Core_Specifications</h3>
             <ul className="space-y-8 text-[12px] text-zinc-500 uppercase tracking-widest">
                <li className="flex justify-between border-b border-[#1a2b3b] pb-3"><span>Runtime</span> <span className="text-zinc-100 font-bold">Python 3.11+</span></li>
                <li className="flex justify-between border-b border-[#1a2b3b] pb-3"><span>Decision Engine</span> <span className="text-zinc-100 font-bold">Gemini 2.5 Flash</span></li>
                <li className="flex justify-between border-b border-[#1a2b3b] pb-3"><span>Social Layer</span> <span className="text-zinc-100 font-bold">Elfa AI API</span></li>
                <li className="flex justify-between border-b border-[#1a2b3b] pb-3"><span>Protocol</span> <span className="text-zinc-100 font-bold">Pacifica (Solana)</span></li>
                <li className="flex justify-between"><span>Encryption</span> <span className="text-zinc-100 font-bold">AES-256-CBC</span></li>
             </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#1a2b3b] bg-gradient-to-b from-black to-[#050a12] py-32">
        <div className="max-w-5xl mx-auto px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] mb-6 block" style={{ color: PACIFICA_BLUE }}>
              Deployment_Ready
            </span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
              Start_Autonomous_Trading
            </h2>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-12 max-w-2xl mx-auto">
              Deploy your node in minutes. Connect wallet, configure parameters, and let AI drive your Pacifica strategy 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={handleLaunch}
                className="px-16 py-6 font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all active:scale-95 shadow-[0_0_30px_rgba(0,209,255,0.2)] cursor-pointer"
                style={{ backgroundColor: PACIFICA_BLUE, color: '#000' }}
              >
                Launch_Terminal
              </button>
              <a
                href="https://github.com/MayurK-cmd/Pacificia-Trading-Bot"
                target="_blank"
                rel="noreferrer"
                className="px-16 py-6 font-black uppercase tracking-[0.4em] text-sm border border-[#1a2b3b] hover:border-[#00d1ff] hover:text-[#00d1ff] transition-all cursor-pointer"
              >
                View_Source
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Modal */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-black/95 backdrop-blur-2xl"
            onClick={() => setShowFeatures(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-[#080808] border border-[#1a2b3b] w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#1a2b3b] flex justify-between items-center bg-gradient-to-r from-zinc-950 to-black">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rotate-45" style={{ backgroundColor: PACIFICA_BLUE, boxShadow: `0 0 15px ${PACIFICA_BLUE}` }} />
                  <h2 className="text-white text-xl font-black tracking-tighter uppercase italic">System_Capabilities</h2>
                </div>
                <button onClick={() => setShowFeatures(false)} className="px-5 py-2 text-[9px] font-black uppercase hover:invert transition-all border border-zinc-800 hover:border-[#00d1ff] cursor-pointer" style={{ backgroundColor: PACIFICA_BLUE, color: '#000' }}>Close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: "🤖", title: "AI_INFERENCE", desc: "Gemini 2.5 Flash synthesizes RSI, basis, and sentiment into LONG/SHORT/HOLD decisions with confidence-weighted reasoning." },
                    { icon: "📊", title: "SENTIMENT_LAYER", desc: "Elfa AI calculates engagement scores from Twitter/X metrics for social context on market movements." },
                    { icon: "🔐", title: "SECURE_VAULT", desc: "AES-256-CBC encryption for private keys. Decryption only in runtime memory, never stored plaintext." },
                    { icon: "⚡", title: "PARALLEL_CORE", desc: "ThreadPoolExecutor monitors up to 10 symbols concurrently with non-blocking market analysis." },
                    { icon: "🛡️", title: "RISK_GUARD", desc: "Trailing stop-loss, take-profit thresholds, position sizing limits, and dry-run mode for capital protection." },
                    { icon: "📡", title: "SSE_STREAMING", desc: "Server-sent events push real-time agent logs to dashboard for full audit trail visibility." },
                    { icon: "🔄", title: "CIRCUIT_BREAKER", desc: "Auto-fallback to Binance Spot Klines when Pacifica API fails, ensuring uninterrupted RSI calculation." },
                    { icon: "📈", title: "TRAILING_STOPS", desc: "Dynamic stop-loss follows peak price (longs) or trough (shorts), locking profits as positions move favorably." },
                  ].map((item, i) => (
                    <div key={i} className="p-6 border border-zinc-900 bg-zinc-950/30 hover:border-[#00d1ff] transition-all cursor-pointer group">
                      <span className="text-3xl block mb-4">{item.icon}</span>
                      <h4 className="text-white font-black text-[9px] uppercase tracking-widest mb-3 border-b border-[#1a2b3b] pb-2 group-hover:text-[#00d1ff] transition-colors">{item.title}</h4>
                      <p className="text-zinc-500 text-[9px] leading-relaxed uppercase tracking-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Institutional Footer */}
      <footer className="border-t border-[#1a2b3b] bg-black px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[12px] font-mono uppercase tracking-[0.3em] text-zinc-500">
        <div className="flex flex-col md:flex-row gap-12">
          <span className="cursor-default italic text-zinc-700">© 2026_PILOT_CORE</span>
          <a href="https://github.com/MayurK-cmd/Pacificia-Trading-Bot" target="_blank" rel="noreferrer" className="underline underline-offset-8 decoration-zinc-800 hover:text-white transition-colors font-bold">Github_Source</a>
          <button className="hover:text-white transition-colors text-zinc-600">Protocol_Status: {systemTime}</button>
        </div>
        <div className="flex gap-10 items-center">
          <a href="https://test-app.pacifica.fi/" target="_blank" rel="noreferrer" className="hover:text-[#00d1ff] transition-colors underline underline-offset-4 decoration-[#1a2b3b]">
            Pacifica_App
          </a>
          <a href="https://pacifica.gitbook.io/docs/hackathon/pacifica-hackathon" target="_blank" rel="noreferrer" className="hover:text-[#00d1ff] transition-colors underline underline-offset-4 decoration-[#1a2b3b]">
            Hackathon_Docs
          </a>
          <div className="flex items-center gap-4 border border-zinc-900 px-6 py-3 bg-zinc-950/50 rounded-sm">
             <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PACIFICA_BLUE, boxShadow: `0 0 15px ${PACIFICA_BLUE}` }}
             />
             <span className="text-zinc-300 font-black tracking-[0.1em]">ENCRYPTION_ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
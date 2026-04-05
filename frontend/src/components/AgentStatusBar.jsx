import { useState, useEffect } from "react";
import { useApi } from "../useApi";
import { motion } from "framer-motion";

export default function AgentStatusBar() {
  const api = useApi();
  const PACIFICA_BLUE = "#00d1ff";

  const [status,   setStatus]   = useState(null);
  const [enabled,  setEnabled]  = useState(null);
  const [toggling, setToggling] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    api.get("/api/config").then(cfg => setEnabled(cfg.enabled)).catch(() => {});
  }, [api]);

  useEffect(() => {
    const poll = () => {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/agent/status`)
        .then(r => r.json())
        .then(s => setStatus(s))
        .catch(() => setStatus(null));
    };
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []);

  async function toggle() {
    if (toggling || enabled === null) return;
    setToggling(true);
    setError("");
    try {
      const res = await api.post("/api/agent/toggle", { enabled: !enabled });
      setEnabled(res.enabled);
    } catch (e) {
      setError(e.message);
    } finally {
      setToggling(false);
    }
  }

  const isRunning = status?.running ?? false;
  const dotColor = !enabled ? "#3f3f46" : isRunning ? PACIFICA_BLUE : "#f59e0b";
  const statusText = !enabled ? "OFFLINE" : isRunning ? "ACTIVE" : "STANDBY";

  return (
    <div className="flex items-center justify-between px-8 py-3 border-b border-[#1a2b3b] bg-gradient-to-r from-[#00d1ff05] to-transparent font-mono text-sm uppercase tracking-wider">
      <div className="flex items-center gap-6">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/50 border border-zinc-900 rounded-sm">
          <motion.span
            animate={isRunning ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : { opacity: 0.4 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
            style={{ color: dotColor, backgroundColor: dotColor }}
          />
          <span className="text-white font-black tracking-[0.2em]">{statusText}</span>
        </div>

        {/* Last Symbol */}
        {isRunning && status?.lastSymbol && (
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-xs uppercase tracking-widest">Monitoring:</span>
            <span style={{ color: PACIFICA_BLUE }} className="font-black">{status.lastSymbol}</span>
          </div>
        )}

        {/* Cycle Counter */}
        {isRunning && (
          <div className="flex items-center gap-2 text-zinc-600 border-l border-zinc-800 pl-5">
            <span className="text-xs uppercase tracking-widest">Cycles:</span>
            <span className="text-zinc-400 font-mono">{status?.cyclesCompleted || 0}</span>
          </div>
        )}

        {/* Last Activity */}
        {status?.lastCycleAt && (
          <div className="flex items-center gap-2 text-zinc-600 border-l border-zinc-800 pl-5">
            <span className="text-xs uppercase tracking-widest">Last_Active:</span>
            <span className="text-zinc-400 font-mono">{new Date(status.lastCycleAt).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-500 font-black flex items-center gap-2"
          >
            <span className="animate-pulse">⚠</span> {error}
          </motion.div>
        )}

        {/* Toggle Control */}
        <button
          onClick={toggle}
          disabled={toggling}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border cursor-pointer ${
            enabled
              ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              : "bg-[#00d1ff] border-[#00d1ff] text-black hover:bg-[#00d1ffcc]"
          } ${toggling ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {toggling ? "STOPPING..." : enabled ? "STOP AGENT" : "START AGENT"}
        </button>
      </div>
    </div>
  );
}

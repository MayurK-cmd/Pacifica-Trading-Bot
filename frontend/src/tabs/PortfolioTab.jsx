import { useState, useEffect } from "react";
import { useApi } from "../useApi";
import { motion } from "framer-motion";

const LOGO_DEV_API = "https://img.logo.dev/crypto/";
const LOGO_DEV_API_KEY=import.meta.env.VITE_LOGO_DEV_API_KEY;

const getIcon = (sym) =>
  `${LOGO_DEV_API}${sym.toLowerCase()}?token=${LOGO_DEV_API_KEY}`;

export default function PortfolioTab() {
  const api = useApi();
  const [portfolio, setPortfolio] = useState(null);
  const [subTab, setSubTab] = useState("balance");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [chartView, setChartView] = useState("equity"); // 'equity' or 'pnl'
  const [lastUpdated, setLastUpdated] = useState(null);
  const PACIFICA_BLUE = "#00d1ff";

  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.get("/api/portfolio")
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPortfolio(data);
          setLastUpdated(new Date());
        }
      })
      .catch(e => {
        console.error("[PortfolioTab] Fetch error:", e);
        setError(e.message || "Failed to load portfolio");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Auto-reload every 5 seconds to update prices
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-[#1a2b3b] border-t-[#00d1ff] rounded-full"
      />
      <div className="font-mono text-zinc-500 animate-pulse uppercase tracking-[0.3em] text-xs">
        Syncing_Live_Chain_State...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-red-500 text-4xl">!</div>
      <div className="font-mono text-red-400 uppercase tracking-[0.3em] text-xs">
        {error}
      </div>
      <button
        onClick={load}
        className="cursor-pointer text-xs bg-[#00d1ff] text-black px-6 py-2 font-black uppercase tracking-widest hover:bg-[#00d1ffcc] transition-all"
      >
        Retry
      </button>
    </div>
  );

  if (!portfolio) return null;

  // Calculate stats from live data
  const totalPnl = portfolio.totalUnrealisedPnl || 0;
  const equity = portfolio.accountEquity || 0;
  const tradingVolume = portfolio.totalVolumeUsdc || 0;
  const equityHistory = portfolio.equityHistory || [];
  // Use backend-calculated realized PnL from trades history
  const totalRealizedPnl = portfolio.totalRealizedPnl || 0;
  const returnPct = equity > 0 ? ((totalRealizedPnl / equity) * 100) : 0;
  const totalBorrowed = portfolio.totalBorrowed || 0;
  const takerFee = ((portfolio.takerFeeRate || 0) * 100).toFixed(4);
  const makerFee = ((portfolio.makerFeeRate || 0) * 100).toFixed(4);

  // Get equity history for chart - this comes from /portfolio endpoint
  

  // Calculate Sharpe Ratio and Max Drawdown from equity history
  const calculateSharpeRatio = () => {
    if (equityHistory.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < equityHistory.length; i++) {
      const prevEquity = equityHistory[i - 1].equity;
      const currEquity = equityHistory[i].equity;
      if (prevEquity > 0) {
        returns.push((currEquity - prevEquity) / prevEquity);
      }
    }
    if (returns.length === 0) return 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) return 0;
    // Annualized Sharpe (assuming daily data, 252 trading days)
    return (avgReturn / stdDev) * Math.sqrt(252);
  };

  const calculateMaxDrawdown = () => {
    if (equityHistory.length === 0) return 0;
    let peak = equityHistory[0].equity;
    let maxDD = 0;
    for (const point of equityHistory) {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = (peak - point.equity) / peak;
      if (drawdown > maxDD) {
        maxDD = drawdown;
      }
    }
    return maxDD;
  };

  const sharpeRatio = calculateSharpeRatio();
  const maxDrawdown = calculateMaxDrawdown();

  // Generate chart path from equity history
  const generateChartPath = () => {
    if (!equityHistory || equityHistory.length === 0) return null;
    const width = 400;
    const height = 150;
    const padding = 20;
    const values = equityHistory.map(e => e.equity).filter(v => v > 0);
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = equityHistory.map((e, i) => {
      const x = (i / (equityHistory.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((e.equity - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `${linePath} L ${width - padding},${height} L ${padding},${height} Z`;

    return { linePath, areaPath, min, max };
  };

  const chartData = generateChartPath();

  // PnL chart data
  const generatePnLChartPath = () => {
    if (!equityHistory || equityHistory.length === 0) return null;
    const width = 400;
    const height = 150;
    const padding = 20;
    const values = equityHistory.map(e => e.pnl);
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = equityHistory.map((e, i) => {
      const x = (i / (equityHistory.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((e.pnl - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `${linePath} L ${width - padding},${height} L ${padding},${height} Z`;

    return { linePath, areaPath, min, max };
  };

  const pnlChartData = generatePnLChartPath();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-white text-3xl font-black uppercase tracking-tighter italic">Portfolio_Overview</h2>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-zinc-500 font-mono uppercase tracking-widest">
              Last: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className={`cursor-pointer text-xs bg-[#00d1ff] text-black px-4 py-2 font-black uppercase tracking-widest hover:bg-[#00d1ffcc] transition-all active:scale-95 flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
            >
              ↻
            </motion.span>
            {loading ? 'SYNCING...' : 'REFRESH'}
          </button>
        </div>
      </div>

      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Account_Equity"
          value={`$${equity.toFixed(2)}`}
          icon="◈"
        />
        <StatCard
          label="Trading_Volume"
          value={`$${tradingVolume.toFixed(2)}`}
          icon="◈"
        />
        <StatCard
          label="Total_Borrowed"
          value={`$${totalBorrowed.toFixed(2)}`}
          icon="◈"
        />
        <StatCard
          label="Fees_(Taker/Maker)"
          value={`${takerFee}% / ${makerFee}%`}
          icon="◈"
          extra={
            <a href="https://test-app.pacifica.fi/fee-schedule" target="_blank" rel="noreferrer" className="text-sm text-[#00d1ff] hover:underline uppercase">
              View_Fee_Schedule
            </a>
          }
        />
      </div>

      {/* Two Column: Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Detailed Stats */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 p-6 space-y-4">
          <StatRow label="Equity" value={`$${equity.toFixed(2)}`} />
          <StatRow label="PnL" value={`${totalRealizedPnl >= 0 ? '+' : ''}$${totalRealizedPnl.toFixed(2)}`} valueColor={totalRealizedPnl >= 0 ? "#22c55e" : "#ef4444"} />
          <StatRow label="Trading_Volume" value={`$${tradingVolume.toFixed(2)}`} />
          <StatRow label="Return_%" value={`${returnPct.toFixed(2)}%`} />
          <StatRow label="Sharpe_Ratio" value={sharpeRatio > 0 ? sharpeRatio.toFixed(4) : "0.0000"} />
          <StatRow label="Max_Drawdown" value={`${(maxDrawdown * 100).toFixed(2)}%`} />
        </div>

        {/* Right: Equity Chart */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setChartView("equity")}
                className={`text-xs font-black uppercase tracking-widest pb-1 transition-all ${
                  chartView === "equity"
                    ? "text-[#00d1ff] border-b border-[#00d1ff]"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                Account_Equity
              </button>
              <button
                onClick={() => setChartView("pnl")}
                className={`text-xs font-black uppercase tracking-widest pb-1 transition-all ${
                  chartView === "pnl"
                    ? "text-[#00d1ff] border-b border-[#00d1ff]"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                PnL
              </button>
              {lastUpdated && (
                <span className="text-sm text-zinc-600 font-mono uppercase tracking-widest ml-4">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <select
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase px-3 py-1 outline-none focus:border-[#00d1ff]"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All_Time</option>
              <option value="24h">24H</option>
              <option value="7d">7D</option>
              <option value="30d">30D</option>
            </select>
          </div>

          {/* Equity/PnL Chart */}
          <div className="relative h-48 bg-gradient-to-b from-[#00d1ff11] to-transparent border border-zinc-900">
            {chartView === "equity" ? (
              chartData ? (
                <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="37.5" x2="400" y2="37.5" stroke="#1a2b3b" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="#1a2b3b" strokeWidth="0.5" />
                  <line x1="0" y1="112.5" x2="400" y2="112.5" stroke="#1a2b3b" strokeWidth="0.5" />

                  {/* Area fill */}
                  <path d={chartData.areaPath} fill="url(#chartGradient)" />
                  {/* Line */}
                  <path
                    d={chartData.linePath}
                    fill="none"
                    stroke="#00d1ff"
                    strokeWidth="1.5"
                  />
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-xs uppercase tracking-widest">
                  No_Equity_History_Available
                </div>
              )
            ) : (
              pnlChartData ? (
                <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pnlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={pnlChartData.max >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={pnlChartData.max >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="37.5" x2="400" y2="37.5" stroke="#1a2b3b" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="#1a2b3b" strokeWidth="0.5" />
                  <line x1="0" y1="112.5" x2="400" y2="112.5" stroke="#1a2b3b" strokeWidth="0.5" />

                  {/* Zero line */}
                  {pnlChartData.min < 0 && pnlChartData.max > 0 && (
                    <line
                      x1="0"
                      y1={150 - 20 - ((0 - pnlChartData.min) / (pnlChartData.max - pnlChartData.min || 1)) * (150 - 40)}
                      x2="400"
                      y2={150 - 20 - ((0 - pnlChartData.min) / (pnlChartData.max - pnlChartData.min || 1)) * (150 - 40)}
                      stroke="#ef4444"
                      strokeWidth="0.5"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Area fill */}
                  <path d={pnlChartData.areaPath} fill="url(#pnlGradient)" />
                  {/* Line */}
                  <path
                    d={pnlChartData.linePath}
                    fill="none"
                    stroke={pnlChartData.max >= 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth="1.5"
                  />
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-xs uppercase tracking-widest">
                  No_PnL_History_Available
                </div>
              )
            )}

            {/* Y-axis labels */}
            {chartView === "equity" ? (
              chartData && (
                <>
                  <div className="absolute left-2 top-2 text-sm text-zinc-600 font-mono">${chartData.max.toFixed(2)}</div>
                  <div className="absolute left-2 bottom-2 text-sm text-zinc-600 font-mono">${chartData.min.toFixed(2)}</div>
                </>
              )
            ) : (
              pnlChartData && (
                <>
                  <div className="absolute left-2 top-2 text-sm text-zinc-600 font-mono">+${pnlChartData.max.toFixed(2)}</div>
                  <div className="absolute left-2 bottom-2 text-sm text-zinc-600 font-mono">-${Math.abs(pnlChartData.min).toFixed(2)}</div>
                </>
              )
            )}

            {/* X-axis labels */}
            {(chartData || pnlChartData) && equityHistory.length > 0 && (
              <>
                <div className="absolute bottom-1 left-2 text-sm text-zinc-600 font-mono">
                  {new Date(equityHistory[0].timestamp).toLocaleDateString()}
                </div>
                <div className="absolute bottom-1 right-2 text-sm text-zinc-600 font-mono">
                  {new Date(equityHistory[equityHistory.length - 1].timestamp).toLocaleDateString()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-zinc-950/50 p-1 border border-zinc-900 rounded-lg">
            {[
              { id: "balance", label: "Balance" },
              { id: "positions", label: "Positions" },
              { id: "orders", label: "Open_Orders" },
              { id: "history", label: "Trade_History" },
              { id: "orderHistory", label: "Order_History" },
              { id: "funding", label: "Funding_History" },
              { id: "deposits", label: "Deposits/Withdrawals" },
              { id: "payouts", label: "Payouts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`cursor-pointer px-4 py-2 text-sm font-black uppercase tracking-widest transition-all rounded-md ${
                  subTab === tab.id
                    ? "text-black bg-[#00d1ff] shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                    : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {subTab === "balance" && (
            <button className="cursor-pointer text-xs bg-[#00d1ff] text-black px-6 py-2 font-black uppercase tracking-widest hover:bg-[#00d1ffcc] hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all active:scale-95">
              Deposit
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="border border-zinc-900 bg-black overflow-hidden">
          {subTab === "balance" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Token</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Balance</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Available_To_Withdraw</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Type</th>
                  <th className="p-4 font-black tracking-widest text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {/* USDC row — always shown, carries the account-level fields */}
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-[#00d1ff05] transition-colors">
                  <td className="p-4 border-r border-zinc-900 text-white font-bold">
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol="USDC" />
                      USDC
                      <a
                        href="https://test-app.pacifica.fi/trade/USDC"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#00d1ff] hover:underline uppercase tracking-widest"
                      >
                        Trade
                      </a>
                    </div>
                  </td>
                  <td className="p-4 border-r border-zinc-900 text-zinc-300 font-bold">
                    ${(portfolio.usdcBalance || 0).toFixed(2)}
                    <div className="text-xs text-zinc-600 mt-0.5">Avail to spend: ${(portfolio.availableToSpend || 0).toFixed(2)}</div>
                  </td>
                  <td className="p-4 border-r border-zinc-900 text-zinc-300">
                    ${(portfolio.availableToWithdraw || 0).toFixed(2)}
                    {portfolio.pendingBalance > 0 && (
                      <div className="text-xs text-yellow-600 mt-0.5">Pending: ${(portfolio.pendingBalance || 0).toFixed(2)}</div>
                    )}
                  </td>
                  <td className="p-4 border-r border-zinc-900 text-zinc-500 text-xs uppercase tracking-widest">Cash</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <a
                        href="https://test-app.pacifica.fi/trade/USDC"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#00d1ff] hover:text-white uppercase font-black tracking-widest"
                      >
                        Trade
                      </a>
                      <button className="text-sm text-[#00d1ff] hover:text-white uppercase font-black tracking-widest">Deposit</button>
                      <button className="text-sm text-[#00d1ff] hover:text-white uppercase font-black tracking-widest">Withdraw</button>
                    </div>
                  </td>
                </motion.tr>

                {/* Spot crypto balances (BTC, WIF, etc.) */}
                {(portfolio.spotBalances || []).map((b, i) => (
                  <motion.tr
                    key={`${b.symbol}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#00d1ff05] transition-colors"
                  >
                    <td className="p-4 border-r border-zinc-900 text-white font-bold">
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={b.symbol} />
                        {b.symbol}
                        <a
                          href={`https://test-app.pacifica.fi/trade/${b.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#00d1ff] hover:underline uppercase tracking-widest"
                        >
                          Trade
                        </a>
                      </div>
                    </td>
                    <td className="p-4 border-r border-zinc-900 text-zinc-300 font-bold">
                      {b.amount % 1 === 0 ? b.amount.toFixed(2) : b.amount.toFixed(6)}
                    </td>
                    <td className="p-4 border-r border-zinc-900 text-zinc-300">
                      {b.availableToWithdraw % 1 === 0 ? b.availableToWithdraw.toFixed(2) : b.availableToWithdraw.toFixed(6)}
                    </td>
                    <td className="p-4 border-r border-zinc-900 text-zinc-500 text-xs uppercase tracking-widest">Spot</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a
                          href={`https://test-app.pacifica.fi/trade/${b.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#00d1ff] hover:text-white uppercase font-black tracking-widest"
                        >
                          Trade
                        </a>
                        <button className="text-sm text-[#00d1ff] hover:text-white uppercase font-black tracking-widest">Withdraw</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}

          {subTab === "positions" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Asset</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Side</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Size</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Entry_Price</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Mark_Price</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Unreal_PnL</th>
                  <th className="p-4 font-black tracking-widest text-xs">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {portfolio.positions && portfolio.positions.length > 0 ? (
                  portfolio.positions.map((p, i) => (
                    <motion.tr
                      key={`${p.symbol}-${p.side}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#00d1ff05] transition-colors"
                    >
                      <td className="p-4 border-r border-zinc-900 text-white font-bold flex items-center gap-3">
                        <CryptoIcon symbol={p.symbol} />
                        {p.symbol}
                      </td>
                      <td className={`p-4 border-r border-zinc-900 font-black text-xs tracking-widest ${p.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                        {p.side}
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">{p.size?.toFixed(4)}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-500">${p.entryPrice?.toLocaleString()}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-100 font-bold">${p.markPrice?.toLocaleString()}</td>
                      <td className={`p-4 border-r border-zinc-900 font-black ${p.unrealisedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {p.unrealisedPnl?.toFixed(4)}
                      </td>
                      <td className="p-4 text-zinc-400 font-bold">${p.margin?.toFixed(2)}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-zinc-800 text-4xl">∅</div>
                        <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Open_Positions</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {subTab === "orders" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Asset</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Type</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Side</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Size</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Price</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Status</th>
                  <th className="p-4 font-black tracking-widest text-xs">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {portfolio.orders && portfolio.orders.length > 0 ? (
                  portfolio.orders.map((o, i) => (
                    <motion.tr
                      key={`${o.symbol}-${o.timestamp}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#00d1ff05] transition-colors"
                    >
                      <td className="p-4 border-r border-zinc-900 text-white font-bold flex items-center gap-3">
                        <CryptoIcon symbol={o.symbol} />
                        {o.symbol}
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-500 uppercase text-xs">{o.type}</td>
                      <td className={`p-4 border-r border-zinc-900 font-black text-xs tracking-widest ${o.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                        {o.side}
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">{o.size}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">${o.price}</td>
                      <td className="p-4 border-r border-zinc-900">
                        <span className={`px-2 py-0.5 text-sm font-black uppercase tracking-widest ${
                          o.status === 'Open' ? 'text-yellow-500 bg-yellow-500/10' : 'text-zinc-500 bg-zinc-500/10'
                        }`}>{o.status}</span>
                      </td>
                      <td className="p-4 text-zinc-600">{new Date(o.timestamp).toLocaleTimeString()}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-zinc-800 text-4xl">∅</div>
                        <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Open_Orders</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {subTab === "history" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Asset</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Side</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Fill_Size</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Fill_Price</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Fee</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Realized_PnL</th>
                  <th className="p-4 font-black tracking-widest text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {portfolio.history && portfolio.history.length > 0 ? (
                  portfolio.history.map((h, i) => (
                    <motion.tr
                      key={`${h.symbol}-${h.timestamp}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#00d1ff05] transition-colors"
                    >
                      <td className="p-4 border-r border-zinc-900 text-white font-bold flex items-center gap-3">
                        <CryptoIcon symbol={h.symbol} />
                        {h.symbol}
                      </td>
                      <td className={`p-4 border-r border-zinc-900 font-black text-xs tracking-widest ${h.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                        {h.side}
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">{h.size}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">${(h.execPrice || 0).toFixed(4)}</td>
                      <td className="p-4 border-r border-zinc-900 text-red-900">-${h.fee}</td>
                      <td className={`p-4 border-r border-zinc-900 font-black ${h.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${h.pnl}
                      </td>
                      <td className="p-4 text-zinc-600">{new Date(h.timestamp).toLocaleDateString()}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-zinc-800 text-4xl">∅</div>
                        <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Trade_History</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {subTab === "orderHistory" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Asset</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Event</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Side</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Size</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Exec_Price</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Fee</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">PnL</th>
                  <th className="p-4 font-black tracking-widest text-xs">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {portfolio.history && portfolio.history.length > 0 ? (
                  portfolio.history.map((h, i) => (
                    <motion.tr
                      key={`${h.historyId || i}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#00d1ff05] transition-colors"
                    >
                      <td className="p-4 border-r border-zinc-900 text-white font-bold">
                        <div className="flex items-center gap-3">
                          <CryptoIcon symbol={h.symbol} />
                          {h.symbol}
                        </div>
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-500 text-xs uppercase tracking-widest">
                        {(h.eventType || "").replace("fulfill_", "")}
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300 text-xs uppercase">{h.side}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">{h.size?.toFixed(4)}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">${h.execPrice?.toFixed(4)}</td>
                      <td className="p-4 border-r border-zinc-900 text-red-400">-${h.fee?.toFixed(4)}</td>
                      <td className={`p-4 border-r border-zinc-900 font-black ${h.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {h.pnl !== 0 ? `${h.pnl >= 0 ? '+' : ''}$${h.pnl?.toFixed(4)}` : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="p-4 text-zinc-600">{new Date(h.timestamp).toLocaleString()}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-zinc-800 text-4xl">∅</div>
                        <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Order_History</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {subTab === "funding" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Asset</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Rate</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Payment</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Balance</th>
                  <th className="p-4 font-black tracking-widest text-xs">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {portfolio.funding && portfolio.funding.length > 0 ? (
                  portfolio.funding.map((f, i) => (
                    <motion.tr
                      key={`${f.symbol}-${f.timestamp}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#00d1ff05] transition-colors"
                    >
                      <td className="p-4 border-r border-zinc-900 text-white font-bold">{f.symbol}</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-400">{f.rate}</td>
                      <td className={`p-4 border-r border-zinc-900 font-black ${f.payment >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {f.payment >= 0 ? '+' : ''}{f.payment}
                      </td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-400">{f.balance}</td>
                      <td className="p-4 text-zinc-600">{new Date(f.timestamp).toLocaleString()}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-zinc-800 text-4xl">∅</div>
                        <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Funding_Payments</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {subTab === "deposits" && (
            <div className="p-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="text-zinc-800 text-4xl">∅</div>
                <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Deposits_Withdrawals</div>
                <p className="text-zinc-600 text-xs uppercase font-mono tracking-widest mt-2">
                  Deposit/withdrawal history requires a separate Pacifica API endpoint
                </p>
              </div>
            </div>
          )}

          {subTab === "payouts" && (
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-zinc-950 text-zinc-500 uppercase">
                <tr>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Asset</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Amount</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">To</th>
                  <th className="p-4 border-r border-zinc-900 font-black tracking-widest text-xs">Status</th>
                  <th className="p-4 font-black tracking-widest text-xs">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-zinc-800 text-4xl">∅</div>
                      <div className="text-zinc-700 uppercase font-mono tracking-[0.3em] text-[10px]">No_Payouts</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CryptoIcon({ symbol, size = "6" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const src = getIcon(symbol);

  return (
    <div className={`w-${size} h-${size} rounded-full bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center`}>
      {!loaded && !error && <div className={`w-full h-full bg-zinc-800 rounded-full animate-pulse`} />}
      {error ? (
        <span className="text-white font-black text-sm">{symbol[0]}</span>
      ) : (
        <img
          src={src}
          alt={symbol}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true);
            setError(true);
          }}
          className={`w-full h-full object-contain ${loaded && !error ? 'block' : 'hidden'}`}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color = "#fff", icon = "◈", extra }) {
  return (
    <div className="bg-zinc-950 p-6 border border-zinc-900 hover:border-[#00d1ff]/50 hover:shadow-[0_0_20px_rgba(0,209,255,0.1)] transition-all cursor-default group relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-zinc-600 uppercase tracking-[0.2em] font-mono group-hover:text-[#00d1ff] transition-colors">
          {label}
        </span>
        {extra}
      </div>
      <div className="flex items-center gap-3">
        <span className="block text-2xl font-black tracking-tighter text-white" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function StatRow({ label, value, valueColor = "#fff" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-bold text-white" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

function ToggleSwitch({ defaultEnabled = true }) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-10 h-5 rounded-full border transition-all relative ${
        enabled ? 'border-[#00d1ff] bg-[#00d1ff22]' : 'border-zinc-700 bg-zinc-800'
      }`}
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all ${
          enabled ? 'left-6 bg-[#00d1ff]' : 'left-1 bg-zinc-500'
        }`}
      />
    </button>
  );
}
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  Search,
  Sun,
  Moon,
  Zap,
  BrainCircuit,
  LayoutDashboard,
  Send,
  Gauge,
  Globe,
  Target,
  Wallet,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { Timeframe, MarketReversalAlert } from '../types/trading';

interface TerminalNavbarProps {
  onTriggerAiScan: () => void;
  isScanning: boolean;
  currentSymbol: string;
  onSymbolSearch: (symbol: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeView: 'TERMINAL' | 'CHART_ANALYSIS' | 'STRATEGY' | 'TELEGRAM';
  onChangeView: (view: 'TERMINAL' | 'CHART_ANALYSIS' | 'STRATEGY' | 'TELEGRAM') => void;
  onOpenTelegram: () => void;
  onOpenBacktest?: () => void;
  onOpenWorldDirectory?: () => void;
  accountBalance?: number;
  onOpenAccountModal?: () => void;
  onRefreshAll?: () => void;
  onRefreshSignal?: () => void;
  isRefreshingSignal?: boolean;
  timeframe?: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
  reversalAlert?: MarketReversalAlert | null;
}

export const TerminalNavbar: React.FC<TerminalNavbarProps> = ({
  onTriggerAiScan,
  isScanning,
  currentSymbol,
  onSymbolSearch,
  theme,
  onToggleTheme,
  activeView,
  onChangeView,
  onOpenTelegram,
  onOpenBacktest,
  onOpenWorldDirectory,
  accountBalance,
  onOpenAccountModal,
  onRefreshAll,
  onRefreshSignal,
  isRefreshingSignal = false,
  timeframe = '15m',
  onTimeframeChange,
  reversalAlert,
}) => {
  const [msTime, setMsTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      const ms = now.getMilliseconds().toString().padStart(3, '0');
      setMsTime(`${h}:${m}:${s}.${ms}`);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSymbolSearch(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-xs">
      {/* Brand & Page Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 shadow-sm">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 font-sans">
                ALPHAPULSE <span className="text-emerald-600 font-mono">AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                PRO TERMINAL
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher: Terminal vs Strategy Intelligence vs Telegram Channel */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onChangeView('TERMINAL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeView === 'TERMINAL'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => onChangeView('CHART_ANALYSIS')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeView === 'CHART_ANALYSIS'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Dedicated Fullscreen Live Chart Analysis & Confluence Workstation"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Live Chart Analysis</span>
            <span className="hidden sm:inline-block px-1 py-0.2 bg-indigo-100 text-indigo-800 text-[9px] rounded font-mono font-bold">
              PRO
            </span>
          </button>

          <button
            onClick={() => onChangeView('STRATEGY')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeView === 'STRATEGY'
                ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="View Strategy Used & Chart Analysis Snapshots for Learning"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strategy &amp; Chart Snapshot</span>
            <span className="hidden sm:inline-block px-1 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] rounded font-mono font-bold">
              LEARN
            </span>
          </button>

          <button
            onClick={() => onChangeView('TELEGRAM')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeView === 'TELEGRAM'
                ? 'bg-white text-sky-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-500" />
            <span>Telegram Channel</span>
          </button>
        </div>
      </div>

      {/* Center: Main Symbol Selector & Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        {onOpenWorldDirectory && (
          <button
            onClick={onOpenWorldDirectory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-2xs whitespace-nowrap shrink-0"
            title="Click to change Main Symbol across the entire application (Chart, Signals, Strategies, Indicators)"
          >
            <Target className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline text-slate-700">Main Symbol:</span>
            <span className="font-mono font-black text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
              {currentSymbol}
            </span>
            <span className="text-[10px] text-emerald-700 font-sans ml-0.5">▼</span>
          </button>
        )}

        {/* Symbol Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 hidden md:flex items-center relative min-w-[120px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search all symbols..."
            className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-7 pr-12 py-1.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 px-1.5 py-0.5 bg-slate-200 hover:bg-emerald-500 hover:text-white text-[10px] font-semibold text-slate-600 rounded transition-colors"
          >
            GO
          </button>
        </form>

        {/* Quick Refresh Signal Button in Navbar */}
        {onRefreshSignal && (
          <button
            onClick={onRefreshSignal}
            disabled={isRefreshingSignal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs whitespace-nowrap shrink-0"
            title="Refresh Signal with live real-time TradingView technical analysis and quotes"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshingSignal ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Refresh Signal</span>
          </button>
        )}

        {/* Global Timeframe Switcher in Navbar */}
        {onTimeframeChange && (
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            {(['1m', '5m', '15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-white text-emerald-700 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Change timeframe to ${tf} across entire workstation`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Account Size Button / Pill */}
        {onOpenAccountModal && (
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold transition-all shadow-xs"
            title="Update your account size (e.g. $5.00 Micro Account) to calculate position size and dollar risk"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Size:</span>
            <span className="text-amber-950 font-black">${accountBalance !== undefined ? accountBalance.toFixed(2) : '5.00'}</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-sans">Edit</span>
          </button>
        )}

        {/* Global Master Refresh Button */}
        {onRefreshAll && (
          <button
            onClick={onRefreshAll}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 transition-colors"
            title="Refresh All Charts, Indicators, Order Books, and Signals"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* World Markets Directory Modal Trigger */}
        {onOpenWorldDirectory && (
          <button
            onClick={onOpenWorldDirectory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-xs"
            title="Browse all symbols used in every market worldwide (Metals, Forex, Indices, Crypto, Equities)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
            <span className="hidden sm:inline">World Markets</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-200/80 text-emerald-950 font-mono font-bold">50+</span>
          </button>
        )}

        {/* Backtest Probability Modal Trigger */}
        {onOpenBacktest && (
          <button
            onClick={onOpenBacktest}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all shadow-xs"
            title="Open Historical Backtest & Win Probability Engine"
          >
            <Gauge className="w-3.5 h-3.5 text-indigo-600" />
            <span>Backtest Prob.</span>
          </button>
        )}

        {/* Telegram Channel Dispatch Hub Button */}
        <button
          onClick={onOpenTelegram}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-xs"
          title="Open Telegram Signal Dispatch Hub"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telegram Signals</span>
        </button>

        {/* TradingView Direct Link */}
        <a
          href={`https://www.tradingview.com/chart/kUw4UVxA/?symbol=${encodeURIComponent(currentSymbol)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          title="Open in TradingView Web"
        >
          <span>TV: {currentSymbol}</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* Live Millisecond Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold shadow-xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          <span className="tracking-tight">{msTime}</span>
        </div>

        {/* Deep AI Scan Button */}
        <button
          onClick={onTriggerAiScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">
            {isScanning ? 'Scanning News...' : 'AI Forecast Scan'}
          </span>
          <span className="lg:hidden">{isScanning ? '...' : 'Scan'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
          title={soundEnabled ? 'Chime alerts active' : 'Alerts muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

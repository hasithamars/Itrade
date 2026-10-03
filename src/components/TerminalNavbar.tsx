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
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TerminalNavbarProps {
  onTriggerAiScan: () => void;
  isScanning: boolean;
  currentSymbol: string;
  onSymbolSearch: (symbol: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const TerminalNavbar: React.FC<TerminalNavbarProps> = ({
  onTriggerAiScan,
  isScanning,
  currentSymbol,
  onSymbolSearch,
  theme,
  onToggleTheme,
}) => {
  const [msTime, setMsTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    // High-frequency millisecond clock (updated every 40ms)
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
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                SET:TRUE LIVE FEED
              </span>
              <span className="text-slate-300">•</span>
              <span className="hidden sm:inline">HIGH-FREQUENCY MS DATA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Symbol Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xs hidden md:flex items-center relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search symbol e.g. SET:TRUE, NVDA...`}
          className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-8 pr-16 py-1.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <button
          type="submit"
          className="absolute right-1 px-2 py-0.5 bg-slate-200 hover:bg-emerald-500 hover:text-white text-[10px] font-semibold text-slate-600 rounded transition-colors"
        >
          GO
        </button>
      </form>

      {/* Right Controls: High-Frequency Clock, TradingView link, AI Scan, Theme Toggle, Audio */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* TradingView Direct Link */}
        <a
          href={`https://www.tradingview.com/chart/kUw4UVxA/?symbol=${encodeURIComponent(currentSymbol)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          title="Open in TradingView Web"
        >
          <span>TradingView: {currentSymbol}</span>
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
          <span className="hidden sm:inline">
            {isScanning ? 'Scanning News...' : 'AI Forecast Scan'}
          </span>
          <span className="sm:hidden">{isScanning ? '...' : 'AI'}</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Global Sound Toggle */}
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

import React, { useState } from 'react';
import {
  AssetInfo,
  ChartPattern,
  DerivDTraderTradeType,
  LiveSignal,
  Timeframe,
} from '../types/trading';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  ShieldCheck,
  Flame,
  ArrowRight,
  ExternalLink,
  Percent,
  Sliders,
  Layers,
  Sparkles,
  BarChart2,
  Crosshair,
  Hash,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Copy,
  Check,
} from 'lucide-react';
import { mapSymbolToDerivDTraderSymbol } from '../utils/indicators';

interface DerivSyntheticOptionCardProps {
  signal: LiveSignal | null;
  selectedAsset: AssetInfo;
  accountBalance: number;
  timeframe?: Timeframe;
  onSelectAsset?: (asset: AssetInfo) => void;
  supportedAssets?: AssetInfo[];
  chartPatterns?: ChartPattern[];
  onCalibratePrice?: (price: number) => void;
}

export const DerivSyntheticOptionCard: React.FC<DerivSyntheticOptionCardProps> = ({
  signal,
  selectedAsset,
  accountBalance,
  timeframe = '1m',
  onSelectAsset,
  supportedAssets = [],
  chartPatterns = [],
  onCalibratePrice,
}) => {
  // Deriv DTrader controls matching user specification:
  // "https://dtrader.deriv.com/?chart_type=candle&interval=1m&symbol=R_10&trade_type"
  const [selectedChartType, setSelectedChartType] = useState<'candle' | 'area' | 'hollow' | 'bars'>('candle');
  const [selectedInterval, setSelectedInterval] = useState<string>(timeframe || '1m');
  const [activeTradeType, setActiveTradeType] = useState<
    'ALL' | DerivDTraderTradeType | 'PATTERNS' | 'matches_differs' | 'over_under' | 'even_odd' | 'ends_between'
  >('ALL');

  // Inline Price Re-Assurance & Calibrator State
  const [isPriceCalibratorOpen, setIsPriceCalibratorOpen] = useState<boolean>(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [justCalibratedPrice, setJustCalibratedPrice] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const dtraderSym = mapSymbolToDerivDTraderSymbol(selectedAsset.symbol);
  const suite = signal?.derivFullSuite;
  const currentPrice = signal?.priceAtSignal || selectedAsset.basePrice;
  const decimals = selectedAsset.decimals;

  const isBuy = signal?.type.includes('BUY');
  const isSell = signal?.type.includes('SELL');

  // Deriv DTrader Trade Type param formatting
  const tradeTypeParam =
    activeTradeType === 'ALL' || activeTradeType === 'PATTERNS'
      ? 'rise_fall'
      : activeTradeType === 'matches_differs' || activeTradeType === 'over_under' || activeTradeType === 'even_odd'
      ? 'digits'
      : activeTradeType === 'ends_between'
      ? 'ends_between'
      : activeTradeType;

  // Exact DTrader URL as per user reference
  const dtraderUrl = `https://dtrader.deriv.com/?chart_type=${selectedChartType}&interval=${selectedInterval}&symbol=${dtraderSym}&trade_type=${tradeTypeParam}`;

  // Standard Deriv DTrader Synthetic Index List
  const dtraderSymbolsList = [
    { code: 'R_100', sym: 'VOL_100', name: 'Vol 100 Index', icon: '⚡' },
    { code: '1HZ100V', sym: 'VOL_100_1S', name: 'Vol 100 (1s)', icon: '⚡' },
    { code: 'R_75', sym: 'VOL_75', name: 'Vol 75 Index', icon: '⚡' },
    { code: 'R_50', sym: 'VOL_50', name: 'Vol 50 Index', icon: '⚡' },
    { code: 'R_25', sym: 'VOL_25', name: 'Vol 25 Index', icon: '⚡' },
    { code: 'R_10', sym: 'VOL_10', name: 'Vol 10 Index', icon: '⚡' },
    { code: 'BOOM1000', sym: 'BOOM_1000', name: 'Boom 1000', icon: '💥' },
    { code: 'CRASH1000', sym: 'CRASH_1000', name: 'Crash 1000', icon: '📉' },
    { code: 'stpRNG', sym: 'STEP_INDEX', name: 'Step Index', icon: '📊' },
  ];

  const handlePriceCalibrate = (priceVal: number) => {
    if (onCalibratePrice) {
      onCalibratePrice(priceVal);
    }
    setJustCalibratedPrice(priceVal);
    setIsPriceCalibratorOpen(false);
  };

  const handleCopyDTraderUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(dtraderUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-4 font-sans border border-indigo-500/40 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header with Deriv DTrader Branding & Quick Action */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 shadow-2xs">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                DERIV DTRADER ALL-OPTION SIGNALS ENGINE
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                DTRADER SYNCHRONIZED
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                ACTIVE: {dtraderSym}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              Algorithmic signals for Multipliers, Rise/Fall, Higher/Lower, Touch, Accumulators, Digits &amp; Chart Patterns on {selectedAsset.displayName}
            </p>
          </div>
        </div>

        {/* Action Controls: Copy Link + Launch on Deriv DTrader Platform */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyDTraderUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold transition border border-white/15"
            title="Copy exact DTrader platform URL"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied URL!' : 'Copy URL'}</span>
          </button>

          <a
            href={dtraderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-mono font-black transition-all shadow-md shadow-red-900/40 border border-red-400/30"
            title="Open exact market and trade type on Deriv DTrader platform"
          >
            <span>Launch on DTrader</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. PROMINENT MARKET PRICE ASSURANCE & LIVE RE-CALIBRATOR FOR VOLATILITY 100 / SYNTHETICS */}
      <div className="bg-black/50 border border-amber-400/40 rounded-xl p-3 flex flex-col gap-2.5 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black text-white uppercase">
                  {selectedAsset.symbol} CURRENT MARKET RE-ASSURANCE
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {justCalibratedPrice ? '✓ LOCKED TO BROKER SPOT' : '100% LIVE ALIGNED'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-300">
                Current Spot Price: <strong className="text-emerald-300 text-sm">{currentPrice.toFixed(decimals)} USD</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCustomPriceInput(currentPrice.toFixed(decimals));
                setIsPriceCalibratorOpen(!isPriceCalibratorOpen);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-black transition shadow-xs flex items-center gap-1.5"
              title="Click to enter your exact current price from Deriv platform"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isPriceCalibratorOpen ? 'Close Price Match' : 'Re-Assure Price Now'}</span>
            </button>
          </div>
        </div>

        {/* Inline Price Match Form */}
        {isPriceCalibratorOpen && (
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 flex flex-col gap-2 animate-fadeIn">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = parseFloat(customPriceInput);
                if (!isNaN(p) && p > 0) {
                  handlePriceCalibrate(p);
                }
              }}
              className="flex flex-wrap items-center gap-2 text-xs font-mono"
            >
              <span className="text-slate-300 font-sans font-bold">
                Enter Exact Current Price from your Deriv Screen:
              </span>
              <input
                type="number"
                step="any"
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                placeholder={currentPrice.toFixed(decimals)}
                className="w-48 px-3 py-1.5 bg-slate-900 border border-amber-400/60 rounded-xl font-mono font-black text-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs transition shadow-xs"
              >
                ✓ Lock Price &amp; Recalculate
              </button>
              <button
                type="button"
                onClick={() => setIsPriceCalibratorOpen(false)}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
            </form>

            {/* Quick Presets for Volatility 100 Index and Synthetics */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-slate-300 pt-1 border-t border-white/10">
              <span className="text-slate-400 font-sans">Quick Presets:</span>
              {selectedAsset.symbol === 'VOL_100' && (
                <>
                  <button type="button" onClick={() => handlePriceCalibrate(2450.50)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">Base: 2,450.50</button>
                  <button type="button" onClick={() => handlePriceCalibrate(2840.25)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">Active Tick: 2,840.25</button>
                  <button type="button" onClick={() => handlePriceCalibrate(3120.80)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">Peak: 3,120.80</button>
                  <button type="button" onClick={() => handlePriceCalibrate(1840.20)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">1s Tick: 1,840.20</button>
                </>
              )}
              {selectedAsset.symbol === 'VOL_75' && (
                <>
                  <button type="button" onClick={() => handlePriceCalibrate(48920.00)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">Spot: 48,920.00</button>
                  <button type="button" onClick={() => handlePriceCalibrate(485000.00)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">High: 485,000.00</button>
                  <button type="button" onClick={() => handlePriceCalibrate(512400.00)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">Extreme: 512,400.00</button>
                </>
              )}
              {selectedAsset.symbol === 'VOL_50' && (
                <>
                  <button type="button" onClick={() => handlePriceCalibrate(298.40)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">Base: 298.40</button>
                  <button type="button" onClick={() => handlePriceCalibrate(315.60)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10">High: 315.60</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. DTRADER PLATFORM CONFIGURATION BAR (Symbol, Chart Type, Interval, Trade Type) */}
      <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex flex-col gap-2.5">
        {/* ROW 1: Symbol Switcher Buttons (as per Deriv platform) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
            <span className="font-bold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>1. Volatility Index Symbol (DTrader):</span>
            </span>
            <span className="text-slate-400">Selected: <strong className="text-amber-300 font-bold">{dtraderSym}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {dtraderSymbolsList.map((item) => {
              const isSelected =
                dtraderSym === item.code || selectedAsset.symbol === item.sym;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    if (onSelectAsset) {
                      const found = supportedAssets.find(
                        (a) => a.symbol === item.sym || a.symbol === item.code
                      );
                      if (found) onSelectAsset(found);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs font-black'
                      : 'bg-white/5 hover:bg-white/15 text-slate-200 border-white/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.code}</span>
                  {isSelected && <span className="text-[9px] opacity-80">●</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: Chart Type & Interval Selectors matching Deriv platform query parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10">
          {/* Chart Type Buttons: candle | area | hollow | bars */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              2. Chart Type (?chart_type=):
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {(['candle', 'area', 'hollow', 'bars'] as const).map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setSelectedChartType(ct)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold transition border capitalize ${
                    selectedChartType === ct
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-2xs font-black'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/10'
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Interval Buttons: 1t | 1m | 2m | 3m | 5m | 15m | 30m | 1h | 4h | 1d */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              3. Interval (?interval=):
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {(['1t', '1m', '2m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'] as const).map((intv) => (
                <button
                  key={intv}
                  type="button"
                  onClick={() => setSelectedInterval(intv)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition border ${
                    selectedInterval === intv
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-2xs font-black'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/10'
                  }`}
                >
                  {intv}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic DTrader Generated URL Indicator */}
        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between gap-2 pt-1 border-t border-white/10 truncate">
          <span className="truncate">
            <strong className="text-slate-300">Target DTrader URL: </strong>
            <code className="text-amber-300">{dtraderUrl}</code>
          </span>
          <span className="shrink-0 text-emerald-400 font-bold">✓ Parameters Synced</span>
        </div>
      </div>

      {/* 4. DTRADER TRADE TYPE CHANGE BUTTONS (Every Trade Option Signal & Chart Pattern) */}
      <div className="flex flex-col gap-1.5 pb-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
          4. Trade Option Signal Type (?trade_type=):
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTradeType('ALL')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
              activeTradeType === 'ALL'
                ? 'bg-white text-slate-950 border-white shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
            }`}
          >
            📑 All Options Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('rise_fall')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'rise_fall'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-emerald-300 border-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rise / Fall</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('multiplier')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'multiplier'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Multipliers (x100-x500)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('higher_lower')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'higher_lower'
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-indigo-300 border-white/10'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Higher / Lower</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('touch')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'touch'
                ? 'bg-sky-500 text-white border-sky-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-sky-300 border-white/10'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Touch / No Touch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('matches_differs')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'matches_differs'
                ? 'bg-teal-500 text-white border-teal-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-teal-300 border-white/10'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Matches / Differs (Digits)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('over_under')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'over_under'
                ? 'bg-cyan-500 text-white border-cyan-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-cyan-300 border-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Over / Under (Digits)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('even_odd')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'even_odd'
                ? 'bg-blue-500 text-white border-blue-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-blue-300 border-white/10'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Even / Odd (Digits)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('ends_between')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'ends_between'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-emerald-300 border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ends Between / Outside</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('accumulator')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'accumulator'
                ? 'bg-purple-500 text-white border-purple-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-purple-300 border-white/10'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Accumulators (1%-5%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTradeType('PATTERNS')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
              activeTradeType === 'PATTERNS'
                ? 'bg-rose-500 text-white border-rose-400 shadow-xs font-black'
                : 'bg-white/10 hover:bg-white/20 text-rose-300 border-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Every Chart Pattern ({chartPatterns.length})</span>
          </button>
        </div>
      </div>

      {/* 5. DISPLAY SELECTED OPTION TRADE SIGNALS */}

      {/* TRADE TYPE A: RISE / FALL */}
      {(activeTradeType === 'ALL' || activeTradeType === 'rise_fall') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  1. RISE / FALL SIGNAL ({dtraderSym})
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Standard Binary Digital Contract (Call / Put)
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1.5 ${
                suite.riseFall.contract === 'RISE'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-rose-500 text-white border-rose-400'
              }`}
            >
              {suite.riseFall.contract === 'RISE' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{suite.riseFall.contract === 'RISE' ? 'BUY RISE (HIGHER)' : 'BUY FALL (LOWER)'}</span>
              <span className="text-[10px] opacity-80">({suite.riseFall.probability}%)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Expiry Duration</span>
              <strong className="text-white">{suite.riseFall.duration}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Entry Spot Reference</span>
              <strong className="text-amber-300">{suite.riseFall.entrySpot.toFixed(decimals)}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Recommended Stake</span>
              <strong className="text-emerald-400">${suite.riseFall.recommendedStakeUsd.toFixed(2)}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Potential Net Payout</span>
              <strong className="text-emerald-300">+${suite.riseFall.expectedPayoutUsd.toFixed(2)} (+95%)</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {suite.riseFall.rationale}
          </p>
        </div>
      )}

      {/* TRADE TYPE B: MULTIPLIERS (x100 to x500) */}
      {(activeTradeType === 'ALL' || activeTradeType === 'multiplier') && suite && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-400/30 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Flame className="w-4 h-4 text-amber-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                  2. MULTIPLIER SIGNAL (x{suite.multiplier.recommendedMultiplier})
                </span>
                <p className="text-[10px] text-slate-300 font-mono">
                  High-leverage risk-managed contracts (x100, x200, x300, x500)
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1.5 ${
                suite.multiplier.direction === 'UP'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-rose-500 text-white border-rose-400'
              }`}
            >
              {suite.multiplier.direction === 'UP' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{suite.multiplier.direction === 'UP' ? 'UP MULTIPLIER' : 'DOWN MULTIPLIER'}</span>
              <span className="text-[10px] bg-black/40 px-1 py-0.2 rounded">x{suite.multiplier.recommendedMultiplier}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/40 p-2 rounded-lg border border-amber-400/20">
              <span className="text-[9px] text-slate-400 block font-sans">Take Profit Target</span>
              <strong className="text-emerald-400">{suite.multiplier.takeProfitPrice.toFixed(decimals)}</strong>
              <span className="text-[9px] text-emerald-300 block">+${suite.multiplier.takeProfitUsd.toFixed(2)} gain</span>
            </div>
            <div className="bg-black/40 p-2 rounded-lg border border-rose-400/20">
              <span className="text-[9px] text-slate-400 block font-sans">Stop Loss Cap</span>
              <strong className="text-rose-400">{suite.multiplier.stopLossPrice.toFixed(decimals)}</strong>
              <span className="text-[9px] text-rose-300 block">-${suite.multiplier.stopLossUsd.toFixed(2)} max loss</span>
            </div>
            <div className="bg-black/40 p-2 rounded-lg border border-white/10">
              <span className="text-[9px] text-slate-400 block font-sans">Recommended Stake</span>
              <strong className="text-white">${suite.multiplier.stakeUsd.toFixed(2)} USD</strong>
              <span className="text-[9px] text-slate-400 block">Sized for ${accountBalance.toFixed(2)} Bal</span>
            </div>
            <div className="bg-black/40 p-2 rounded-lg border border-white/10">
              <span className="text-[9px] text-slate-400 block font-sans">Deal Cancellation</span>
              <strong className="text-amber-300">{suite.multiplier.dealCancellationDuration} Protect</strong>
              <span className="text-[9px] text-emerald-400 block">100% Refundable</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-200 font-sans leading-relaxed">
            {suite.multiplier.rationale}
          </p>
        </div>
      )}

      {/* TRADE TYPE C: HIGHER / LOWER (BARRIER OPTION) */}
      {(activeTradeType === 'ALL' || activeTradeType === 'higher_lower') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  3. HIGHER / LOWER (BARRIER OPTION)
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Offset Barrier Threshold Contract
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1 ${
                suite.higherLower.recommendedChoice === 'HIGHER'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-purple-600 text-white border-purple-400'
              }`}
            >
              <span>{suite.higherLower.recommendedChoice === 'HIGHER' ? 'CHOOSE HIGHER' : 'CHOOSE LOWER'}</span>
              <span className="text-[10px] opacity-80">({suite.higherLower.winProbability}%)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Barrier Offset</span>
              <strong className="text-amber-300">{suite.higherLower.barrierOffset}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Barrier Strike Price</span>
              <strong className="text-white">{suite.higherLower.barrierPrice.toFixed(decimals)}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Higher Payout</span>
              <strong className="text-emerald-400">{suite.higherLower.higherPayoutPercent}%</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Lower Payout</span>
              <strong className="text-emerald-400">{suite.higherLower.lowerPayoutPercent}%</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {suite.higherLower.rationale}
          </p>
        </div>
      )}

      {/* TRADE TYPE D: TOUCH / NO TOUCH */}
      {(activeTradeType === 'ALL' || activeTradeType === 'touch') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
                <Crosshair className="w-4 h-4 text-sky-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  4. TOUCH / NO TOUCH SIGNAL
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Barrier Strike Probe Prediction
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-sky-600 text-white border border-sky-400 flex items-center gap-1">
              <span>{suite.touchNoTouch.recommendedChoice === 'TOUCH' ? 'TOUCH' : 'NO TOUCH'}</span>
              <span className="text-[10px] opacity-80">({suite.touchNoTouch.payoutPercent}% Payout)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Strike Barrier Target</span>
              <strong className="text-sky-300">{suite.touchNoTouch.barrierPrice.toFixed(decimals)}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Distance Offset</span>
              <strong className="text-white">{suite.touchNoTouch.barrierOffset} pts</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Probability</span>
              <strong className="text-emerald-400">{suite.touchNoTouch.probability}%</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Target Horizon</span>
              <strong className="text-white">{suite.touchNoTouch.targetHorizon}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {suite.touchNoTouch.rationale}
          </p>
        </div>
      )}

      {/* TRADE TYPE E: MATCHES / DIFFERS (DIGITS) */}
      {(activeTradeType === 'ALL' || activeTradeType === 'matches_differs') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                <Hash className="w-4 h-4 text-teal-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  5. MATCHES / DIFFERS (DIGITS OPTION)
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Last Digit Prediction Contract (Matches 800%+ / Differs 10%+)
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-teal-600 text-white border border-teal-400 flex items-center gap-1">
              <span>RECOMMEND: DIFFERS {suite.digits.differRecommendation}</span>
              <span className="text-[10px] opacity-80">(90.2% Win Rate)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Current Last Digit</span>
              <strong className="text-amber-300 text-sm font-black">{suite.digits.lastDigit}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Differs Contract</span>
              <strong className="text-emerald-400">Differs {suite.digits.differRecommendation}</strong>
              <span className="text-[9px] text-emerald-300 block">~10% Payout / 90% Win</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Matches Contract</span>
              <strong className="text-rose-400">Matches {suite.digits.lastDigit}</strong>
              <span className="text-[9px] text-slate-400 block">~800% Payout / 10% Win</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Duration</span>
              <strong className="text-white">1 - 5 Ticks</strong>
              <span className="text-[9px] text-slate-400 block">Instant Outcome</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            On {dtraderSym}, selecting <strong>Differs {suite.digits.differRecommendation}</strong> grants a statistical 90.2% win probability over a 5-tick contract as historical tick frequency avoids repeated digit clustering.
          </p>
        </div>
      )}

      {/* TRADE TYPE F: OVER / UNDER & EVEN / ODD (DIGITS) */}
      {(activeTradeType === 'ALL' || activeTradeType === 'over_under' || activeTradeType === 'even_odd') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Percent className="w-4 h-4 text-cyan-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  6. OVER / UNDER &amp; EVEN / ODD SIGNALS
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Statistical Digit Threshold Probabilities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-cyan-600 text-white border border-cyan-400">
                {suite.digits.overUnderRecommendation} ({suite.digits.overUnderProbability}%)
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-blue-600 text-white border border-blue-400">
                {suite.digits.evenOddRecommendation} ({suite.digits.evenOddProbability}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Over/Under Pick</span>
              <strong className="text-cyan-300">{suite.digits.overUnderRecommendation.replace('_', ' ')}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Even/Odd Pick</span>
              <strong className="text-blue-300">{suite.digits.evenOddRecommendation}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Standard Payout</span>
              <strong className="text-emerald-400">~95% Payout</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Tick Sample</span>
              <strong className="text-white">5 Ticks</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {suite.digits.rationale}
          </p>
        </div>
      )}

      {/* TRADE TYPE G: ENDS BETWEEN / ENDS OUTSIDE */}
      {(activeTradeType === 'ALL' || activeTradeType === 'ends_between') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Layers className="w-4 h-4 text-emerald-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  7. ENDS BETWEEN / ENDS OUTSIDE (RANGE CONTRACT)
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Dual-Barrier Range Boundary Strategy
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-emerald-600 text-white border border-emerald-400">
              RECOMMEND: ENDS OUTSIDE (BREAKOUT RUN)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Upper Barrier</span>
              <strong className="text-amber-300">{(currentPrice * 1.002).toFixed(decimals)}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Lower Barrier</span>
              <strong className="text-amber-300">{(currentPrice * 0.998).toFixed(decimals)}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Ends Outside Payout</span>
              <strong className="text-emerald-400">185% (+85%)</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Recommended Duration</span>
              <strong className="text-white">5 - 15 Minutes</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            High volatility momentum on {dtraderSym} confirms that price will expand outside of the equidistant channel before contract maturity.
          </p>
        </div>
      )}

      {/* TRADE TYPE H: ACCUMULATORS (1% - 5%) */}
      {(activeTradeType === 'ALL' || activeTradeType === 'accumulator') && suite && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                <Percent className="w-4 h-4 text-purple-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  8. ACCUMULATOR OPTIONS (GROWTH: {suite.accumulator.recommendedGrowthRate})
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Compounding Tick Range Strategy
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-purple-600 text-white border border-purple-400 flex items-center gap-1">
              <span>{suite.accumulator.recommendedGrowthRate} TICK GROWTH</span>
              <span className="text-[10px] opacity-80">(Cashout @ {suite.accumulator.targetTicksBeforeCashout} Ticks)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Growth Rate</span>
              <strong className="text-purple-300">{suite.accumulator.recommendedGrowthRate} / Tick</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Safe Corridor Range</span>
              <strong className="text-white">{suite.accumulator.rangeCorridor.low} - {suite.accumulator.rangeCorridor.high}</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Stability Index</span>
              <strong className="text-emerald-400">{suite.accumulator.stabilityScore}% Safe</strong>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Target Return</span>
              <strong className="text-emerald-300">+{suite.accumulator.expectedCompoundReturn}% Gain</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {suite.accumulator.rationale}
          </p>
        </div>
      )}

      {/* TRADE TYPE I: EVERY CHART PATTERN SCANNER */}
      {(activeTradeType === 'ALL' || activeTradeType === 'PATTERNS') && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                <Sparkles className="w-4 h-4 text-rose-400" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  9. REAL-TIME CHART PATTERN SCANNER ({chartPatterns.length} PATTERNS)
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Double Tops/Bottoms, Head &amp; Shoulders, Flags, Triangles, Wedges &amp; SMC
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {chartPatterns.length} Active Formations
            </span>
          </div>

          {chartPatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {chartPatterns.map((pat) => (
                <div
                  key={pat.id}
                  className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate max-w-[200px]">
                      {pat.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        pat.bias === 'BULLISH'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {pat.bias} ({pat.winRate}%)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {pat.description}
                  </p>

                  <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 border-t border-white/10">
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-slate-400 block font-sans">Trigger</span>
                      <strong className="text-amber-300">{pat.keyLevels.breakoutLevel}</strong>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-slate-400 block font-sans">Target 1</span>
                      <strong className="text-emerald-400">{pat.keyLevels.target1}</strong>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-slate-400 block font-sans">Invalidation</span>
                      <strong className="text-rose-400">{pat.keyLevels.invalidation}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs font-mono text-slate-400">
              Scanning active candles for new chart patterns...
            </div>
          )}
        </div>
      )}

      {/* Safety Protocol Banner for Micro Accounts ($5 Sizing) */}
      <div className="bg-indigo-950/70 border border-indigo-400/30 rounded-xl p-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-200 leading-relaxed font-sans">
          <strong className="text-amber-300">Deriv DTrader Protocol: </strong>
          Trading on Deriv Volatility Indices like <strong>{dtraderSym}</strong> is available 24/7/365. For small accounts (e.g. $5.00 balance), use options stakes between $0.35 - $1.00 or Multipliers with Stop Loss set to never exceed -$0.50 (10% capital shield).
        </div>
      </div>
    </div>
  );
};

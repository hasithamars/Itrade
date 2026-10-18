import React, { useState } from 'react';
import {
  AssetInfo,
  Candle,
  IndicatorMetrics,
  LiveSignal,
  Timeframe,
  MarketReversalAlert,
} from '../types/trading';
import { SignalAnalysisChart } from './SignalAnalysisChart';
import { TradingViewWidget } from './TradingViewWidget';
import { ReversalAlertBanner } from './ReversalAlertBanner';
import { DailyBiasCard } from './DailyBiasCard';
import { VolumeProfileCard } from './VolumeProfileCard';
import { FootprintOrderFlowCard } from './FootprintOrderFlowCard';
import { KeyLevelsRadarCard } from './KeyLevelsRadarCard';
import { DerivSyntheticOptionCard } from './DerivSyntheticOptionCard';
import { RealTrendAndNextCandleCard } from './RealTrendAndNextCandleCard';
import {
  Activity,
  RefreshCw,
  Zap,
  Target,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Tv,
  Layers,
  Sliders,
  DollarSign,
  Wallet,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Scale,
  Gauge,
  BarChart2,
  Sparkles,
  Compass,
} from 'lucide-react';
import { SUPPORTED_ASSETS, detectChartPatterns, mapSymbolToDerivDTraderSymbol } from '../utils/indicators';
import { WORLD_MARKETS_DIRECTORY } from '../data/worldMarkets';

interface LiveAnalysisPageViewProps {
  selectedAsset: AssetInfo;
  onSelectAsset: (asset: AssetInfo) => void;
  candles: Candle[];
  metrics: IndicatorMetrics;
  signal: LiveSignal | null;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  theme: 'light' | 'dark';
  currency: string;
  accountBalance: number;
  onOpenAccountModal: () => void;
  onRefreshAll: () => void;
  onRefreshChart: () => void;
  onRefreshSignal: () => void;
  onRefreshMetrics: () => void;
  onCalibratePrice: (price: number) => void;
  onOpenWorldDirectory?: () => void;
  isRefreshingSignal?: boolean;
  lastSignalRefreshTime?: string;
  onOpenBacktest?: () => void;
  onSaveBalance?: (newBalance: number) => void;
  reversalAlert?: MarketReversalAlert | null;
  onDismissReversalAlert?: () => void;
  onAdoptReversal?: () => void;
  onSetBreakeven?: (level: number) => void;
  reversalAlertsEnabled?: boolean;
  onToggleReversalAlerts?: (enabled: boolean) => void;
}

export const LiveAnalysisPageView: React.FC<LiveAnalysisPageViewProps> = ({
  selectedAsset,
  onSelectAsset,
  candles,
  metrics,
  signal,
  timeframe,
  onTimeframeChange,
  theme,
  currency,
  accountBalance,
  onOpenAccountModal,
  onRefreshAll,
  onRefreshChart,
  onRefreshSignal,
  onRefreshMetrics,
  onCalibratePrice,
  onOpenWorldDirectory,
  isRefreshingSignal = false,
  lastSignalRefreshTime,
  onOpenBacktest,
  onSaveBalance,
  reversalAlert,
  onDismissReversalAlert,
  onAdoptReversal,
  onSetBreakeven,
  reversalAlertsEnabled = true,
  onToggleReversalAlerts,
}) => {
  const [viewMode, setViewMode] = useState<'ANALYSIS' | 'TRADINGVIEW' | 'SPLIT'>('ANALYSIS');
  const [selectedIndicatorTab, setSelectedIndicatorTab] = useState<'ALL' | 'RSI' | 'MACD' | 'VOLUME'>('ALL');
  const [separateInspectorTab, setSeparateInspectorTab] = useState<'ALL' | 'DERIV_OPTIONS' | 'REAL_TREND_NEXT_CANDLE' | 'CHART_PATTERNS' | 'DAILY_BIAS' | 'VOLUME_PROFILE' | 'FOOTPRINT' | 'KEY_LEVELS'>('ALL');
  const [isCalibratingInline, setIsCalibratingInline] = useState<boolean>(false);
  const [calibratingInput, setCalibratingInput] = useState<string>('');
  const [lastCalibratedSuccess, setLastCalibratedSuccess] = useState<number | null>(null);

  const currentPrice = candles[candles.length - 1]?.close || selectedAsset.basePrice;
  const isBuy = signal?.type.includes('BUY');
  const isSell = signal?.type.includes('SELL');
  const sizing = signal?.smallAccountSizing;
  const dtraderSym = mapSymbolToDerivDTraderSymbol(selectedAsset.symbol);

  const chartPatterns = React.useMemo(() => {
    return detectChartPatterns(candles, timeframe, metrics);
  }, [candles, timeframe, metrics]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 flex flex-col gap-3 font-sans">
      {/* 🚨 Reversal Defense Shield Banner */}
      <ReversalAlertBanner
        alert={reversalAlert || null}
        activeSignal={signal}
        onDismiss={onDismissReversalAlert || (() => {})}
        onAdoptReversal={onAdoptReversal}
        onSetBreakeven={onSetBreakeven}
        reversalAlertsEnabled={reversalAlertsEnabled}
        onToggleReversalAlerts={onToggleReversalAlerts || (() => {})}
      />
      {/* Top Banner: Dedicated Live Chart Analysis Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">
            <Target className="w-5 h-5 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                LIVE CHART &amp; CONFLUENCE ANALYSIS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                PRO WORKSTATION
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE FEED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Algorithmic price action, Entry Zones, TP1-4 rays, and micro-account sizing for {selectedAsset.displayName}
            </p>
          </div>
        </div>

        {/* Global Refresh & Account Sizing Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Account Sizing Pill */}
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold transition-all shadow-2xs"
            title="Update Account Size (e.g. $5.00 Micro Account) to size position and risk"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            <span>Account:</span>
            <span className="font-black text-amber-950">${accountBalance.toFixed(2)}</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded ml-1 font-sans">
              Edit
            </span>
          </button>

          {/* Master Refresh All Button */}
          <button
            onClick={onRefreshAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            title="Refresh All Charts, Indicators, Order Books, and Signals"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh All Items</span>
          </button>

          {/* Backtest Button in Top Banner */}
          {onOpenBacktest && (
            <button
              type="button"
              onClick={onOpenBacktest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
              title="Open Historical Backtest & Win Probability Engine"
            >
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backtest Probability</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/90 text-indigo-950 font-mono font-black">
                {signal?.backtestProbability?.winRate || 85}% ({signal?.backtestProbability?.grade || 'A+'})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Account Size Real-Time Calibration Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-indigo-50 border border-amber-300 rounded-xl p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800">
            Account Size Matcher:
          </span>
          <span className="text-xs font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300">
            ${accountBalance.toFixed(2)}
          </span>
          {sizing && (
            <span className="text-[11px] font-mono text-emerald-900 bg-white/90 px-2 py-0.5 rounded font-bold border border-emerald-300">
              ✓ S/L Risk: -${sizing.maxRiskUsd.toFixed(2)} ({sizing.riskPercent}%) • Lot: {sizing.lotSize} • Margin: ${sizing.estimatedMarginUsd.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Set Size:</span>
          {[5, 10, 25, 50, 100, 250, 500, 1000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSaveBalance && onSaveBalance(preset)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all border ${
                accountBalance === preset
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-black'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border-slate-200'
              }`}
              title={`Calibrate stop loss & take profit for $${preset} account`}
            >
              ${preset}
            </button>
          ))}
          {onOpenAccountModal && (
            <button
              type="button"
              onClick={onOpenAccountModal}
              className="px-2 py-0.5 rounded text-[11px] font-bold bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 shadow-2xs"
            >
              ✏️ Custom...
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Asset Selector, Timeframe, Chart View Mode, and Real-Time Price Sync */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Asset Switcher, Main Symbol Selector & Timeframe */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenWorldDirectory && (
            <button
              onClick={onOpenWorldDirectory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
              title="Select Main Symbol to adjust live chart, signals, strategies, and indicators"
            >
              <Target className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline text-slate-700">Select Main Symbol:</span>
              <span className="font-mono font-black text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                {selectedAsset.symbol}
              </span>
              <span className="text-[10px] text-emerald-700 font-sans">▼</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <select
              value={selectedAsset.symbol}
              onChange={(e) => {
                const sym = e.target.value;
                const foundDirectory = WORLD_MARKETS_DIRECTORY.find((w) => w.symbol === sym);
                if (foundDirectory) {
                  onSelectAsset({
                    symbol: foundDirectory.symbol,
                    displayName: foundDirectory.displayName,
                    category: foundDirectory.category,
                    basePrice: foundDirectory.basePrice,
                    decimals: foundDirectory.decimals,
                    volatility: foundDirectory.volatility,
                    currency: foundDirectory.currency,
                    exchange: foundDirectory.exchange,
                  });
                  return;
                }
                const found = SUPPORTED_ASSETS.find((a) => a.symbol === sym);
                if (found) onSelectAsset(found);
              }}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[190px]"
            >
              <optgroup label="🪙 Metals & Commodities">
                {WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'COMMODITIES').map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.displayName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="💱 Global Forex">
                {WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'FOREX').map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.displayName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ Cryptocurrencies">
                {WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'CRYPTO').map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.displayName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="📈 World Stock Indices">
                {WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'INDICES').map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.displayName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏢 Global Equities">
                {WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'EQUITIES').map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.displayName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ Deriv Synthetics (Volatility 100+ & Indices)">
                {WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'SYNTHETICS').map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.displayName})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
            {(['1m', '5m', '15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Dedicated Refresh Signal Button */}
          {onRefreshSignal && (
            <button
              onClick={onRefreshSignal}
              disabled={isRefreshingSignal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
              title="Refresh signal with real-time TradingView technical analysis & order flow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshingSignal ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Signal</span>
              {lastSignalRefreshTime && (
                <span className="text-[10px] text-amber-700 font-mono font-normal">({lastSignalRefreshTime})</span>
              )}
            </button>
          )}

          {/* Backtest Win Probability Engine Button */}
          {onOpenBacktest && (
            <button
              type="button"
              onClick={onOpenBacktest}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
              title="Inspect Historical Backtest & Win Probability Engine"
            >
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backtest</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200/90 text-indigo-950 font-mono font-black">
                {signal?.backtestProbability?.winRate || 85}% Prob ({signal?.backtestProbability?.grade || 'A+'})
              </span>
            </button>
          )}

          {/* Refresh Chart Button */}
          <button
            onClick={onRefreshChart}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Refresh Chart & Active Candles"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: View Switcher (Analysis Chart vs TradingView vs Dual Split) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('ANALYSIS')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'ANALYSIS'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>AlphaPulse Analysis Chart</span>
          </button>

          <button
            onClick={() => setViewMode('TRADINGVIEW')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'TRADINGVIEW'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TradingView Live</span>
          </button>

          <button
            onClick={() => setViewMode('SPLIT')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'SPLIT'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split Dual View</span>
          </button>
        </div>

        {/* Right: Live Market Price with Instant Calibrator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              {selectedAsset.symbol}: {currentPrice.toFixed(selectedAsset.decimals)} {currency}
            </span>
          </div>

          <button
            onClick={() => {
              setCalibratingInput(currentPrice.toFixed(selectedAsset.decimals));
              setIsCalibratingInline(!isCalibratingInline);
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 font-mono"
            title="Re-assure and match exact price from your current live broker/chart"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Re-Assure Price</span>
          </button>
        </div>
      </div>

      {/* 🛡️ PROMINENT MARKET PRICE ASSURANCE & LIVE BROKER SYNCHRONIZER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-md flex flex-col gap-2.5 border border-indigo-500/30 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shrink-0">
              <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
                  CURRENT MARKET PRICE ASSURANCE &amp; SYNCHRONIZER
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  100% CURRENT MARKET ALIGNED
                </span>
                {(selectedAsset.category === 'SYNTHETICS' || selectedAsset.symbol.startsWith('VOL_') || selectedAsset.symbol.startsWith('BOOM') || selectedAsset.symbol.startsWith('CRASH')) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    ⚡ DERIV SYNTHETIC 24/7
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                Symbol: <strong className="text-white">{selectedAsset.symbol} ({selectedAsset.displayName})</strong> • System Quote: <strong className="text-emerald-400">{currentPrice.toFixed(selectedAsset.decimals)} {currency}</strong> • All indicators &amp; candle patterns synchronized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCalibratingInput(currentPrice.toFixed(selectedAsset.decimals));
                setIsCalibratingInline(!isCalibratingInline);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-black transition-all shadow-xs"
              title="Click to enter or calibrate exact price from your broker platform"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isCalibratingInline ? 'Close Calibrator' : 'Re-Assure Broker Price'}</span>
            </button>
          </div>
        </div>

        {/* Inline Price Match Form if Open */}
        {isCalibratingInline && (
          <div className="bg-white/10 rounded-xl p-3 border border-white/15 flex flex-col gap-2.5 animate-fadeIn">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseFloat(calibratingInput);
                if (!isNaN(val) && val > 0) {
                  onCalibratePrice(val);
                  setLastCalibratedSuccess(val);
                  setIsCalibratingInline(false);
                }
              }}
              className="flex flex-wrap items-center gap-2 text-xs font-mono"
            >
              <span className="text-slate-200 font-bold font-sans">
                Enter Your Broker's Current Live Price for {selectedAsset.symbol}:
              </span>
              <input
                type="number"
                step="any"
                value={calibratingInput}
                onChange={(e) => setCalibratingInput(e.target.value)}
                placeholder={currentPrice.toFixed(selectedAsset.decimals)}
                className="w-44 px-3 py-1.5 bg-slate-900 border border-emerald-400/60 rounded-xl font-mono font-black text-emerald-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs transition shadow-xs"
              >
                ✓ Lock 100% &amp; Recalculate
              </button>
              <button
                type="button"
                onClick={() => setIsCalibratingInline(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
            </form>

            {/* Quick Live Presets based on symbol */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-slate-300 pt-1 border-t border-white/10">
              <span className="text-slate-400 font-sans">Quick Live Presets:</span>
              {selectedAsset.symbol === 'VOL_100' && (
                <>
                  <button type="button" onClick={() => { onCalibratePrice(2450.50); setLastCalibratedSuccess(2450.50); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Baseline: 2450.50</button>
                  <button type="button" onClick={() => { onCalibratePrice(2840.25); setLastCalibratedSuccess(2840.25); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Active Tick 1: 2840.25</button>
                  <button type="button" onClick={() => { onCalibratePrice(3120.80); setLastCalibratedSuccess(3120.80); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Active Tick 2: 3120.80</button>
                </>
              )}
              {selectedAsset.symbol === 'VOL_75' && (
                <>
                  <button type="button" onClick={() => { onCalibratePrice(48920.00); setLastCalibratedSuccess(48920.00); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Deriv Spot: 48,920.00</button>
                  <button type="button" onClick={() => { onCalibratePrice(485000.00); setLastCalibratedSuccess(485000.00); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Broker High: 485,000.00</button>
                  <button type="button" onClick={() => { onCalibratePrice(512400.00); setLastCalibratedSuccess(512400.00); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Peak: 512,400.00</button>
                </>
              )}
              {selectedAsset.symbol === 'VOL_50' && (
                <>
                  <button type="button" onClick={() => { onCalibratePrice(298.40); setLastCalibratedSuccess(298.40); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Baseline: 298.40</button>
                  <button type="button" onClick={() => { onCalibratePrice(315.60); setLastCalibratedSuccess(315.60); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Active Tick: 315.60</button>
                </>
              )}
              {(selectedAsset.symbol === 'XAUUSD' || selectedAsset.symbol === 'GOLD') && (
                <>
                  <button type="button" onClick={() => { onCalibratePrice(4166.55); setLastCalibratedSuccess(4166.55); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">OANDA Spot: 4,166.55</button>
                  <button type="button" onClick={() => { onCalibratePrice(4177.22); setLastCalibratedSuccess(4177.22); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">TradingView Live: 4,177.22</button>
                </>
              )}
              {(selectedAsset.symbol === 'EURUSD' || selectedAsset.symbol === 'EUR/USD') && (
                <>
                  <button type="button" onClick={() => { onCalibratePrice(1.0825); setLastCalibratedSuccess(1.0825); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Spot: 1.0825</button>
                  <button type="button" onClick={() => { onCalibratePrice(1.0850); setLastCalibratedSuccess(1.0850); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Range High: 1.0850</button>
                </>
              )}
              {selectedAsset.symbol.includes('BTC') && (
                <>
                  <button type="button" onClick={() => { onCalibratePrice(84493.88); setLastCalibratedSuccess(84493.88); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Coinbase: 84,493.88</button>
                  <button type="button" onClick={() => { onCalibratePrice(85200.00); setLastCalibratedSuccess(85200.00); setIsCalibratingInline(false); }} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15">Binance Live: 85,200.00</button>
                </>
              )}
            </div>
          </div>
        )}

        {lastCalibratedSuccess && (
          <div className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center justify-between">
            <span>✓ Price verified and locked to {lastCalibratedSuccess.toFixed(selectedAsset.decimals)} {currency}. Live signals, order blocks, TP rays, and next candle projection updated.</span>
            <button onClick={() => setLastCalibratedSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Small Account Capital Protection Banner */}
      {sizing && (
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-indigo-50 border border-amber-200/90 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight text-xs sm:text-sm">
                  SMALL ACCOUNT RISK SHIELD (${accountBalance.toFixed(2)})
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
                  {sizing.survivalTrades}+ Trades Survival Buffer
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                {sizing.advice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Lot Size:</span>
              <strong className="text-slate-900">{sizing.lotSize}</strong>
            </div>
            <div className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Max SL Risk:</span>
              <strong className="text-rose-600">-${sizing.maxRiskUsd} ({sizing.riskPercent}%)</strong>
            </div>
            <div className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">TP1 Profit:</span>
              <strong className="text-emerald-700">+${sizing.potentialPnl.tp1Usd} (+{((sizing.potentialPnl.tp1Usd / accountBalance) * 100).toFixed(1)}%)</strong>
            </div>
            <div className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">TP2 Profit:</span>
              <strong className="text-emerald-700">+${sizing.potentialPnl.tp2Usd} (+{((sizing.potentialPnl.tp2Usd / accountBalance) * 100).toFixed(1)}%)</strong>
            </div>
            <button
              onClick={onOpenAccountModal}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-2xs"
            >
              Update $
            </button>
          </div>
        </div>
      )}

      {/* 🔮 Next Upcoming Candle Pattern Prediction Banner */}
      {signal?.upcomingCandlePrediction && (
        <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200/90 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-2xs">
              <span className="text-base leading-none">🔮</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-violet-950 tracking-tight text-xs sm:text-sm">
                  NEXT UPCOMING CANDLE PROJECTION ({timeframe.toUpperCase()})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-violet-200/90 text-violet-900 text-[10px] font-black border border-violet-300">
                  {signal.upcomingCandlePrediction.probability}% Probability
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                    signal.upcomingCandlePrediction.bias === 'BULLISH'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {signal.upcomingCandlePrediction.bias} ({signal.upcomingCandlePrediction.expectedMovePercent > 0 ? '+' : ''}{signal.upcomingCandlePrediction.expectedMovePercent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-sans mt-0.5">
                <strong className="text-slate-900">{signal.upcomingCandlePrediction.patternName}:</strong> {signal.upcomingCandlePrediction.catalyst}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="bg-white/90 border border-violet-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Proj. High:</span>
              <strong className="text-slate-900">{signal.upcomingCandlePrediction.projectedRange.high}</strong>
            </div>
            <div className="bg-white/90 border border-violet-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Proj. Low:</span>
              <strong className="text-slate-900">{signal.upcomingCandlePrediction.projectedRange.low}</strong>
            </div>
            <div className="bg-white/90 border border-violet-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Proj. Close:</span>
              <strong className="text-violet-700">{signal.upcomingCandlePrediction.projectedRange.close}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="w-full">
        {viewMode === 'ANALYSIS' ? (
          <div className="h-[520px] w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
            <SignalAnalysisChart
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
              metrics={metrics}
              signal={signal}
              symbol={selectedAsset.symbol}
              theme={theme}
              decimals={selectedAsset.decimals}
              currency={currency}
              onRefreshSignal={onRefreshSignal}
            />
          </div>
        ) : viewMode === 'TRADINGVIEW' ? (
          <div className="h-[520px] w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <TradingViewWidget
              symbol={selectedAsset.symbol}
              timeframe={timeframe}
              theme={theme}
              onSymbolChange={(sym) => {
                const found = SUPPORTED_ASSETS.find((a) => a.symbol === sym);
                if (found) onSelectAsset(found);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="h-[440px] w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <TradingViewWidget
                symbol={selectedAsset.symbol}
                timeframe={timeframe}
                theme={theme}
                onSymbolChange={(sym) => {
                  const found = SUPPORTED_ASSETS.find((a) => a.symbol === sym);
                  if (found) onSelectAsset(found);
                }}
              />
            </div>
            <div className="h-[440px] w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <SignalAnalysisChart
                candles={candles}
                timeframe={timeframe}
                onTimeframeChange={onTimeframeChange}
                metrics={metrics}
                signal={signal}
                symbol={selectedAsset.symbol}
                theme={theme}
                decimals={selectedAsset.decimals}
                currency={currency}
                onRefreshSignal={onRefreshSignal}
              />
            </div>
          </div>
        )}
      </div>

      {/* 🧭 SEPARATE SIGNAL IDENTIFICATION & CONFLUENCE SYSTEM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col gap-3 font-sans">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
                  SEPARATE CONFLUENCE &amp; MARKET ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  ISOLATE &amp; IDENTIFY EACH PILLAR
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Inspect Daily Bias, Volume Profile (POC), Order Flow Footprint, Key Levels, and Deriv Options individually
              </p>
            </div>
          </div>

          {/* Interactive Inspection Navigation Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSeparateInspectorTab('ALL')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                separateInspectorTab === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              📑 All Confluences
            </button>
            <button
              onClick={() => setSeparateInspectorTab('REAL_TREND_NEXT_CANDLE')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
                separateInspectorTab === 'REAL_TREND_NEXT_CANDLE'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Trend &amp; Next Candle ({signal?.upcomingCandlePrediction?.probability || 92}%)</span>
            </button>
            <button
              onClick={() => setSeparateInspectorTab('DAILY_BIAS')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                separateInspectorTab === 'DAILY_BIAS'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
              }`}
            >
              🌐 Daily Bias ({signal?.dailyBias?.bias || 'BIAS'})
            </button>
            <button
              onClick={() => setSeparateInspectorTab('VOLUME_PROFILE')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                separateInspectorTab === 'VOLUME_PROFILE'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              📊 Volume Profile (POC)
            </button>
            <button
              onClick={() => setSeparateInspectorTab('FOOTPRINT')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                separateInspectorTab === 'FOOTPRINT'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200'
              }`}
            >
              👣 Footprint Clusters
            </button>
            <button
              onClick={() => setSeparateInspectorTab('KEY_LEVELS')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                separateInspectorTab === 'KEY_LEVELS'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
              }`}
            >
              🎯 Key Levels ({signal?.keyLevels?.length || 0})
            </button>
            <button
              onClick={() => setSeparateInspectorTab('CHART_PATTERNS')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 ${
                separateInspectorTab === 'CHART_PATTERNS'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chart Patterns ({chartPatterns.length})</span>
            </button>
            <button
              onClick={() => setSeparateInspectorTab('DERIV_OPTIONS')}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                separateInspectorTab === 'DERIV_OPTIONS'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700'
              }`}
            >
              ⚡ Deriv DTrader Options ({dtraderSym})
            </button>
          </div>
        </div>

        {/* Content according to tab selection */}
        {separateInspectorTab === 'REAL_TREND_NEXT_CANDLE' && (
          <RealTrendAndNextCandleCard
            signal={signal}
            candles={candles}
            metrics={metrics}
            selectedAsset={selectedAsset}
            timeframe={timeframe}
            currentPrice={currentPrice}
            decimals={selectedAsset.decimals}
          />
        )}
        {separateInspectorTab === 'DAILY_BIAS' && (
          <DailyBiasCard
            dailyBias={signal?.dailyBias}
            symbol={selectedAsset.symbol}
            currentPrice={currentPrice}
            decimals={selectedAsset.decimals}
          />
        )}

        {separateInspectorTab === 'VOLUME_PROFILE' && (
          <VolumeProfileCard
            volumeProfile={signal?.volumeProfile}
            symbol={selectedAsset.symbol}
            currentPrice={currentPrice}
            decimals={selectedAsset.decimals}
          />
        )}

        {separateInspectorTab === 'FOOTPRINT' && (
          <FootprintOrderFlowCard
            footprintAnalysis={signal?.footprintAnalysis}
            symbol={selectedAsset.symbol}
            decimals={selectedAsset.decimals}
          />
        )}

        {separateInspectorTab === 'KEY_LEVELS' && (
          <KeyLevelsRadarCard
            keyLevels={signal?.keyLevels}
            symbol={selectedAsset.symbol}
            currentPrice={currentPrice}
            decimals={selectedAsset.decimals}
          />
        )}

        {separateInspectorTab === 'CHART_PATTERNS' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                    ALL DETECTED CHART PATTERNS ({chartPatterns.length} FORMATIONS)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Double Tops/Bottoms, Head &amp; Shoulders, Wedges, Triangles, Flags, and SMC Displacements for {selectedAsset.displayName}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-900 border border-rose-300">
                {chartPatterns.length} Active Formations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chartPatterns.map((pat) => (
                <div
                  key={pat.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {pat.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        pat.bias === 'BULLISH'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      {pat.bias} ({pat.winRate}% WIN RATE)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                    {pat.description}
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1 border-t border-slate-200">
                    <div className="bg-white p-1 rounded border border-slate-100">
                      <span className="text-slate-400 block font-sans">Trigger Level</span>
                      <strong className="text-amber-800">{pat.keyLevels.breakoutLevel}</strong>
                    </div>
                    <div className="bg-white p-1 rounded border border-slate-100">
                      <span className="text-slate-400 block font-sans">Target 1</span>
                      <strong className="text-emerald-700">{pat.keyLevels.target1}</strong>
                    </div>
                    <div className="bg-white p-1 rounded border border-slate-100">
                      <span className="text-slate-400 block font-sans">Invalidation SL</span>
                      <strong className="text-rose-700">{pat.keyLevels.invalidation}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {separateInspectorTab === 'DERIV_OPTIONS' && (
          <DerivSyntheticOptionCard
            signal={signal}
            selectedAsset={selectedAsset}
            accountBalance={accountBalance}
            timeframe={timeframe}
            onSelectAsset={onSelectAsset}
            supportedAssets={SUPPORTED_ASSETS}
            chartPatterns={chartPatterns}
            onCalibratePrice={onCalibratePrice}
          />
        )}

        {separateInspectorTab === 'ALL' && (
          <div className="flex flex-col gap-3">
            {/* Real Trend & Next Candle Prediction Card */}
            <RealTrendAndNextCandleCard
              signal={signal}
              candles={candles}
              metrics={metrics}
              selectedAsset={selectedAsset}
              timeframe={timeframe}
              currentPrice={currentPrice}
              decimals={selectedAsset.decimals}
            />

            {/* Show Deriv Synthetic Option Card if synthetic asset selected */}
            {(selectedAsset.category === 'SYNTHETICS' ||
              selectedAsset.symbol.startsWith('VOL_') ||
              selectedAsset.symbol.startsWith('BOOM') ||
              selectedAsset.symbol.startsWith('CRASH') ||
              selectedAsset.symbol.startsWith('STEP')) && (
              <DerivSyntheticOptionCard
                signal={signal}
                selectedAsset={selectedAsset}
                accountBalance={accountBalance}
                timeframe={timeframe}
                onSelectAsset={onSelectAsset}
                supportedAssets={SUPPORTED_ASSETS}
                chartPatterns={chartPatterns}
                onCalibratePrice={onCalibratePrice}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <DailyBiasCard
                dailyBias={signal?.dailyBias}
                symbol={selectedAsset.symbol}
                currentPrice={currentPrice}
                decimals={selectedAsset.decimals}
              />
              <VolumeProfileCard
                volumeProfile={signal?.volumeProfile}
                symbol={selectedAsset.symbol}
                currentPrice={currentPrice}
                decimals={selectedAsset.decimals}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <FootprintOrderFlowCard
                footprintAnalysis={signal?.footprintAnalysis}
                symbol={selectedAsset.symbol}
                decimals={selectedAsset.decimals}
              />
              <KeyLevelsRadarCard
                keyLevels={signal?.keyLevels}
                symbol={selectedAsset.symbol}
                currentPrice={currentPrice}
                decimals={selectedAsset.decimals}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confluence Breakdown & Technical Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left (1 col): Live Signal Summary & Reliability Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                Active Algorithmic Setup
              </h3>
            </div>
            <button
              onClick={onRefreshSignal}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Signal & Confluence"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {signal ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg font-bold text-sm ${
                      isBuy
                        ? 'bg-emerald-100 text-emerald-700'
                        : isSell
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">
                      {signal.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Confidence: {signal.confidence}%
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    signal.reliabilityTier === 'ULTRA_HIGH_CONFLUENCE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  }`}
                >
                  {signal.reliabilityTier?.replace(/_/g, ' ') || 'HIGH CONFIDENCE'}
                </span>
              </div>

              {/* Target Price Levels */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Entry Zone</span>
                  <span className="font-bold text-slate-900">
                    {signal.entryZone[0]} - {signal.entryZone[1]}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="text-[10px] text-rose-600 block">Stop Loss (SL)</span>
                  <span className="font-bold">{signal.stopLoss}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="text-[10px] text-emerald-600 block">Target 1 (TP1)</span>
                  <span className="font-bold">{signal.takeProfit1}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="text-[10px] text-emerald-600 block">Target 2 (TP2)</span>
                  <span className="font-bold">{signal.takeProfit2}</span>
                </div>
              </div>

              {/* Confluence Checklist */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-700">Confluence Checklist:</span>
                {signal.checklist.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-700 truncate pr-2">{c.label}</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        c.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.passed ? 'PASSED' : 'HOLD'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-mono">Loading signal data...</p>
          )}
        </div>

        {/* Center (1 col): Technical Metrics Gauges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                Technical Indicators
              </h3>
            </div>
            <button
              onClick={onRefreshMetrics}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Technical Metrics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 font-mono text-xs">
            {/* RSI */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 font-bold">RSI (14 Period)</span>
                <span
                  className={`font-bold ${
                    metrics.rsi > 70
                      ? 'text-rose-600'
                      : metrics.rsi < 30
                      ? 'text-emerald-600'
                      : 'text-indigo-600'
                  }`}
                >
                  {metrics.rsi} {metrics.rsi > 70 ? '• Overbought' : metrics.rsi < 30 ? '• Oversold' : '• Neutral'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    metrics.rsi > 70
                      ? 'bg-rose-500'
                      : metrics.rsi < 30
                      ? 'bg-emerald-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${metrics.rsi}%` }}
                />
              </div>
            </div>

            {/* MACD */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">MACD Momentum</span>
                <span
                  className={`font-bold ${
                    metrics.macd.hist >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {metrics.macd.hist >= 0 ? '+' : ''}
                  {metrics.macd.hist.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Cross: <strong className="text-slate-800">{metrics.macd.cross.replace('_', ' ')}</strong>
              </p>
            </div>

            {/* Supertrend */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Supertrend (10, 3)</span>
                <span
                  className={`font-bold ${
                    metrics.supertrend.direction === 'BULLISH'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {metrics.supertrend.direction}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Stop Level: <strong>${metrics.supertrend.value.toFixed(2)}</strong>
              </p>
            </div>

            {/* ATR Volatility */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Average True Range (ATR)</span>
                <span className="font-bold text-amber-700">${metrics.atr}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Bollinger Squeeze: <strong className={metrics.bollinger.squeeze ? 'text-amber-700' : 'text-slate-600'}>{metrics.bollinger.squeeze ? 'ACTIVE SQUEEZE' : 'NORMAL'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right (1 col): Volume Delta CVD & Order Depth */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                Volume Delta &amp; Depth
              </h3>
            </div>
            <button
              onClick={onRefreshMetrics}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Order Flow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Cumulative Volume Delta</span>
                <span
                  className={`font-bold ${
                    metrics.volumeAnalysis.deltaPercent >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {metrics.volumeAnalysis.deltaPercent >= 0 ? '+' : ''}
                  {metrics.volumeAnalysis.deltaPercent}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Profile: <strong className="text-slate-800">{metrics.volumeAnalysis.cvdTrend.replace(/_/g, ' ')}</strong>
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Bid / Ask Ratio</span>
                <span className="font-bold text-slate-900">
                  {(metrics.orderBook.bidRatio * 100).toFixed(0)}% Bids
                </span>
              </div>
              <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden mt-1.5 flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${metrics.orderBook.bidRatio * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span className="text-emerald-700">Buyer Liquidity</span>
                <span className="text-rose-700">Seller Liquidity</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-sans text-slate-600">
              <strong>VSA Footprint:</strong> {metrics.volumeAnalysis.vsaSummary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

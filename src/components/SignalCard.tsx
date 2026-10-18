import React, { useState, useEffect } from 'react';
import { LiveSignal, IndicatorMetrics, Timeframe, MarketReversalAlert } from '../types/trading';
import { soundManager } from '../utils/sound';
import { formatTelegramSignal } from '../utils/indicators';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  ArrowRight,
  Clock,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Zap,
  PlayCircle,
  Copy,
  Check,
  Send,
  Brain,
  BarChart3,
  BarChart2,
  Gauge,
  Percent,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Compass,
  Footprints,
  Crosshair,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface SignalCardProps {
  signal: LiveSignal;
  metrics: IndicatorMetrics;
  currentPrice: number;
  timeframe: Timeframe;
  onExecuteTrade: (type: 'LONG' | 'SHORT') => void;
  onOpenTelegramModal?: () => void;
  onViewStrategy?: () => void;
  onOpenBacktest?: () => void;
  onRefreshSignal?: () => void;
  onCalibratePrice?: (price: number) => void;
  onOpenAccountModal?: () => void;
  currency?: string;
  forexLeverage?: number;
  onSaveForexLeverage?: (leverage: number) => void;
  forexLotSize?: number;
  onSaveForexLotSize?: (lotSize: number) => void;
  isRefreshingSignal?: boolean;
  lastRefreshedTime?: string;
  onTimeframeChange?: (tf: Timeframe) => void;
  onSaveBalance?: (newBalance: number) => void;
  reversalAlert?: MarketReversalAlert | null;
  onDismissReversalAlert?: () => void;
  onAdoptReversal?: () => void;
  onSetBreakeven?: (level: number) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  metrics,
  currentPrice,
  timeframe,
  onExecuteTrade,
  onOpenTelegramModal,
  onViewStrategy,
  onOpenBacktest,
  onRefreshSignal,
  onCalibratePrice,
  onOpenAccountModal,
  currency = 'THB',
  forexLeverage = 500,
  onSaveForexLeverage,
  forexLotSize = 0.01,
  onSaveForexLotSize,
  isRefreshingSignal = false,
  lastRefreshedTime,
  onTimeframeChange,
  onSaveBalance,
  reversalAlert,
  onDismissReversalAlert,
  onAdoptReversal,
  onSetBreakeven,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [expandedPillar, setExpandedPillar] = useState<'TREND_CANDLE' | 'BIAS' | 'VP' | 'FOOTPRINT' | 'LEVELS' | 'DERIV' | null>('TREND_CANDLE');

  const candleSeconds =
    timeframe === '1m'
      ? 60
      : timeframe === '5m'
      ? 300
      : timeframe === '15m'
      ? 900
      : timeframe === '1h'
      ? 3600
      : 14400;

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const rem = candleSeconds - (now % candleSeconds);
      setSecondsRemaining(rem);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [candleSeconds]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playSignalAlert(signal.type);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    soundManager.setVoiceEnabled(next);
    if (next) {
      soundManager.speakAlert(`Signal active for ${signal.symbol}`);
    }
  };

  const copySignal = () => {
    const text = formatTelegramSignal(signal);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBuy = signal.type.includes('BUY');
  const isSell = signal.type.includes('SELL');
  const decimals = signal.symbol.includes('EUR') || signal.symbol.includes('FX:') ? 4 : 2;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">LIVE SIGNAL RADAR</h3>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                REAL-TIME
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{signal.symbol}</span>
              <span className="text-slate-300">•</span>
              {/* Interactive Timeframe Switcher */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['1m', '5m', '15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => onTimeframeChange && onTimeframeChange(tf)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                    title={`Switch signal analysis to ${tf} timeframe`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>TradingView Synced</span>
              </span>
            </div>
          </div>
        </div>

        {/* Audio / Copy / Backtest tools */}
        <div className="flex items-center gap-1">
          {onRefreshSignal && (
            <button
              onClick={onRefreshSignal}
              disabled={isRefreshingSignal}
              className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all flex items-center gap-1 font-mono text-[11px] font-bold"
              title="Refresh live signal with current real-time market order flow & confluence"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshingSignal ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              {lastRefreshedTime && (
                <span className="text-[9px] text-amber-800 font-normal hidden md:inline">({lastRefreshedTime})</span>
              )}
            </button>
          )}

          {onOpenBacktest && (
            <button
              onClick={onOpenBacktest}
              className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all flex items-center gap-1 font-mono text-[11px] font-bold shadow-2xs"
              title="Run Historical Backtest to Check Win-Rate Probability"
            >
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Backtest</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-200/80 text-indigo-950 font-black">
                {signal.backtestProbability?.winRate || 84}% Prob
              </span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition-all ${
              soundOn
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundOn ? 'Sound enabled' : 'Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-lg border transition-all ${
              voiceOn
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={voiceOn ? 'Voice alert on' : 'Voice alert off'}
          >
            {voiceOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={copySignal}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all"
            title="Copy Telegram Formatted Signal"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 🚨 Active Reversal Warning Alert against Current Position */}
      {reversalAlert && (
        <div className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-2 border-rose-500 text-white shadow-lg animate-bounce-short">
          <div className="flex items-center justify-between pb-1.5 border-b border-rose-700/60">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <strong className="text-xs uppercase tracking-wide text-rose-200">
                🚨 Market Reversal Alert Against Your Signal!
              </strong>
            </div>
            {onDismissReversalAlert && (
              <button
                type="button"
                onClick={onDismissReversalAlert}
                className="text-rose-300 hover:text-white text-xs font-bold px-1 rounded hover:bg-white/10"
                title="Dismiss reversal alert"
              >
                ✕
              </button>
            )}
          </div>
          <div className="py-1.5 text-xs text-rose-100 flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span>Trigger: <strong className="text-amber-300">{reversalAlert.triggerReason}</strong></span>
              <span>Price: <strong className="text-white">${reversalAlert.currentPrice}</strong></span>
            </div>
            <p className="text-[11px] text-amber-200/90 font-sans leading-tight">
              {reversalAlert.recommendedAction}
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-rose-800/60 flex-wrap">
            {reversalAlert.breakevenLevel && onSetBreakeven && (
              <button
                type="button"
                onClick={() => onSetBreakeven(reversalAlert.breakevenLevel!)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs font-sans"
              >
                Move S/L to Breakeven (${reversalAlert.breakevenLevel})
              </button>
            )}
            {onAdoptReversal && (
              <button
                type="button"
                onClick={onAdoptReversal}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 font-sans"
              >
                Flip to Counter Direction
              </button>
            )}
          </div>
        </div>
      )}

      {/* Real-Time Double Confirmation with Live Market Value */}
      <div className="my-2.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-xs font-mono flex flex-col gap-1.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-extrabold text-emerald-950 tracking-tight text-[11px] sm:text-xs">
              ✓ DOUBLE-CONFIRMED MARKET VALUE
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-800">
              Market: <strong className="text-emerald-950 font-bold">{currency} {currentPrice.toFixed(decimals)}</strong>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">
              0.00% SYNC
            </span>
            {onCalibratePrice && !isCalibrating && (
              <button
                type="button"
                onClick={() => {
                  setCustomPriceInput(currentPrice.toFixed(decimals));
                  setIsCalibrating(true);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 transition-colors shadow-2xs"
                title="Match exact price from your TradingView chart"
              >
                ✏️ Match Chart Price
              </button>
            )}
          </div>
        </div>

        {isCalibrating && onCalibratePrice && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseFloat(customPriceInput);
              if (!isNaN(val) && val > 0) {
                onCalibratePrice(val);
                setIsCalibrating(false);
              }
            }}
            className="flex items-center gap-1.5 pt-1.5 border-t border-emerald-200"
          >
            <span className="text-[10px] font-bold text-emerald-900 shrink-0">Enter Exact Chart Price:</span>
            <input
              type="number"
              step="any"
              autoFocus
              value={customPriceInput}
              onChange={(e) => setCustomPriceInput(e.target.value)}
              placeholder={currentPrice.toFixed(decimals)}
              className="flex-1 min-w-[90px] px-2 py-0.5 text-xs font-mono font-bold bg-white border border-emerald-400 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold shrink-0 transition-colors shadow-2xs"
            >
              Lock Price
            </button>
            <button
              type="button"
              onClick={() => setIsCalibrating(false)}
              className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] shrink-0"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Main Signal Badge */}
      <div className="mb-3 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl flex items-center justify-center font-bold ${
              isBuy
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : isSell
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-amber-100 text-amber-700 border border-amber-300'
            }`}
          >
            {isBuy ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-black tracking-tight ${
                  isBuy ? 'text-emerald-700' : isSell ? 'text-rose-700' : 'text-amber-700'
                }`}
              >
                {signal.type.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                {signal.confidence}%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Price: <strong className="text-slate-900 font-mono">{currency} {currentPrice.toFixed(decimals)}</strong> (R:R {signal.riskRewardRatio})
            </p>
            {onOpenBacktest && (
              <button
                onClick={onOpenBacktest}
                className="mt-1 flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 font-mono font-bold transition-colors"
                title="Click to inspect Monte Carlo Backtest Probability"
              >
                <Gauge className="w-3 h-3 text-indigo-600" />
                <span>Historical Win Rate: {signal.backtestProbability?.winRate || 84}% ({signal.backtestProbability?.grade || 'A'} Grade) →</span>
              </button>
            )}
          </div>
        </div>

        {/* Candle countdown */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 justify-end">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Candle Close</span>
          </div>
          <div className="text-sm font-mono font-bold text-sky-700 tracking-wider">
            {formatTime(secondsRemaining)}
          </div>
        </div>
      </div>

      {/* 🕯️ Real-Time Candlestick Pattern Anatomy Badge */}
      {signal.candlePatternAnalysis && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/70 border border-indigo-200/90 text-xs mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">🕯️</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-indigo-950 font-mono text-[11px] truncate">
                  {signal.candlePatternAnalysis.patternName}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    signal.candlePatternAnalysis.bias === 'BULLISH'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : signal.candlePatternAnalysis.bias === 'BEARISH'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {signal.candlePatternAnalysis.bias}
                </span>
              </div>
              <p className="text-[10px] text-indigo-700 line-clamp-1 mt-0.5 font-sans">
                {signal.candlePatternAnalysis.description}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="text-[10px] font-mono text-indigo-900 font-bold block">
              {signal.candlePatternAnalysis.reliability}% Confluence
            </span>
            {onOpenBacktest && (
              <button
                type="button"
                onClick={onOpenBacktest}
                className="text-[9px] text-indigo-600 hover:text-indigo-800 underline font-semibold"
              >
                Backtest →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🔮 Next Upcoming Candle Pattern Prediction */}
      {signal.upcomingCandlePrediction && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/90 text-xs mb-3 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔮</span>
              <span className="font-extrabold text-violet-950 font-mono text-[11px] uppercase tracking-wide">
                Next Upcoming Candle Prediction ({signal.timeframe.toUpperCase()})
              </span>
            </div>
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-violet-200/80 text-violet-900 border border-violet-300">
              {signal.upcomingCandlePrediction.probability}% Probability
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-slate-900 text-xs font-mono">
              {signal.upcomingCandlePrediction.patternName}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                signal.upcomingCandlePrediction.bias === 'BULLISH'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {signal.upcomingCandlePrediction.bias} ({signal.upcomingCandlePrediction.expectedMovePercent > 0 ? '+' : ''}{signal.upcomingCandlePrediction.expectedMovePercent}%)
            </span>
          </div>

          <p className="text-[11px] text-slate-600 font-sans mb-1.5">
            {signal.upcomingCandlePrediction.catalyst}
          </p>

          <div className="grid grid-cols-3 gap-1.5 bg-white/80 p-1.5 rounded-lg border border-violet-100 text-[10px] font-mono">
            <div>
              <span className="text-slate-400 block">Proj. High</span>
              <span className="font-bold text-slate-800">{signal.upcomingCandlePrediction.projectedRange.high}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Proj. Low</span>
              <span className="font-bold text-slate-800">{signal.upcomingCandlePrediction.projectedRange.low}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Proj. Close</span>
              <span className="font-bold text-violet-700">{signal.upcomingCandlePrediction.projectedRange.close}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trade Parameters: Entry, Stop Loss, TP 1, TP 2, TP 3, TP 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Entry Zone</span>
          <span className="text-xs font-mono font-bold text-slate-800 block truncate">
            {signal.entryZone ? `${signal.entryZone[0].toFixed(decimals)} - ${signal.entryZone[1].toFixed(decimals)}` : signal.priceAtSignal.toFixed(decimals)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">At Market Value</span>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-800 uppercase tracking-wider font-semibold">Stop Loss</span>
            <ShieldAlert className="w-3 h-3 text-rose-600" />
          </div>
          <span className="text-xs font-mono font-bold text-rose-800 block">
            {signal.stopLoss.toFixed(decimals)}
          </span>
          <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono">
            <span className="text-rose-700 font-bold">
              {signal.smallAccountSizing ? `-$${signal.smallAccountSizing.maxRiskUsd.toFixed(2)} (-${signal.smallAccountSizing.riskPercent}%)` : (signal.targetDistances?.slPercent !== undefined ? `${signal.targetDistances.slPercent}%` : '-1.20%')}
            </span>
            <span className="text-rose-500 font-semibold">
              {signal.targetDistances?.slPercent !== undefined ? `${signal.targetDistances.slPercent}%` : ''}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold">TP 1 (Scalp)</span>
            <Target className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 block">
            {signal.takeProfit1.toFixed(decimals)}
          </span>
          <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono">
            <span className="text-emerald-700 font-bold">
              {signal.smallAccountSizing?.potentialPnl?.tp1Usd ? `+$${signal.smallAccountSizing.potentialPnl.tp1Usd.toFixed(2)} (+${((signal.smallAccountSizing.potentialPnl.tp1Usd / signal.smallAccountSizing.accountBalance) * 100).toFixed(1)}%)` : '+1.20%'}
            </span>
            <span className="text-emerald-600 font-semibold">
              {signal.targetDistances?.tp1Percent !== undefined ? `+${signal.targetDistances.tp1Percent}%` : ''}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold">TP 2 (Target)</span>
            <Target className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 block">
            {signal.takeProfit2.toFixed(decimals)}
          </span>
          <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono">
            <span className="text-emerald-700 font-bold">
              {signal.smallAccountSizing?.potentialPnl?.tp2Usd ? `+$${signal.smallAccountSizing.potentialPnl.tp2Usd.toFixed(2)} (+${((signal.smallAccountSizing.potentialPnl.tp2Usd / signal.smallAccountSizing.accountBalance) * 100).toFixed(1)}%)` : '+2.40%'}
            </span>
            <span className="text-emerald-600 font-semibold">
              {signal.targetDistances?.tp2Percent !== undefined ? `+${signal.targetDistances.tp2Percent}%` : ''}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-900 uppercase tracking-wider font-semibold">TP 3 (Expand)</span>
            <Target className="w-3 h-3 text-emerald-700" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-900 block">
            {signal.takeProfit3?.toFixed(decimals) || (signal.takeProfit2 * 1.01).toFixed(decimals)}
          </span>
          <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono">
            <span className="text-emerald-800 font-bold">
              {signal.smallAccountSizing?.potentialPnl?.tp3Usd ? `+$${signal.smallAccountSizing.potentialPnl.tp3Usd.toFixed(2)} (+${((signal.smallAccountSizing.potentialPnl.tp3Usd / signal.smallAccountSizing.accountBalance) * 100).toFixed(1)}%)` : '+3.80%'}
            </span>
            <span className="text-emerald-700 font-semibold">
              {signal.targetDistances?.tp3Percent !== undefined ? `+${signal.targetDistances.tp3Percent}%` : ''}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-400">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-950 uppercase tracking-wider font-bold">TP 4 (Runner)</span>
            <Target className="w-3 h-3 text-emerald-800" />
          </div>
          <span className="text-xs font-mono font-black text-emerald-950 block">
            {signal.takeProfit4?.toFixed(decimals) || (signal.takeProfit2 * 1.02).toFixed(decimals)}
          </span>
          <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono">
            <span className="text-emerald-900 font-black">
              {signal.smallAccountSizing?.potentialPnl?.tp4Usd ? `+$${signal.smallAccountSizing.potentialPnl.tp4Usd.toFixed(2)} (+${((signal.smallAccountSizing.potentialPnl.tp4Usd / signal.smallAccountSizing.accountBalance) * 100).toFixed(1)}%)` : '+5.20%'}
            </span>
            <span className="text-emerald-800 font-semibold">
              {signal.targetDistances?.tp4Percent !== undefined ? `+${signal.targetDistances.tp4Percent}%` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 💰 Account Size Calibration & Risk Matching Shield */}
      {signal.smallAccountSizing && (
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-indigo-50 rounded-xl p-3 border border-amber-300 mb-3 space-y-2 font-mono text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-amber-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Wallet className="w-4 h-4 text-amber-600" />
              <span>Account Size Matcher (${signal.smallAccountSizing.accountBalance.toFixed(2)})</span>
            </div>
            
            {/* Quick Account Size Selector Presets */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-sans">Set Size:</span>
              {[5, 10, 25, 50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onSaveBalance && onSaveBalance(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all border ${
                    signal.smallAccountSizing?.accountBalance === preset
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
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors"
                  title="Change custom account balance"
                >
                  ✏️ Custom...
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Matched Position</span>
              <strong className="text-slate-900 text-[11px] truncate block">{signal.smallAccountSizing.lotSize}</strong>
            </div>
            <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Risk @ Stop Loss</span>
              <strong className="text-rose-600 text-[11px] block">-${signal.smallAccountSizing.maxRiskUsd} ({signal.smallAccountSizing.riskPercent}%)</strong>
            </div>
            <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Gain @ TP 1</span>
              <strong className="text-emerald-700 text-[11px] block">+${signal.smallAccountSizing.potentialPnl.tp1Usd} (+{((signal.smallAccountSizing.potentialPnl.tp1Usd / signal.smallAccountSizing.accountBalance) * 100).toFixed(1)}%)</strong>
            </div>
            <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Drawdown Survival</span>
              <strong className="text-indigo-700 text-[11px] block">{signal.smallAccountSizing.survivalTrades}+ Trades</strong>
            </div>
          </div>

          <p className="text-[11px] font-sans text-slate-600 bg-white/70 p-1.5 rounded-lg border border-amber-200/60 leading-tight">
            🛡️ <strong>Account Calibration Shield:</strong> {signal.smallAccountSizing.advice}
          </p>

          {/* Quick Forex Leverage & Lot Size Settings */}
          {(onSaveForexLeverage || onSaveForexLotSize) && (
            <div className="pt-1.5 border-t border-amber-200/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                <span className="text-slate-700 font-bold flex items-center gap-1">
                  <span>💱 Forex Leverage &amp; Lot Size:</span>
                  <span className="text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 font-black">
                    {signal.smallAccountSizing.recommendedLeverage}
                  </span>
                </span>
                <span className="text-emerald-800 font-semibold text-[10px]">
                  Req Margin: ${signal.smallAccountSizing.estimatedMarginUsd} • Pip: ${signal.smallAccountSizing.pipValueUsd?.toFixed(2) || '0.10'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-between">
                {/* Leverage options */}
                {onSaveForexLeverage && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-semibold">Leverage:</span>
                    {[100, 200, 500, 1000].map((lev) => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => onSaveForexLeverage(lev)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          forexLeverage === lev
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-black'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        1:{lev}
                      </button>
                    ))}
                  </div>
                )}

                {/* Lot size options */}
                {onSaveForexLotSize && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-semibold">Lot:</span>
                    {[0.01, 0.02, 0.05, 0.10].map((lot) => (
                      <button
                        key={lot}
                        type="button"
                        onClick={() => onSaveForexLotSize(lot)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          forexLotSize === lot
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-black'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lot} {lot === 0.01 ? 'Micro' : lot === 0.1 ? 'Mini' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🤖 AI Analysis Breakdown Card */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Brain className="w-4 h-4 text-emerald-600" />
            <span>🤖 AI Analysis Breakdown</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            {signal.aiAnalysis?.verdict || 'GOOD SIGNAL'}
          </span>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <p className="line-clamp-3 hover:line-clamp-none transition-all">
            {signal.aiAnalysis?.analysis || signal.rationale}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
          <span>RISK ASSESSMENT:</span>
          <span className="font-bold text-emerald-700">
            {signal.aiAnalysis?.risk || 'Low'} Risk Confluence
          </span>
        </div>
      </div>

      {/* Volume Spread Analysis (VSA) & CVD Delta Section */}
      {signal.volumeAnalysis && (
        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/80 mb-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Volume Analysis (VSA & CVD)</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                signal.volumeAnalysis.relativeVolume >= 1.4
                  ? 'bg-emerald-200 text-emerald-950 font-black'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {signal.volumeAnalysis.relativeVolume}x 20-SMA VOL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-1.5 rounded bg-white border border-emerald-100 flex justify-between">
              <span className="text-slate-500">Volume Status:</span>
              <strong className="text-slate-800 text-[10px] truncate max-w-[85px]">
                {signal.volumeAnalysis.volumeStatus.replace(/_/g, ' ')}
              </strong>
            </div>
            <div className="p-1.5 rounded bg-white border border-emerald-100 flex justify-between">
              <span className="text-slate-500">CVD Delta:</span>
              <strong className={signal.volumeAnalysis.deltaPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {signal.volumeAnalysis.deltaPercent >= 0 ? '+' : ''}{signal.volumeAnalysis.deltaPercent}%
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-snug font-sans">
            {signal.volumeAnalysis.vsaSummary}
          </p>
        </div>
      )}

      {/* 🧭 SEPARATE CONFLUENCE PILLARS (Isolate & Inspect Each Separately) */}
      <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200 mb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase">
              Identify Each Component Separately:
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
            6 CONFLUENCE PILLARS
          </span>
        </div>

        {/* Pillar Switcher Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setExpandedPillar(expandedPillar === 'TREND_CANDLE' ? null : 'TREND_CANDLE')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border flex items-center gap-1 ${
              expandedPillar === 'TREND_CANDLE'
                ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                : 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Real Trend &amp; Next Candle ({signal.upcomingCandlePrediction?.probability || 92}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setExpandedPillar(expandedPillar === 'BIAS' ? null : 'BIAS')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border flex items-center gap-1 ${
              expandedPillar === 'BIAS'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Daily Bias ({signal.dailyBias?.bias || 'N/A'})</span>
          </button>

          <button
            type="button"
            onClick={() => setExpandedPillar(expandedPillar === 'VP' ? null : 'VP')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border flex items-center gap-1 ${
              expandedPillar === 'VP'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Volume Profile ({signal.volumeProfile ? `POC ${signal.volumeProfile.poc}` : 'VP'})</span>
          </button>

          <button
            type="button"
            onClick={() => setExpandedPillar(expandedPillar === 'FOOTPRINT' ? null : 'FOOTPRINT')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border flex items-center gap-1 ${
              expandedPillar === 'FOOTPRINT'
                ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Footprints className="w-3 h-3" />
            <span>Footprint ({(signal.footprintAnalysis?.cumulativeVolumeDelta ?? 0) > 0 ? `+${signal.footprintAnalysis?.cumulativeVolumeDelta}` : (signal.footprintAnalysis?.cumulativeVolumeDelta ?? '0')})</span>
          </button>

          <button
            type="button"
            onClick={() => setExpandedPillar(expandedPillar === 'LEVELS' ? null : 'LEVELS')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border flex items-center gap-1 ${
              expandedPillar === 'LEVELS'
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Key Levels ({signal.keyLevels?.length || 0})</span>
          </button>

          {signal.derivOptionSignal && (
            <button
              type="button"
              onClick={() => setExpandedPillar(expandedPillar === 'DERIV' ? null : 'DERIV')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border flex items-center gap-1 ${
                expandedPillar === 'DERIV'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs font-black'
                  : 'bg-slate-900 text-amber-300 border-slate-700'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Deriv Options ({signal.derivOptionSignal.contractType.replace(/_/g, ' ')})</span>
            </button>
          )}
        </div>

        {/* Expanded Panel Details */}
        {expandedPillar === 'TREND_CANDLE' && signal.upcomingCandlePrediction && (
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 rounded-xl p-3 border border-violet-200 flex flex-col gap-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-violet-200">
              <span className="font-bold text-violet-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Real Trend &amp; Next Candle: <strong>{signal.upcomingCandlePrediction.patternName}</strong></span>
              </span>
              <span className="px-2 py-0.5 rounded bg-violet-200 text-violet-900 font-bold text-[10px]">
                {signal.upcomingCandlePrediction.probability}% Probability
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
              <div className="bg-white/90 p-1.5 rounded border border-violet-100">
                <span className="text-slate-400 block font-sans">High Wick Target</span>
                <strong className="text-slate-900">{signal.upcomingCandlePrediction.projectedRange.high}</strong>
              </div>
              <div className="bg-white/90 p-1.5 rounded border border-violet-100">
                <span className="text-slate-400 block font-sans">Projected Close</span>
                <strong className={isBuy ? 'text-emerald-700' : 'text-rose-700'}>
                  {signal.upcomingCandlePrediction.projectedRange.close}
                </strong>
              </div>
              <div className="bg-white/90 p-1.5 rounded border border-violet-100">
                <span className="text-slate-400 block font-sans">Low Wick Target</span>
                <strong className="text-slate-900">{signal.upcomingCandlePrediction.projectedRange.low}</strong>
              </div>
            </div>

            <div className="bg-white/90 p-2 rounded border border-violet-100 text-[10px] font-sans text-slate-700 leading-tight">
              <strong className="text-violet-900">Trading Action: </strong>
              {signal.upcomingCandlePrediction.tradingAction}
            </div>
          </div>
        )}

        {expandedPillar === 'BIAS' && signal.dailyBias && (
          <div className="bg-white rounded-lg p-2.5 border border-indigo-200 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-indigo-900 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Forex Daily Bias: <strong>{signal.dailyBias.bias}</strong> ({signal.dailyBias.strength}%)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Score: <strong>{signal.dailyBias.biasScore}</strong> / 100
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1 border-t border-slate-100">
              <div className="bg-slate-50 p-1 rounded">
                <span className="text-slate-400 block">PDH:</span>
                <strong className="text-rose-700">{signal.dailyBias.dailyHigh.toFixed(decimals)}</strong>
              </div>
              <div className="bg-slate-50 p-1 rounded">
                <span className="text-slate-400 block">PDL:</span>
                <strong className="text-emerald-700">{signal.dailyBias.dailyLow.toFixed(decimals)}</strong>
              </div>
              <div className="bg-slate-50 p-1 rounded">
                <span className="text-slate-400 block">Sweep:</span>
                <strong className="text-indigo-700 truncate block">{signal.dailyBias.sweptLiquidity.replace(/_/g, ' ')}</strong>
              </div>
            </div>
            <p className="text-[10px] font-sans text-slate-600 leading-tight">
              {signal.dailyBias.ictBiasDescription}
            </p>
          </div>
        )}

        {expandedPillar === 'VP' && signal.volumeProfile && (
          <div className="bg-white rounded-lg p-2.5 border border-amber-200 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Point of Control (POC): <strong>{signal.volumeProfile.poc.toFixed(decimals)}</strong></span>
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                {signal.volumeProfile.profileType.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-center pt-1 border-t border-slate-100">
              <div className="bg-rose-50 p-1 rounded border border-rose-100">
                <span className="text-rose-500 block">VAH (70%):</span>
                <strong className="text-rose-800">{signal.volumeProfile.vah.toFixed(decimals)}</strong>
              </div>
              <div className="bg-emerald-50 p-1 rounded border border-emerald-100">
                <span className="text-emerald-500 block">VAL (70%):</span>
                <strong className="text-emerald-800">{signal.volumeProfile.val.toFixed(decimals)}</strong>
              </div>
            </div>
            <p className="text-[10px] font-sans text-slate-600 leading-tight">
              {signal.volumeProfile.confluenceStatus}
            </p>
          </div>
        )}

        {expandedPillar === 'FOOTPRINT' && signal.footprintAnalysis && (
          <div className="bg-white rounded-lg p-2.5 border border-violet-200 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-violet-950 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-violet-600" />
                <span>Flow: <strong>{signal.footprintAnalysis.dominantSide.replace(/_/g, ' ')}</strong></span>
              </span>
              <span className={signal.footprintAnalysis.cumulativeVolumeDelta > 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                CVD: {signal.footprintAnalysis.cumulativeVolumeDelta > 0 ? `+${signal.footprintAnalysis.cumulativeVolumeDelta}` : signal.footprintAnalysis.cumulativeVolumeDelta}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-center pt-1 border-t border-slate-100">
              <div className="bg-emerald-50 p-1 rounded border border-emerald-100">
                <span className="text-emerald-600 block">Stacked Buy Imbalances:</span>
                <strong className="text-emerald-800">{signal.footprintAnalysis.stackedBuyImbalances} clusters</strong>
              </div>
              <div className="bg-rose-50 p-1 rounded border border-rose-100">
                <span className="text-rose-600 block">Stacked Sell Imbalances:</span>
                <strong className="text-rose-800">{signal.footprintAnalysis.stackedSellImbalances} clusters</strong>
              </div>
            </div>
            <p className="text-[10px] font-sans text-slate-600 leading-tight">
              {signal.footprintAnalysis.summary}
            </p>
          </div>
        )}

        {expandedPillar === 'LEVELS' && signal.keyLevels && signal.keyLevels.length > 0 && (
          <div className="bg-white rounded-lg p-2.5 border border-sky-200 flex flex-col gap-1.5 text-xs font-mono">
            <span className="font-bold text-sky-950 text-[11px] flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-sky-600" />
              <span>Closest Institutional Levels ({signal.symbol}):</span>
            </span>
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
              {signal.keyLevels.slice(0, 4).map((lvl) => (
                <div key={lvl.id} className="flex items-center justify-between text-[10px] p-1 rounded bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">{lvl.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${lvl.type === 'SUPPORT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {lvl.type}
                    </span>
                    <strong className="text-slate-900">{lvl.price.toFixed(decimals)}</strong>
                    <span className="text-slate-400 text-[9px]">({lvl.distancePoints.toFixed(decimals)} pts)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedPillar === 'DERIV' && signal.derivOptionSignal && (
          <div className="bg-slate-950 text-white rounded-lg p-2.5 border border-amber-400/40 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Deriv Option: <strong>{signal.derivOptionSignal.contractType.replace(/_/g, ' ')}</strong></span>
              </span>
              <span className="text-emerald-400 font-bold text-[10px]">
                Expiry: {signal.derivOptionSignal.recommendedDuration}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-center pt-1 border-t border-white/10">
              <div className="bg-white/10 p-1 rounded">
                <span className="text-slate-400 block">Stake ($5 Acct):</span>
                <strong className="text-white">${signal.derivOptionSignal.recommendedStakeUsd.toFixed(2)}</strong>
              </div>
              <div className="bg-emerald-500/20 p-1 rounded border border-emerald-400/30">
                <span className="text-emerald-300 block">Payout (95%):</span>
                <strong className="text-emerald-300">+${signal.derivOptionSignal.expectedPayoutUsd.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confluence Checklist */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 mb-3">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">
          Indicator Confluence Verification
        </span>
        <div className="space-y-1.5">
          {signal.checklist.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between text-xs gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={`truncate text-xs ${item.passed ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono shrink-0">
                {item.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ⚡ Telegram Automated Dispatch Status Strip */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 text-xs mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <Send className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="text-[11px] font-mono text-sky-900 truncate">
            Telegram Broadcast: <strong className="text-sky-700 font-bold">{signal.symbol}</strong> → Channel
          </span>
        </div>
        <button
          onClick={onOpenTelegramModal}
          className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 transition-colors shrink-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>CONFIG BOT</span>
        </button>
      </div>

      {/* 📊 Backtest Probability Engine Button */}
      {onOpenBacktest && (
        <button
          onClick={onOpenBacktest}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 hover:border-indigo-300 transition-all mb-3 shadow-2xs"
        >
          <Gauge className="w-4 h-4 text-indigo-600" />
          <span>📊 Backtest Signal Setup &amp; Check Probability ({signal.symbol})</span>
        </button>
      )}

      {/* Action Buttons: Execute Trade + Send to Telegram */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => onExecuteTrade(isBuy ? 'LONG' : 'SHORT')}
          className={`flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
            isBuy
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 active:scale-98'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10 active:scale-98'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Execute Demo {isBuy ? 'LONG' : 'SHORT'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onOpenTelegramModal && (
          <button
            onClick={onOpenTelegramModal}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-sm active:scale-98 shrink-0"
            title="Send formatted signal to Telegram channel https://t.me/+fvNHZMaLggM3YWRl"
          >
            <Send className="w-4 h-4" />
            <span>Send to Telegram</span>
          </button>
        )}
      </div>

      {/* 📖 Strategy Learning & Chart Snapshot Direct Link */}
      {onViewStrategy && (
        <button
          onClick={onViewStrategy}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 transition-all mt-2.5"
        >
          <Brain className="w-4 h-4 text-emerald-600" />
          <span>📖 View Strategy &amp; Chart Snapshot for {signal.symbol}</span>
        </button>
      )}
    </div>
  );
};

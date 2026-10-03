import React, { useState, useEffect } from 'react';
import { LiveSignal, IndicatorMetrics, Timeframe } from '../types/trading';
import { soundManager } from '../utils/sound';
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
} from 'lucide-react';

interface SignalCardProps {
  signal: LiveSignal;
  metrics: IndicatorMetrics;
  currentPrice: number;
  timeframe: Timeframe;
  onExecuteTrade: (type: 'LONG' | 'SHORT') => void;
  currency?: string;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  metrics,
  currentPrice,
  timeframe,
  onExecuteTrade,
  currency = 'THB',
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

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
    const text = `[AlphaPulse Signal] ${signal.symbol} ${signal.type}\nEntry: ${currency} ${signal.entryZone[0]} - ${signal.entryZone[1]}\nTP1: ${currency} ${signal.takeProfit1} | TP2: ${currency} ${signal.takeProfit2}\nSL: ${currency} ${signal.stopLoss} (RR: ${signal.riskRewardRatio})\nConfidence: ${signal.confidence}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBuy = signal.type.includes('BUY');
  const isSell = signal.type.includes('SELL');

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
            <p className="text-[11px] text-slate-500 font-mono">{signal.symbol} • {timeframe}</p>
          </div>
        </div>

        {/* Audio / Copy tools */}
        <div className="flex items-center gap-1">
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
            title="Copy Signal"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Signal Badge */}
      <div className="my-3 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
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
              Price: <strong className="text-slate-900 font-mono">{currency} {currentPrice.toFixed(2)}</strong> (R:R {signal.riskRewardRatio})
            </p>
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

      {/* Trade Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Entry Zone</span>
          <span className="text-xs font-mono font-bold text-slate-800 block truncate">
            {signal.entryZone[0].toFixed(2)} - {signal.entryZone[1].toFixed(2)}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold">TP 1</span>
            <Target className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 block">
            {signal.takeProfit1.toFixed(2)}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold">TP 2</span>
            <Target className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 block">
            {signal.takeProfit2.toFixed(2)}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-800 uppercase tracking-wider font-semibold">Stop Loss</span>
            <ShieldAlert className="w-3 h-3 text-rose-600" />
          </div>
          <span className="text-xs font-mono font-bold text-rose-800 block">
            {signal.stopLoss.toFixed(2)}
          </span>
        </div>
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

      {/* Execution CTA */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onExecuteTrade(isBuy ? 'LONG' : 'SHORT')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
            isBuy
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 active:scale-98'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10 active:scale-98'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Execute Demo {isBuy ? 'LONG' : 'SHORT'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

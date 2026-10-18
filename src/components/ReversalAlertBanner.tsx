import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  Bell,
  X,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MarketReversalAlert, LiveSignal } from '../types/trading';
import { soundManager } from '../utils/sound';

interface ReversalAlertBannerProps {
  alert: MarketReversalAlert | null;
  activeSignal: LiveSignal | null;
  onDismiss: () => void;
  onAdoptReversal?: () => void;
  onSetBreakeven?: (level: number) => void;
  onCloseTrade?: () => void;
  reversalAlertsEnabled: boolean;
  onToggleReversalAlerts: (enabled: boolean) => void;
}

export const ReversalAlertBanner: React.FC<ReversalAlertBannerProps> = ({
  alert,
  activeSignal,
  onDismiss,
  onAdoptReversal,
  onSetBreakeven,
  onCloseTrade,
  reversalAlertsEnabled,
  onToggleReversalAlerts,
}) => {
  const [isTestAlarmPlaying, setIsTestAlarmPlaying] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const handleTestSound = () => {
    setIsTestAlarmPlaying(true);
    soundManager.playReversalAlertSound();
    soundManager.speakAlert('Market reversal warning! Protect your active trade.');
    setTimeout(() => setIsTestAlarmPlaying(false), 800);
  };

  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationStatus(perm);
        if (perm === 'granted') {
          new Notification('AlphaPulse AI Reversal Monitor', {
            body: 'Reversal alerts are now enabled. You will be notified immediately if market moves against your trade.',
            icon: '/vite.svg',
          });
        }
      } catch {}
    }
  };

  if (!alert) {
    return (
      <div className="bg-slate-900/90 text-slate-300 border border-slate-700/60 rounded-xl px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="font-sans font-semibold text-slate-200">
            Reversal Defense Shield:
          </span>
          <span className="text-emerald-400 font-bold">
            MONITORING ACTIVE ({activeSignal ? activeSignal.symbol : 'MARKET'})
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            • Automated alerts if market moves against {activeSignal?.type || 'active'} signal
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleTestSound}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors text-[11px]"
            title="Test reversal audio alarm siren"
          >
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>Test Alarm</span>
          </button>

          {notificationStatus !== 'granted' && notificationStatus !== 'unsupported' && (
            <button
              type="button"
              onClick={handleEnablePush}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-600/60 transition-colors text-[11px]"
              title="Enable desktop/browser push notifications for market reversals"
            >
              <Bell className="w-3 h-3 text-sky-300" />
              <span>Enable Push</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleReversalAlerts(!reversalAlertsEnabled)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
              reversalAlertsEnabled
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-rose-900/40 text-rose-300 border-rose-700/50'
            }`}
            title="Toggle market reversal notifications"
          >
            {reversalAlertsEnabled ? 'Alerts: ON' : 'Alerts: OFF'}
          </button>
        </div>
      </div>
    );
  }

  const isBearishReversal = alert.reversalDirection === 'BEARISH_REVERSAL';
  const isCritical = alert.severity === 'CRITICAL';

  return (
    <div
      className={`w-full rounded-2xl border-2 p-4 shadow-xl transition-all animate-bounce-short relative overflow-hidden font-sans ${
        isCritical
          ? 'bg-gradient-to-r from-rose-950/95 via-rose-900/95 to-amber-950/95 border-rose-500 text-white shadow-rose-900/50'
          : 'bg-gradient-to-r from-amber-950/95 via-amber-900/95 to-slate-900/95 border-amber-400 text-white shadow-amber-900/50'
      }`}
    >
      {/* Background Warning Glow */}
      <div className="absolute -right-8 -top-8 w-44 h-44 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/20">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border flex items-center justify-center animate-pulse ${
              isCritical
                ? 'bg-rose-500 text-white border-rose-300 shadow-md shadow-rose-500/50'
                : 'bg-amber-500 text-white border-amber-300 shadow-md shadow-amber-500/50'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm tracking-wide uppercase text-white drop-shadow-xs">
                ⚠️ MARKET REVERSAL ALERT AGAINST ACTIVE SIGNAL
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border ${
                  isCritical
                    ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                    : 'bg-amber-400 text-amber-950 border-amber-200'
                }`}
              >
                {alert.severity} COUNTER-TREND SHIFT
              </span>
            </div>
            <p className="text-xs text-rose-100 font-medium">
              Market is reversing {isBearishReversal ? 'DOWNWARD against your BUY' : 'UPWARD against your SELL'} position on{' '}
              <strong className="text-white underline">{alert.symbol} ({alert.timeframe.toUpperCase()})</strong>!
            </p>
          </div>
        </div>

        {/* Right Dismiss & Audio Test */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTestSound}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
            title="Replay warning audio chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Replay Audio</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white transition-all text-xs font-bold"
            title="Dismiss reversal alert banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Alert Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 py-3">
        {/* Left: Cause & Price Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-rose-200">Trigger Reason:</span>
            <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 font-bold border border-amber-500/40">
              {alert.triggerReason}
            </span>
            <span className="text-rose-200 ml-auto">
              Current: <strong className="text-white">${alert.currentPrice}</strong>
            </span>
          </div>

          {/* Confluences list */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-white/10">
            <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wide block mb-1">
              Confirmed Reversal Evidence ({alert.confluenceFactors.length} Factors):
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-rose-100">
              {alert.confluenceFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-1.5 font-sans">
                  <span className="text-amber-400 font-bold">⚡</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs text-amber-100 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Defensive Strategy:</strong> {alert.recommendedAction}
            </div>
          </div>
        </div>

        {/* Right: Quick Trade Action Buttons */}
        <div className="flex flex-col gap-2 justify-center bg-black/30 p-3 rounded-xl border border-white/10">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider text-center block">
            Immediate Action Required
          </span>

          {alert.breakevenLevel && onSetBreakeven && (
            <button
              type="button"
              onClick={() => onSetBreakeven(alert.breakevenLevel!)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/30 font-sans"
              title="Move Stop Loss to entry price to eliminate further dollar risk"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Move S/L to Breakeven (${alert.breakevenLevel})</span>
            </button>
          )}

          {onCloseTrade && (
            <button
              type="button"
              onClick={onCloseTrade}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 font-sans"
              title="Close active position immediately to secure remaining profit or cut loss"
            >
              <X className="w-4 h-4" />
              <span>Close Position Immediately</span>
            </button>
          )}

          {onAdoptReversal && (
            <button
              type="button"
              onClick={onAdoptReversal}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all font-sans"
              title="Adopt current counter direction as new active focus"
            >
              {isBearishReversal ? <TrendingDown className="w-4 h-4 text-rose-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
              <span>Flip Focus to {isBearishReversal ? 'SELL' : 'BUY'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info & Auto-dispatch Telegram Status */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-rose-200/80 pt-2 border-t border-white/10 font-mono">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Detected: {new Date(alert.timestamp).toLocaleTimeString()}</span>
          <span>• Symbol: {alert.symbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Telegram Dispatch: AUTO-ALERT SENT 🚀</span>
          <button
            type="button"
            onClick={onDismiss}
            className="text-white hover:underline font-bold"
          >
            Acknowledge &amp; Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

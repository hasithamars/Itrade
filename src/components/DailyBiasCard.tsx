import React from 'react';
import { DailyBiasInfo } from '../types/trading';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Info,
  Maximize2,
} from 'lucide-react';

interface DailyBiasCardProps {
  dailyBias?: DailyBiasInfo;
  symbol: string;
  currentPrice: number;
  decimals?: number;
}

export const DailyBiasCard: React.FC<DailyBiasCardProps> = ({
  dailyBias,
  symbol,
  currentPrice,
  decimals = 2,
}) => {
  if (!dailyBias) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500">
        Loading Forex &amp; Market Daily Bias...
      </div>
    );
  }

  const isBull = dailyBias.bias === 'BULLISH';
  const isBear = dailyBias.bias === 'BEARISH';
  const isNeutral = dailyBias.bias === 'NEUTRAL';

  const badgeBg = isBull
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isBear
    ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  const progressColor = isBull
    ? 'bg-emerald-500'
    : isBear
    ? 'bg-rose-500'
    : 'bg-amber-500';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
            <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                FOREX DAILY BIAS MONITOR
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                HTF CONFLUENCE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Higher timeframe directional draw on liquidity for {symbol}
            </p>
          </div>
        </div>

        {/* Direction Badge */}
        <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border flex items-center gap-1.5 ${badgeBg}`}>
          {isBull ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : isBear ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span>{dailyBias.bias} BIAS</span>
          <span className="opacity-70 text-[10px]">({dailyBias.strength}%)</span>
        </div>
      </div>

      {/* Bias Meter Gauge */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-600 font-bold flex items-center gap-1">
            <span>Score:</span>
            <span className={dailyBias.biasScore > 0 ? 'text-emerald-700 font-black' : dailyBias.biasScore < 0 ? 'text-rose-700 font-black' : 'text-slate-700'}>
              {dailyBias.biasScore > 0 ? `+${dailyBias.biasScore}` : dailyBias.biasScore} / 100
            </span>
          </span>
          <span className="text-slate-500 text-[10px]">
            Macro Trend: <strong className="text-slate-800">{dailyBias.higherTimeframeTrend.replace(/_/g, ' ')}</strong>
          </span>
        </div>

        {/* Horizontal Meter */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${dailyBias.strength}%` }}
          />
        </div>
      </div>

      {/* Daily Key Session Levels (PDH, PDL, Open) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Prev Day High (PDH)</span>
          <span className="text-xs font-black font-mono text-rose-700 mt-0.5">
            {dailyBias.dailyHigh.toFixed(decimals)}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {currentPrice >= dailyBias.dailyHigh ? 'Swept / Break' : `${(dailyBias.dailyHigh - currentPrice).toFixed(decimals)} pts above`}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Prev Day Low (PDL)</span>
          <span className="text-xs font-black font-mono text-emerald-700 mt-0.5">
            {dailyBias.dailyLow.toFixed(decimals)}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {currentPrice <= dailyBias.dailyLow ? 'Swept / Grab' : `${(currentPrice - dailyBias.dailyLow).toFixed(decimals)} pts below`}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Daily Session Open</span>
          <span className="text-xs font-black font-mono text-slate-800 mt-0.5">
            {dailyBias.dailyOpen.toFixed(decimals)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {currentPrice > dailyBias.dailyOpen ? (
              <span className="text-emerald-600 font-bold">Premium Flow ▲</span>
            ) : (
              <span className="text-rose-600 font-bold">Discount Flow ▼</span>
            )}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Liquidity Sweep State</span>
          <span className="text-[11px] font-black font-mono text-indigo-700 mt-0.5 truncate">
            {dailyBias.sweptLiquidity.replace(/_/g, ' ')}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {dailyBias.sweptLiquidity === 'SWEPT_DAILY_HIGH'
              ? 'Bearish Reversal'
              : dailyBias.sweptLiquidity === 'SWEPT_DAILY_LOW'
              ? 'Bullish Reclaim'
              : 'Inside Range'}
          </span>
        </div>
      </div>

      {/* ICT / SMC Rationale */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 flex items-start gap-2">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-indigo-950 leading-relaxed font-sans">
          <strong className="font-semibold text-indigo-900">Institutional Bias Rationale: </strong>
          {dailyBias.ictBiasDescription}
        </div>
      </div>

      {/* Factors Checklist */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          Active Confluence Drivers:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {dailyBias.keyFactors.map((factor, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700"
            >
              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
              <span>{factor}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

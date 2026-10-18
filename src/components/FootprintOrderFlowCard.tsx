import React from 'react';
import { FootprintAnalysis } from '../types/trading';
import {
  Footprints,
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Flame,
  Zap,
  Info,
} from 'lucide-react';

interface FootprintOrderFlowCardProps {
  footprintAnalysis?: FootprintAnalysis;
  symbol: string;
  decimals?: number;
}

export const FootprintOrderFlowCard: React.FC<FootprintOrderFlowCardProps> = ({
  footprintAnalysis,
  symbol,
  decimals = 2,
}) => {
  if (!footprintAnalysis || footprintAnalysis.recentBars.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500">
        Loading Footprint &amp; Order Flow Clusters...
      </div>
    );
  }

  const {
    recentBars,
    cumulativeVolumeDelta,
    deltaDivergence,
    stackedBuyImbalances,
    stackedSellImbalances,
    dominantSide,
    summary,
  } = footprintAnalysis;

  const isBuyersAggressive = dominantSide === 'AGGRESSIVE_BUYERS';
  const isSellersAggressive = dominantSide === 'AGGRESSIVE_SELLERS';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700">
            <Footprints className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                FOOTPRINT ORDER FLOW &amp; IMBALANCES
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-violet-100 text-violet-800 border border-violet-200">
                BID × ASK CLUSTERS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Aggressive buyer/seller delta &amp; stacked imbalances for {symbol}
            </p>
          </div>
        </div>

        {/* Dominant Side Badge */}
        <div
          className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border flex items-center gap-1.5 ${
            isBuyersAggressive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isSellersAggressive
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          {isBuyersAggressive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : isSellersAggressive ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <Activity className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{dominantSide.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* CVD & Imbalance Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Cumulative Delta (CVD)</span>
          <span
            className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
              cumulativeVolumeDelta > 0
                ? 'text-emerald-700'
                : cumulativeVolumeDelta < 0
                ? 'text-rose-700'
                : 'text-slate-700'
            }`}
          >
            {cumulativeVolumeDelta > 0 ? `+${cumulativeVolumeDelta}` : cumulativeVolumeDelta}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">Net aggressive volume</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Stacked Buy Imbalances</span>
          <span className="text-xs sm:text-sm font-black font-mono text-emerald-700 mt-0.5">
            {stackedBuyImbalances}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">Ask ≥ 3× Bid clusters</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Stacked Sell Imbalances</span>
          <span className="text-xs sm:text-sm font-black font-mono text-rose-700 mt-0.5">
            {stackedSellImbalances}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">Bid ≥ 3× Ask clusters</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Delta Divergence</span>
          <span className="text-[11px] font-black font-mono text-indigo-700 mt-0.5 truncate">
            {deltaDivergence === 'BULLISH_DELTA_DIVERGENCE'
              ? 'Bullish Divergence'
              : deltaDivergence === 'BEARISH_DELTA_DIVERGENCE'
              ? 'Bearish Divergence'
              : 'None (Aligned)'}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {deltaDivergence !== 'NONE' ? 'Early Reversal Hint' : 'Trend In Sync'}
          </span>
        </div>
      </div>

      {/* Visual Footprint Candle Bars (Recent 4-5 bars) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-1 border-b border-slate-200">
          <span>RECENT CANDLE FOOTPRINT (BID × ASK CLUSTERS)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-100 border border-emerald-400 inline-block" /> Buy Imbalance
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-rose-100 border border-rose-400 inline-block" /> Sell Imbalance
            </span>
          </div>
        </div>

        {/* Horizontal scrollable columns for recent candles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 overflow-x-auto pb-1">
          {recentBars.map((bar, barIdx) => {
            const isBullCandle = bar.close >= bar.open;
            return (
              <div
                key={bar.time || barIdx}
                className={`bg-white border rounded-xl p-2 flex flex-col gap-1 shadow-2xs ${
                  isBullCandle ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                {/* Candle Header */}
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-100 pb-1">
                  <span className={`font-bold ${isBullCandle ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Bar #{barIdx + 1}
                  </span>
                  <span className={bar.totalDelta > 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    Δ {bar.totalDelta > 0 ? `+${bar.totalDelta}` : bar.totalDelta}
                  </span>
                </div>

                {/* Footprint Levels (Bid x Ask) */}
                <div className="flex flex-col gap-0.5 font-mono text-[9px]">
                  {bar.levels.map((lvl, lvlIdx) => {
                    const isBuyImb = lvl.imbalance === 'BUY_IMBALANCE';
                    const isSellImb = lvl.imbalance === 'SELL_IMBALANCE';

                    return (
                      <div
                        key={lvlIdx}
                        className={`flex items-center justify-between px-1 py-0.5 rounded-xs transition ${
                          isBuyImb
                            ? 'bg-emerald-100/80 text-emerald-950 font-bold border border-emerald-300'
                            : isSellImb
                            ? 'bg-rose-100/80 text-rose-950 font-bold border border-rose-300'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className={isSellImb ? 'font-black text-rose-800' : ''}>
                          {lvl.bidVolume}
                        </span>
                        <span className="text-slate-300 text-[8px]">×</span>
                        <span className={isBuyImb ? 'font-black text-emerald-800' : ''}>
                          {lvl.askVolume}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Absorption Note if present */}
                {bar.absorptionSignal && bar.absorptionSignal !== 'NONE' && (
                  <div className="mt-1 pt-1 border-t border-slate-100 text-center">
                    <span
                      className={`px-1 py-0.2 rounded-xs text-[8px] font-mono font-bold ${
                        bar.absorptionSignal === 'BUY_ABSORPTION'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {bar.absorptionSignal === 'BUY_ABSORPTION' ? '🛡️ Buy Absorb' : '🛡️ Sell Absorb'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footprint Summary */}
      <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-2.5 flex items-start gap-2">
        <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-violet-950 leading-relaxed font-sans">
          <strong>Order Flow Summary: </strong>
          {summary}
        </p>
      </div>
    </div>
  );
};

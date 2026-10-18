import React, { useState } from 'react';
import { VolumeProfileData } from '../types/trading';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Layers,
  Target,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface VolumeProfileCardProps {
  volumeProfile?: VolumeProfileData;
  symbol: string;
  currentPrice: number;
  decimals?: number;
}

export const VolumeProfileCard: React.FC<VolumeProfileCardProps> = ({
  volumeProfile,
  symbol,
  currentPrice,
  decimals = 2,
}) => {
  const [showAllTiers, setShowAllTiers] = useState<boolean>(false);

  if (!volumeProfile || volumeProfile.distribution.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500">
        Calculating Volume Profile (VPVR)...
      </div>
    );
  }

  const { poc, vah, val, distribution, profileType, priceVersusPOC, confluenceStatus } = volumeProfile;

  const isAbovePoc = priceVersusPOC === 'ABOVE_POC_BULLISH';
  const isBelowPoc = priceVersusPOC === 'BELOW_POC_BEARISH';

  // Display top levels or all levels
  const displayedLevels = showAllTiers
    ? [...distribution].reverse()
    : [...distribution]
        .filter((_, idx) => idx % 2 === 0 || distribution[idx].isPOC)
        .reverse()
        .slice(0, 12);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <BarChart2 className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                VOLUME PROFILE (VPVR) ENGINE
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                POC &amp; 70% VALUE AREA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Institutional volume clusters &amp; auction acceptance for {symbol}
            </p>
          </div>
        </div>

        {/* Profile Shape Badge */}
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-xl text-xs font-black font-mono border bg-slate-50 border-slate-200 text-slate-800">
            {profileType.replace(/_/g, ' ')}
          </span>
          <button
            onClick={() => setShowAllTiers(!showAllTiers)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            title="Toggle Detailed Tiers"
          >
            {showAllTiers ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Value Area Summary KPI Bar */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* VAH */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-rose-600 font-mono uppercase font-bold">Value Area High (VAH)</span>
          <span className="text-xs sm:text-sm font-black font-mono text-rose-800 mt-0.5">
            {vah.toFixed(decimals)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {currentPrice > vah ? 'Above Value (Premium)' : `${(vah - currentPrice).toFixed(decimals)} pts above`}
          </span>
        </div>

        {/* POC (Point of Control) */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-2 flex flex-col shadow-xs">
          <span className="text-[10px] text-amber-800 font-mono uppercase font-black flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>POC (Highest Volume)</span>
          </span>
          <span className="text-xs sm:text-sm font-black font-mono text-amber-950 mt-0.5">
            {poc.toFixed(decimals)}
          </span>
          <span className="text-[9px] font-bold font-mono">
            {isAbovePoc ? (
              <span className="text-emerald-700">Buyers Defending POC ▲</span>
            ) : isBelowPoc ? (
              <span className="text-rose-700">Sellers Defending POC ▼</span>
            ) : (
              <span className="text-amber-800">Directly at POC Rotation</span>
            )}
          </span>
        </div>

        {/* VAL */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2 flex flex-col">
          <span className="text-[10px] text-emerald-600 font-mono uppercase font-bold">Value Area Low (VAL)</span>
          <span className="text-xs sm:text-sm font-black font-mono text-emerald-800 mt-0.5">
            {val.toFixed(decimals)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {currentPrice < val ? 'Below Value (Discount)' : `${(currentPrice - val).toFixed(decimals)} pts below`}
          </span>
        </div>
      </div>

      {/* Visual Volume Profile Histogram */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-1 border-b border-slate-200">
          <span>PRICE TIER</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" /> Buy Vol
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" /> Sell Vol
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-amber-400 inline-block" /> POC Node
            </span>
          </div>
        </div>

        {/* Histogram Bars */}
        <div className="flex flex-col gap-1 font-mono text-[11px]">
          {displayedLevels.map((lvl) => {
            const isPocLevel = lvl.isPOC;
            const isCurrentNear = Math.abs(currentPrice - lvl.price) < (vah - val) * 0.08;
            const buyWidth = lvl.volume > 0 ? (lvl.buyVolume / lvl.volume) * lvl.percentageOfMax : 0;
            const sellWidth = lvl.volume > 0 ? (lvl.sellVolume / lvl.volume) * lvl.percentageOfMax : 0;

            return (
              <div
                key={lvl.price}
                className={`flex items-center justify-between gap-2 p-1 rounded-md transition ${
                  isPocLevel
                    ? 'bg-amber-100/70 border border-amber-300 font-bold'
                    : isCurrentNear
                    ? 'bg-indigo-50/70 border border-indigo-200'
                    : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-1.5 w-28 shrink-0">
                  {isPocLevel ? (
                    <span className="px-1 py-0.2 rounded-xs bg-amber-400 text-amber-950 font-black text-[9px]">
                      POC
                    </span>
                  ) : lvl.isValueArea ? (
                    <span className="px-1 py-0.2 rounded-xs bg-slate-200 text-slate-700 text-[9px]">
                      VA
                    </span>
                  ) : (
                    <span className="w-5" />
                  )}
                  <span className={`text-[11px] ${isPocLevel ? 'text-amber-950 font-black' : 'text-slate-700'}`}>
                    {lvl.price.toFixed(decimals)}
                  </span>
                  {isCurrentNear && (
                    <span className="text-[9px] text-indigo-600 font-bold">◀ Price</span>
                  )}
                </div>

                {/* Horizontal Volume Bar */}
                <div className="flex-1 bg-slate-200 h-3.5 rounded-xs overflow-hidden flex relative">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${buyWidth}%` }}
                    title={`Buy Volume: ${lvl.buyVolume}`}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${sellWidth}%` }}
                    title={`Sell Volume: ${lvl.sellVolume}`}
                  />
                  {isPocLevel && (
                    <div className="absolute inset-0 border-2 border-amber-400 rounded-xs pointer-events-none" />
                  )}
                </div>

                <div className="w-14 text-right text-[10px] text-slate-500 shrink-0">
                  {lvl.volume.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Context Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
          <strong>Volume Profile Status: </strong>
          {confluenceStatus}
        </p>
      </div>
    </div>
  );
};

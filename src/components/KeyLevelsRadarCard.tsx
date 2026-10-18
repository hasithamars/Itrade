import React, { useState } from 'react';
import { KeyMarketLevel } from '../types/trading';
import {
  Crosshair,
  TrendingUp,
  TrendingDown,
  Layers,
  Shield,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface KeyLevelsRadarCardProps {
  keyLevels?: KeyMarketLevel[];
  symbol: string;
  currentPrice: number;
  decimals?: number;
}

export const KeyLevelsRadarCard: React.FC<KeyLevelsRadarCardProps> = ({
  keyLevels = [],
  symbol,
  currentPrice,
  decimals = 2,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!keyLevels || keyLevels.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500">
        Scanning key institutional market levels...
      </div>
    );
  }

  const filteredLevels =
    selectedCategory === 'ALL'
      ? keyLevels
      : keyLevels.filter((lvl) => lvl.category === selectedCategory);

  const categories = [
    { id: 'ALL', label: 'All Levels' },
    { id: 'DAILY_BIAS', label: 'Daily Bias' },
    { id: 'VOLUME_PROFILE', label: 'Volume Profile' },
    { id: 'ORDER_BLOCK', label: 'Order Blocks' },
    { id: 'FAIR_VALUE_GAP', label: 'FVG Imbalances' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700">
            <Crosshair className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                KEY IDENTIFIED MARKET LEVELS
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200">
                {keyLevels.length} DETECTED
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Algorithmic support, resistance, order blocks, and liquidity pools for {symbol}
            </p>
          </div>
        </div>

        {/* Current Price Reference */}
        <div className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-700">
          Current: <span className="font-black text-slate-900">{currentPrice.toFixed(decimals)}</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Levels Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredLevels.map((lvl) => {
          const isAbove = lvl.price > currentPrice;
          const isSupport = lvl.type === 'SUPPORT';
          const isResistance = lvl.type === 'RESISTANCE';

          const typeBadge = isSupport
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isResistance
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-sky-50 text-sky-800 border-sky-200';

          const statusBadge =
            lvl.status === 'UNTESTED'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : lvl.status === 'TOUCHED'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200';

          return (
            <div
              key={lvl.id}
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-1.5 hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold border ${typeBadge}`}>
                    {lvl.type}
                  </span>
                  <span className="text-xs font-black font-mono text-slate-900 tracking-tight">
                    {lvl.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span className={`px-1.5 py-0.2 rounded-md text-[8px] font-bold border ${statusBadge}`}>
                    {lvl.status}
                  </span>
                  <span className="font-black text-slate-800 text-xs">
                    {lvl.price.toFixed(decimals)}
                  </span>
                </div>
              </div>

              {/* Distance from current price */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <span>Distance:</span>
                  <strong className={isAbove ? 'text-rose-700' : 'text-emerald-700'}>
                    {isAbove ? `+${lvl.distancePoints.toFixed(decimals)} pts (${lvl.distancePercent}%)` : `-${lvl.distancePoints.toFixed(decimals)} pts (${lvl.distancePercent}%)`}
                  </strong>
                </span>

                <span className="text-slate-400 text-[9px]">
                  Category: {lvl.category.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Reaction Description */}
              <p className="text-[10px] text-slate-600 leading-tight border-t border-slate-200/60 pt-1 font-sans">
                {lvl.reactionDescription}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

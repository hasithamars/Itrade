import React from 'react';
import { AssetInfo, SignalType } from '../types/trading';
import { Activity } from 'lucide-react';

interface AssetOverview {
  asset: AssetInfo;
  currentPrice: number;
  change24h: number;
  rsi: number;
  trend: string;
  signalType: SignalType;
  confidence: number;
}

interface MultiAssetScannerProps {
  assetsData: AssetOverview[];
  selectedSymbol: string;
  onSelectAsset: (symbol: string) => void;
}

export const MultiAssetScanner: React.FC<MultiAssetScannerProps> = ({
  assetsData,
  selectedSymbol,
  onSelectAsset,
}) => {
  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide">MARKET RADAR</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
          8 Live Feeds
        </span>
      </div>

      {/* Asset Table / Cards */}
      <div className="space-y-1.5 overflow-x-auto">
        {assetsData.map((item) => {
          const isSelected = item.asset.symbol === selectedSymbol;
          const isUp = item.change24h >= 0;
          const isBuy = item.signalType.includes('BUY');
          const isSell = item.signalType.includes('SELL');

          return (
            <button
              key={item.asset.symbol}
              onClick={() => onSelectAsset(item.asset.symbol)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {/* Asset Name & Category */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-1.5 h-7 rounded-full shrink-0 ${
                    isSelected ? 'bg-emerald-600' : 'bg-transparent'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 tracking-tight">
                      {item.asset.symbol}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase px-1 py-0.2 bg-slate-200 rounded">
                      {item.asset.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {item.asset.displayName}
                  </span>
                </div>
              </div>

              {/* Price & 24h Change */}
              <div className="text-right font-mono shrink-0">
                <div className="text-xs font-bold text-slate-900">
                  {item.asset.currency === 'THB' ? '฿' : '$'}{item.currentPrice.toFixed(item.asset.decimals)}
                </div>
                <div
                  className={`text-[10px] font-bold flex items-center justify-end ${
                    isUp ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isUp ? '+' : ''}{item.change24h.toFixed(2)}%
                </div>
              </div>

              {/* Signal Badge */}
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isBuy
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isSell
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.signalType.replace('_', ' ')}
                </span>
                <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                  RSI {item.rsi}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

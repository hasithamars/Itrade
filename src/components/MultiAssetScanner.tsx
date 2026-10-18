import React, { useState, useMemo } from 'react';
import { AssetInfo, SignalType } from '../types/trading';
import { Activity, Search, Filter, RefreshCw } from 'lucide-react';

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
  onRefresh?: () => void;
}

export const MultiAssetScanner: React.FC<MultiAssetScannerProps> = ({
  assetsData,
  selectedSymbol,
  onSelectAsset,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssets = useMemo(() => {
    return assetsData.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        (selectedCategory === 'STOCKS' && item.asset.category === 'EQUITIES') ||
        item.asset.category === selectedCategory;

      const q = searchQuery.trim().toUpperCase();
      const matchesSearch =
        !q ||
        item.asset.symbol.toUpperCase().includes(q) ||
        item.asset.displayName.toUpperCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [assetsData, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide">GLOBAL MARKET RADAR</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            {filteredAssets.length} Assets Live
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Scanner Market Prices"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 text-[10px] font-semibold scrollbar-none">
        {[
          { id: 'ALL', label: 'All' },
          { id: 'COMMODITIES', label: 'Metals & Oil' },
          { id: 'FOREX', label: 'Forex' },
          { id: 'CRYPTO', label: 'Crypto' },
          { id: 'INDICES', label: 'Indices' },
          { id: 'STOCKS', label: 'Equities' },
          { id: 'SYNTHETICS', label: '⚡ Synthetics (Vol 100+)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Search inside Scanner */}
      <div className="relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter e.g. XAUUSD, EUR, BTC, SPX..."
          className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Asset Table / Cards */}
      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No market symbols matching "{searchQuery}"
          </div>
        ) : (
          filteredAssets.map((item) => {
            const isSelected = item.asset.symbol === selectedSymbol;
            const isUp = item.change24h >= 0;
            const isBuy = item.signalType.includes('BUY');
            const isSell = item.signalType.includes('SELL');

            return (
              <button
                key={item.asset.symbol}
                onClick={() => onSelectAsset(item.asset.symbol)}
                className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {/* Asset Name & Category */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-1 h-6 rounded-full shrink-0 ${
                      isSelected ? 'bg-emerald-600' : 'bg-transparent'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-slate-900 tracking-tight truncate">
                        {item.asset.symbol}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase px-1 py-0.2 bg-slate-200 rounded shrink-0">
                        {item.asset.category === 'COMMODITIES' ? 'METALS' : item.asset.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {item.asset.displayName}
                    </span>
                  </div>
                </div>

                {/* Price & 24h Change */}
                <div className="text-right font-mono shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {item.asset.currency === 'THB' ? '฿' : item.asset.currency === 'JPY' ? '¥' : item.asset.currency === 'EUR' ? '€' : '$'}{item.currentPrice.toFixed(item.asset.decimals)}
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
                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
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
          })
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { WorldMarketItem } from '../types/trading';
import { WORLD_MARKETS_DIRECTORY } from '../data/worldMarkets';
import {
  Globe,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface WorldMarketDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const WorldMarketDirectoryModal: React.FC<WorldMarketDirectoryModalProps> = ({
  isOpen,
  onClose,
  currentSymbol,
  onSelectSymbol,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeRegion, setActiveRegion] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSymbols = useMemo(() => {
    return WORLD_MARKETS_DIRECTORY.filter((item) => {
      // Category filter
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }
      // Region filter
      if (activeRegion !== 'ALL' && item.region !== activeRegion) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inSym = item.symbol.toLowerCase().includes(q);
        const inName = item.displayName.toLowerCase().includes(q);
        const inExch = item.exchange.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inCurr = item.currency.toLowerCase().includes(q);
        if (!inSym && !inName && !inExch && !inDesc && !inCurr) {
          return false;
        }
      }
      return true;
    });
  }, [activeCategory, activeRegion, searchQuery]);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All World Markets', count: WORLD_MARKETS_DIRECTORY.length },
    { id: 'COMMODITIES', label: '🪙 Metals & Commodities', count: WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'COMMODITIES').length },
    { id: 'FOREX', label: '💱 Global Forex', count: WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'FOREX').length },
    { id: 'INDICES', label: '📈 Stock Indices', count: WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'INDICES').length },
    { id: 'CRYPTO', label: '⚡ Cryptocurrencies', count: WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'CRYPTO').length },
    { id: 'EQUITIES', label: '🏢 Global Equities', count: WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'EQUITIES').length },
    { id: 'SYNTHETICS', label: '⚡ Deriv Synthetics (Vol 100+)', count: WORLD_MARKETS_DIRECTORY.filter((m) => m.category === 'SYNTHETICS').length },
  ];

  const regions = ['ALL', 'Global', 'Americas', 'Europe', 'Asia-Pacific'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  World Market Symbol Directory
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {WORLD_MARKETS_DIRECTORY.length}+ INSTRUMENTS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Every major market symbol globally: Commodities, Forex, Global Indices, Crypto &amp; Equities.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any ticker, name, currency, or exchange (e.g. XAUUSD, Gold, Euro, Nikkei, NVDA, Crude)..."
                className="w-full bg-white border border-slate-200 text-xs font-mono text-slate-900 pl-9 pr-9 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-500 mr-1 hidden lg:inline">Region:</span>
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setActiveRegion(reg)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeRegion === reg
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === cat.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Directory Content List / Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredSymbols.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No world instruments match "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by asset name or clearing the filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                  setActiveRegion('ALL');
                }}
                className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-100"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredSymbols.map((item) => {
                const isSelected = item.symbol === currentSymbol;
                return (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      onSelectSymbol(item.symbol);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Row: Symbol + Badge + Flag */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.flag || '🌐'}</span>
                          <span className="font-mono font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.symbol}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                            {item.exchange}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {item.currency === 'THB' ? '฿' : item.currency === 'JPY' ? '¥' : item.currency === 'EUR' ? '€' : item.currency === 'GBP' ? '£' : '$'}
                            {item.basePrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals, maximumFractionDigits: item.decimals })}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Name & Region */}
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span className="font-semibold text-slate-800 truncate">{item.displayName}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">{item.region}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400 text-[10px]">
                        TradingView: <strong className="text-slate-600">{item.tradingViewSymbol}</strong>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSymbol(item.symbol);
                          onClose();
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        <span>{isSelected ? 'Currently Loaded' : 'Load Symbol'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clicking any symbol automatically synchronizes TradingView, the Analysis Chart, and regenerates live signals.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-colors ml-auto"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};

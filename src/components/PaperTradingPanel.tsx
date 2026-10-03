import React, { useState } from 'react';
import { PaperTrade } from '../types/trading';
import { soundManager } from '../utils/sound';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  X,
  RotateCcw,
} from 'lucide-react';

interface PaperTradingPanelProps {
  balance: number;
  openTrades: PaperTrade[];
  closedTrades: PaperTrade[];
  currentPrice: number;
  symbol: string;
  onOpenTrade: (type: 'LONG' | 'SHORT', amountUsd: number) => void;
  onCloseTrade: (id: string) => void;
  onResetAccount: () => void;
  currency?: string;
}

export const PaperTradingPanel: React.FC<PaperTradingPanelProps> = ({
  balance,
  openTrades,
  closedTrades,
  currentPrice,
  symbol,
  onOpenTrade,
  onCloseTrade,
  onResetAccount,
  currency = 'THB',
}) => {
  const [selectedSize, setSelectedSize] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'HISTORY'>('POSITIONS');

  const totalOpenPnl = openTrades.reduce((acc, t) => acc + t.pnlUsd, 0);
  const winCount = closedTrades.filter((t) => t.pnlUsd > 0).length;
  const winRate = closedTrades.length > 0 ? ((winCount / closedTrades.length) * 100).toFixed(0) : '0';

  const handleOpen = (type: 'LONG' | 'SHORT') => {
    soundManager.playTradeExecutionSound();
    onOpenTrade(type, selectedSize);
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {/* Header: Portfolio Balance + Quick Stats */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              DEMO PAPER ACCOUNT
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-mono font-black text-slate-900">
                ${(balance + totalOpenPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  totalOpenPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {totalOpenPnl >= 0 ? '+' : ''}${totalOpenPnl.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Win Rate</span>
            <span className="font-bold text-sky-700">{winRate}% ({winCount}/{closedTrades.length})</span>
          </div>
          <button
            onClick={onResetAccount}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Reset $10,000 Demo Balance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Trade Execution Bar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-600 font-semibold">Order Size:</span>
          <div className="flex gap-1">
            {[500, 1000, 2500, 5000].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                  selectedSize === size
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                ${size}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOpen('LONG')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-98"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Long</span>
          </button>
          <button
            onClick={() => handleOpen('SHORT')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-98"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Market Short</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-2">
        <button
          onClick={() => setActiveTab('POSITIONS')}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'POSITIONS'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Positions ({openTrades.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'HISTORY'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Closed Log ({closedTrades.length})
        </button>
      </div>

      {/* Positions list */}
      <div className="flex-1 overflow-y-auto max-h-52 space-y-2 pr-1 font-mono text-xs">
        {activeTab === 'POSITIONS' ? (
          openTrades.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No open demo positions. Click "Market Long" or "Market Short" above!
            </div>
          ) : (
            openTrades.map((trade) => {
              const isProfit = trade.pnlUsd >= 0;
              return (
                <div
                  key={trade.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          trade.type === 'LONG'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {trade.type}
                      </span>
                      <span className="font-bold text-slate-900">{trade.symbol}</span>
                      <span className="text-slate-500 text-[11px]">${trade.amountUsd}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Entry: ${trade.entryPrice.toFixed(2)} → Mark: ${trade.currentPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`font-bold block ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isProfit ? '+' : ''}${trade.pnlUsd.toFixed(2)}
                      </span>
                      <span className={`text-[10px] ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                    <button
                      onClick={() => onCloseTrade(trade.id)}
                      className="p-1 rounded bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-600 transition-colors"
                      title="Market Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : closedTrades.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No closed trades yet.
          </div>
        ) : (
          closedTrades.map((trade) => {
            const isProfit = trade.pnlUsd >= 0;
            return (
              <div
                key={trade.id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
              >
                <div>
                  <span
                    className={`font-bold mr-1.5 ${
                      trade.type === 'LONG' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {trade.type}
                  </span>
                  <span className="text-slate-800">{trade.symbol}</span>
                  <span className="text-slate-400 ml-1.5">
                    ({trade.closeReason || 'MANUAL'})
                  </span>
                </div>
                <div className={`font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isProfit ? '+' : ''}${trade.pnlUsd.toFixed(2)} ({trade.pnlPercent.toFixed(1)}%)
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

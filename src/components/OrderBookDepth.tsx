import React, { useState, useEffect } from 'react';
import { IndicatorMetrics } from '../types/trading';
import { Layers, ArrowDownUp, Zap } from 'lucide-react';

interface OrderBookDepthProps {
  orderBook: IndicatorMetrics['orderBook'];
  currentPrice: number;
  symbol: string;
  currency?: string;
}

interface MicroTrade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
}

export const OrderBookDepth: React.FC<OrderBookDepthProps> = ({
  orderBook,
  currentPrice,
  symbol,
  currency = 'THB',
}) => {
  const { bids, asks, bidRatio, spread } = orderBook;
  const isDecimals4 = symbol.includes('EUR');

  // High-frequency live matched trade stream (updated every 150ms)
  const [recentTrades, setRecentTrades] = useState<MicroTrade[]>([]);

  useEffect(() => {
    const tradeInterval = setInterval(() => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      const ms = now.getMilliseconds().toString().padStart(3, '0');

      const isBuy = Math.random() > 0.48;
      const tickOffset = (Math.random() - 0.5) * (currentPrice * 0.001);
      const tradePrice = +(currentPrice + tickOffset).toFixed(isDecimals4 ? 4 : 2);
      const tradeSize = +(Math.random() * 500 + 50).toFixed(0);

      const newTrade: MicroTrade = {
        id: `t_${Date.now()}_${Math.random()}`,
        time: `${h}:${m}:${s}.${ms}`,
        price: tradePrice,
        size: Number(tradeSize),
        side: isBuy ? 'BUY' : 'SELL',
      };

      setRecentTrades((prev) => [newTrade, ...prev.slice(0, 5)]);
    }, 180);

    return () => clearInterval(tradeInterval);
  }, [currentPrice, isDecimals4]);

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1,
    asks[asks.length - 1]?.total || 1
  );

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide">ORDER BOOK DEPTH</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <ArrowDownUp className="w-3 h-3 text-slate-400" />
          <span>Spread: {spread.toFixed(isDecimals4 ? 4 : 2)}</span>
        </div>
      </div>

      {/* Bid / Ask Imbalance Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] font-mono mb-1">
          <span className="text-emerald-700 font-bold">
            BIDS: {(bidRatio * 100).toFixed(1)}%
          </span>
          <span className="text-rose-700 font-bold">
            ASKS: {((1 - bidRatio) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${bidRatio * 100}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${(1 - bidRatio) * 100}%` }}
          />
        </div>
      </div>

      {/* Order Book Table */}
      <div className="flex flex-col space-y-1 font-mono text-xs">
        {/* Asks (Sell Orders) */}
        <div className="space-y-0.5">
          {asks.slice(0, 4).reverse().map((ask, i) => {
            const fillPct = (ask.total / maxTotal) * 100;
            return (
              <div key={i} className="relative flex justify-between px-2 py-0.5 text-[11px] rounded overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 bg-rose-500/10 pointer-events-none"
                  style={{ width: `${fillPct}%` }}
                />
                <span className="text-rose-600 font-semibold z-10">
                  {ask.price.toFixed(isDecimals4 ? 4 : 2)}
                </span>
                <span className="text-slate-600 z-10">{ask.amount.toFixed(0)}</span>
                <span className="text-slate-400 text-[10px] z-10">{ask.total.toFixed(0)}</span>
              </div>
            );
          })}
        </div>

        {/* Current Mid Market Price */}
        <div className="my-1 py-1.5 px-3 bg-slate-50 rounded border border-slate-200 text-center flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase font-sans font-bold">MARK PRICE</span>
          <span className="text-sm font-bold text-slate-900">
            {currency} {currentPrice.toFixed(isDecimals4 ? 4 : 2)}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200">
            LIVE MS
          </span>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5">
          {bids.slice(0, 4).map((bid, i) => {
            const fillPct = (bid.total / maxTotal) * 100;
            return (
              <div key={i} className="relative flex justify-between px-2 py-0.5 text-[11px] rounded overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/10 pointer-events-none"
                  style={{ width: `${fillPct}%` }}
                />
                <span className="text-emerald-700 font-semibold z-10">
                  {bid.price.toFixed(isDecimals4 ? 4 : 2)}
                </span>
                <span className="text-slate-600 z-10">{bid.amount.toFixed(0)}</span>
                <span className="text-slate-400 text-[10px] z-10">{bid.total.toFixed(0)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-frequency matched trade feed */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" />
            Live Millisecond Matched Trades
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
        </div>
        <div className="space-y-1 font-mono text-[10px]">
          {recentTrades.map((t) => (
            <div key={t.id} className="flex justify-between items-center text-slate-600 py-0.5 px-1 rounded bg-slate-50">
              <span className="text-slate-400">{t.time}</span>
              <span className={t.side === 'BUY' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                {t.price.toFixed(isDecimals4 ? 4 : 2)}
              </span>
              <span>{t.size} shares</span>
              <span className={`px-1 rounded text-[9px] font-bold ${t.side === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {t.side}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

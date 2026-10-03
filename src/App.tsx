import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  AssetInfo,
  Candle,
  IndicatorMetrics,
  LiveSignal,
  PaperTrade,
  ScenarioForecast,
  Timeframe,
} from './types/trading';
import {
  computeIndicatorMetrics,
  generateHistoricCandles,
  generateSignalFromIndicators,
  SUPPORTED_ASSETS,
} from './utils/indicators';
import { soundManager } from './utils/sound';
import { TerminalNavbar } from './components/TerminalNavbar';
import { CandleChart } from './components/CandleChart';
import { TradingViewWidget } from './components/TradingViewWidget';
import { SignalCard } from './components/SignalCard';
import { ScenarioForecastPanel } from './components/ScenarioForecastPanel';
import { OrderBookDepth } from './components/OrderBookDepth';
import { PaperTradingPanel } from './components/PaperTradingPanel';
import { MultiAssetScanner } from './components/MultiAssetScanner';
import {
  Layers,
  Sparkles,
  Zap,
  BarChart2,
  Tv,
} from 'lucide-react';

export default function App() {
  // Theme state: defaults to 'light' per user request
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Active asset: defaults to SET:TRUE (True Corporation PCL, SET Thailand)
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo>(SUPPORTED_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [chartMode, setChartMode] = useState<'TRADINGVIEW' | 'AI_FORECAST' | 'SPLIT'>('TRADINGVIEW');

  // Candle data
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateHistoricCandles(SUPPORTED_ASSETS[0].basePrice, SUPPORTED_ASSETS[0].volatility, 85, '15m')
  );

  // Indicators & Live Signals
  const [metrics, setMetrics] = useState<IndicatorMetrics>(() => computeIndicatorMetrics(candles));
  const [signal, setSignal] = useState<LiveSignal | null>(null);
  const [forecast, setForecast] = useState<ScenarioForecast | null>(null);
  const [isScanningForecast, setIsScanningForecast] = useState<boolean>(false);

  // Demo Paper Trading
  const [balance, setBalance] = useState<number>(10000);
  const [openTrades, setOpenTrades] = useState<PaperTrade[]>([]);
  const [closedTrades, setClosedTrades] = useState<PaperTrade[]>([]);

  // Multi-asset scanner state cache
  const [assetsPrices, setAssetsPrices] = useState<Record<string, { price: number; change24h: number; rsi: number }>>(() => {
    const initial: Record<string, { price: number; change24h: number; rsi: number }> = {};
    SUPPORTED_ASSETS.forEach((a) => {
      initial[a.symbol] = {
        price: a.basePrice,
        change24h: a.symbol === 'SET:TRUE' ? 3.20 : +(Math.random() * 4 - 1.2).toFixed(2),
        rsi: Math.floor(48 + Math.random() * 18),
      };
    });
    return initial;
  });

  const lastSignalIdRef = useRef<string>('');

  // 1. Fetch real quote from server for accurate market baseline
  const fetchRealQuote = useCallback(async (sym: string) => {
    try {
      const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(sym)}`);
      if (res.ok) {
        const quote = await res.json();
        if (quote.price) {
          setAssetsPrices((prev) => ({
            ...prev,
            [sym]: {
              price: quote.price,
              change24h: quote.change24h || 1.8,
              rsi: prev[sym]?.rsi || 52,
            },
          }));
        }
      }
    } catch {}
  }, []);

  // Sync on asset switch
  useEffect(() => {
    fetchRealQuote(selectedAsset.symbol);
    const freshCandles = generateHistoricCandles(
      selectedAsset.basePrice,
      selectedAsset.volatility,
      85,
      timeframe
    );
    setCandles(freshCandles);
    const m = computeIndicatorMetrics(freshCandles);
    setMetrics(m);

    const sig = generateSignalFromIndicators(selectedAsset.symbol, timeframe, freshCandles, m);
    setSignal(sig);
  }, [selectedAsset, timeframe, fetchRealQuote]);

  // 2. Fetch AI World News & Forecast
  const fetchAiForecast = useCallback(async () => {
    if (candles.length === 0) return;
    setIsScanningForecast(true);
    const lastCandle = candles[candles.length - 1];

    try {
      const payload = {
        symbol: selectedAsset.symbol,
        currentPrice: lastCandle.close,
        timeframe,
        change24h: assetsPrices[selectedAsset.symbol]?.change24h || 3.2,
        rsi: metrics.rsi,
        macd: metrics.macd,
        ema: metrics.ema,
        bollinger: metrics.bollinger,
        supertrend: metrics.supertrend,
        recentPrices: candles.slice(-6).map((c) => c.close),
      };

      const res = await fetch('/api/gemini/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: ScenarioForecast = await res.json();
        setForecast(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI forecast:', err);
    } finally {
      setIsScanningForecast(false);
    }
  }, [candles, selectedAsset, timeframe, assetsPrices, metrics]);

  useEffect(() => {
    fetchAiForecast();
  }, [selectedAsset.symbol, timeframe]);

  // 3. High-Frequency Millisecond Tick Stream & Live Price Engine (updated every 80ms)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const last = { ...prevCandles[prevCandles.length - 1] };
        const price = last.close;

        // Realistic high-frequency microtick
        const tickMove = (Math.random() - 0.49) * (price * 0.0003 * selectedAsset.volatility);
        const newClose = +(price + tickMove).toFixed(selectedAsset.decimals);
        const newHigh = +(Math.max(last.high, newClose)).toFixed(selectedAsset.decimals);
        const newLow = +(Math.min(last.low, newClose)).toFixed(selectedAsset.decimals);
        const newVol = last.volume + Math.floor(Math.random() * 4 + 1);

        last.close = newClose;
        last.high = newHigh;
        last.low = newLow;
        last.volume = newVol;

        const updated = [...prevCandles.slice(0, -1), last];

        // Recompute indicators
        const newMetrics = computeIndicatorMetrics(updated);
        setMetrics(newMetrics);

        // Update live signal
        const newSignal = generateSignalFromIndicators(
          selectedAsset.symbol,
          timeframe,
          updated,
          newMetrics
        );

        if (newSignal && newSignal.id !== lastSignalIdRef.current) {
          if (newSignal.type.includes('BUY') || newSignal.type.includes('SELL')) {
            soundManager.playSignalAlert(newSignal.type);
          }
          lastSignalIdRef.current = newSignal.id;
        }
        setSignal(newSignal);

        // Real-time paper trade PnL & TP/SL evaluation
        setOpenTrades((prevTrades) => {
          if (prevTrades.length === 0) return prevTrades;
          const remaining: PaperTrade[] = [];

          prevTrades.forEach((trade) => {
            if (trade.symbol !== selectedAsset.symbol) {
              remaining.push(trade);
              return;
            }

            const isLong = trade.type === 'LONG';
            const priceDelta = isLong ? newClose - trade.entryPrice : trade.entryPrice - newClose;
            const pnlPercent = (priceDelta / trade.entryPrice) * 100;
            const pnlUsd = (trade.amountUsd * pnlPercent) / 100;

            const updatedTrade = {
              ...trade,
              currentPrice: newClose,
              pnlUsd: +pnlUsd.toFixed(2),
              pnlPercent: +pnlPercent.toFixed(2),
            };

            if ((isLong && newClose >= trade.tp1) || (!isLong && newClose <= trade.tp1)) {
              soundManager.playTakeProfitSound();
              setClosedTrades((closed) => [
                {
                  ...updatedTrade,
                  status: 'CLOSED',
                  closedAt: Date.now(),
                  closeReason: 'TP1',
                },
                ...closed,
              ]);
              setBalance((b) => b + updatedTrade.pnlUsd);
              return;
            }

            if ((isLong && newClose <= trade.sl) || (!isLong && newClose >= trade.sl)) {
              setClosedTrades((closed) => [
                {
                  ...updatedTrade,
                  status: 'CLOSED',
                  closedAt: Date.now(),
                  closeReason: 'SL',
                },
                ...closed,
              ]);
              setBalance((b) => b + updatedTrade.pnlUsd);
              return;
            }

            remaining.push(updatedTrade);
          });

          return remaining;
        });

        // Cache update
        setAssetsPrices((prev) => ({
          ...prev,
          [selectedAsset.symbol]: {
            price: newClose,
            change24h: prev[selectedAsset.symbol]?.change24h || 3.2,
            rsi: newMetrics.rsi,
          },
        }));

        return updated;
      });
    }, 90);

    return () => clearInterval(tickInterval);
  }, [selectedAsset, timeframe]);

  // Handle custom symbol search
  const handleSymbolSearch = (symbolQuery: string) => {
    const found = SUPPORTED_ASSETS.find(
      (a) => a.symbol.toUpperCase() === symbolQuery.toUpperCase() ||
             a.symbol.includes(symbolQuery.toUpperCase())
    );

    if (found) {
      setSelectedAsset(found);
    } else {
      // Dynamic new symbol addition
      const newCustomAsset: AssetInfo = {
        symbol: symbolQuery,
        displayName: symbolQuery,
        category: symbolQuery.includes(':') ? 'EQUITIES' : 'CRYPTO',
        basePrice: 12.90,
        decimals: 2,
        volatility: 1.0,
        currency: symbolQuery.startsWith('SET:') ? 'THB' : 'USD',
        exchange: symbolQuery.startsWith('SET:') ? 'SET (Thailand)' : 'Global Market',
      };
      setSelectedAsset(newCustomAsset);
    }
  };

  // Trade handlers
  const handleOpenTrade = (type: 'LONG' | 'SHORT', amountUsd: number = 1000) => {
    if (!signal) return;
    const currentPrice = candles[candles.length - 1]?.close || selectedAsset.basePrice;

    const newTrade: PaperTrade = {
      id: `trade_${Date.now()}`,
      symbol: selectedAsset.symbol,
      type,
      entryPrice: currentPrice,
      amountUsd,
      currentPrice,
      pnlUsd: 0,
      pnlPercent: 0,
      tp1: signal.takeProfit1,
      tp2: signal.takeProfit2,
      sl: signal.stopLoss,
      openedAt: Date.now(),
      status: 'OPEN',
    };

    setOpenTrades((prev) => [newTrade, ...prev]);
  };

  const handleCloseTrade = (id: string) => {
    const tradeToClose = openTrades.find((t) => t.id === id);
    if (!tradeToClose) return;

    setOpenTrades((prev) => prev.filter((t) => t.id !== id));
    setClosedTrades((prev) => [
      {
        ...tradeToClose,
        status: 'CLOSED',
        closedAt: Date.now(),
        closeReason: 'MANUAL',
      },
      ...prev,
    ]);
    setBalance((b) => b + tradeToClose.pnlUsd);
  };

  const handleResetAccount = () => {
    setBalance(10000);
    setOpenTrades([]);
    setClosedTrades([]);
  };

  const multiAssetData = useMemo(() => {
    return SUPPORTED_ASSETS.map((asset) => {
      const data = assetsPrices[asset.symbol] || {
        price: asset.basePrice,
        change24h: 3.2,
        rsi: 54,
      };
      const isUp = data.change24h >= 0;
      return {
        asset,
        currentPrice: data.price,
        change24h: data.change24h,
        rsi: data.rsi,
        trend: isUp ? 'UPTREND' : 'DOWNTREND',
        signalType: (data.rsi > 60 ? 'BUY' : data.rsi < 40 ? 'SELL' : 'NEUTRAL') as any,
        confidence: 86,
      };
    });
  }, [assetsPrices]);

  const currentPrice = candles[candles.length - 1]?.close || selectedAsset.basePrice;
  const isThaiStock = selectedAsset.symbol.startsWith('SET:') || selectedAsset.currency === 'THB';
  const currencySymbol = isThaiStock ? 'THB' : 'USD';

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#070a0f] text-slate-100'} flex flex-col font-sans transition-colors`}>
      {/* Top Navbar */}
      <TerminalNavbar
        onTriggerAiScan={fetchAiForecast}
        isScanning={isScanningForecast}
        currentSymbol={selectedAsset.symbol}
        onSymbolSearch={handleSymbolSearch}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* Main Terminal Grid */}
      <main className="flex-1 p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1920px] mx-auto w-full">
        {/* Left Column (3 cols): Multi-Asset Scanner & Order Book Depth */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <MultiAssetScanner
            assetsData={multiAssetData}
            selectedSymbol={selectedAsset.symbol}
            onSelectAsset={(sym) => {
              const found = SUPPORTED_ASSETS.find((a) => a.symbol === sym);
              if (found) setSelectedAsset(found);
            }}
          />

          <OrderBookDepth
            orderBook={metrics.orderBook}
            currentPrice={currentPrice}
            symbol={selectedAsset.symbol}
            currency={currencySymbol}
          />
        </div>

        {/* Center Column (6 cols): Primary Chart + Technical Metrics Bar */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Chart View Switcher: TradingView Live Embed vs AI Scenario Forecast Canvas */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChartMode('TRADINGVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'TRADINGVIEW'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>TradingView Live ({selectedAsset.symbol})</span>
              </button>

              <button
                onClick={() => setChartMode('AI_FORECAST')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'AI_FORECAST'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Scenario Cone ({timeframe})</span>
              </button>

              <button
                onClick={() => setChartMode('SPLIT')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'SPLIT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dual View</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>{selectedAsset.symbol}: {currentPrice.toFixed(2)} {currencySymbol}</span>
            </div>
          </div>

          {/* Active Chart Display */}
          <div className="w-full">
            {chartMode === 'TRADINGVIEW' ? (
              <div className="h-[480px] w-full">
                <TradingViewWidget
                  symbol={selectedAsset.symbol}
                  timeframe={timeframe}
                  theme={theme}
                />
              </div>
            ) : chartMode === 'AI_FORECAST' ? (
              <div className="h-[480px] w-full">
                <CandleChart
                  candles={candles}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  metrics={metrics}
                  signal={signal}
                  forecast={forecast}
                  symbol={selectedAsset.symbol}
                  theme={theme}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="h-[340px] w-full">
                  <TradingViewWidget
                    symbol={selectedAsset.symbol}
                    timeframe={timeframe}
                    theme={theme}
                  />
                </div>
                <div className="h-[340px] w-full">
                  <CandleChart
                    candles={candles}
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                    metrics={metrics}
                    signal={signal}
                    forecast={forecast}
                    symbol={selectedAsset.symbol}
                    theme={theme}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Real-time Indicator Gauge Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            {/* RSI */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                <span>RSI (14)</span>
                <span
                  className={`font-bold ${
                    metrics.rsi > 70
                      ? 'text-rose-700'
                      : metrics.rsi < 30
                      ? 'text-emerald-700'
                      : 'text-sky-700'
                  }`}
                >
                  {metrics.rsi}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    metrics.rsi > 70
                      ? 'bg-rose-500'
                      : metrics.rsi < 30
                      ? 'bg-emerald-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${metrics.rsi}%` }}
                />
              </div>
            </div>

            {/* MACD */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-600">
                <span>MACD Hist</span>
                <span
                  className={`font-bold ${
                    metrics.macd.hist >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {metrics.macd.hist > 0 ? '+' : ''}
                  {metrics.macd.hist.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Cross: <strong className="text-slate-800">{metrics.macd.cross.replace('_', ' ')}</strong>
              </div>
            </div>

            {/* Supertrend */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-600">
                <span>Supertrend</span>
                <span
                  className={`font-bold ${
                    metrics.supertrend.direction === 'BULLISH'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {metrics.supertrend.direction}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                Stop: ${metrics.supertrend.value.toFixed(2)}
              </div>
            </div>

            {/* Volatility ATR */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-600">
                <span>Volatility ATR</span>
                <span className="font-bold text-amber-700">${metrics.atr}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                BB Squeeze: <strong className={metrics.bollinger.squeeze ? 'text-amber-700' : 'text-slate-600'}>{metrics.bollinger.squeeze ? 'ACTIVE' : 'NO'}</strong>
              </div>
            </div>
          </div>

          {/* AI Scenario Projections & Real-Time World News Panel */}
          <ScenarioForecastPanel
            forecast={forecast}
            loading={isScanningForecast}
            onRefresh={fetchAiForecast}
            currentPrice={currentPrice}
            symbol={selectedAsset.symbol}
            currency={currencySymbol}
          />
        </div>

        {/* Right Column (3 cols): Live Signal Card + Paper Trading Demo */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {signal && (
            <SignalCard
              signal={signal}
              metrics={metrics}
              currentPrice={currentPrice}
              timeframe={timeframe}
              onExecuteTrade={handleOpenTrade}
              currency={currencySymbol}
            />
          )}

          <PaperTradingPanel
            balance={balance}
            openTrades={openTrades}
            closedTrades={closedTrades}
            currentPrice={currentPrice}
            symbol={selectedAsset.symbol}
            onOpenTrade={handleOpenTrade}
            onCloseTrade={handleCloseTrade}
            onResetAccount={handleResetAccount}
            currency={currencySymbol}
          />
        </div>
      </main>
    </div>
  );
}

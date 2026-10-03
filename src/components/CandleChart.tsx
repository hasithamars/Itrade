import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Candle, IndicatorMetrics, LiveSignal, ScenarioForecast, Timeframe } from '../types/trading';
import { calculateBollingerBands, calculateEMA, calculateSupertrend } from '../utils/indicators';
import { RotateCcw, Sparkles } from 'lucide-react';

interface CandleChartProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  metrics: IndicatorMetrics;
  signal: LiveSignal | null;
  forecast: ScenarioForecast | null;
  symbol: string;
  theme?: 'light' | 'dark';
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  metrics,
  signal,
  forecast,
  symbol,
  theme = 'light',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visible window / zoom state
  const [visibleCount, setVisibleCount] = useState<number>(55);
  const [offsetRight, setOffsetRight] = useState<number>(0);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; candle: Candle | null } | null>(null);

  // Indicator visibility toggles
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(true);
  const [showSupertrend, setShowSupertrend] = useState<boolean>(true);
  const [showProjections, setShowProjections] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showLevels, setShowLevels] = useState<boolean>(true);

  // Dragging / panning state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const initialOffsetRef = useRef<number>(0);

  // Precomputed indicator series for full candle dataset
  const closes = useMemo(() => candles.map((c) => c.close), [candles]);
  const ema20 = useMemo(() => calculateEMA(closes, 20), [closes]);
  const ema50 = useMemo(() => calculateEMA(closes, 50), [closes]);
  const ema200 = useMemo(() => calculateEMA(closes, 200), [closes]);
  const bb = useMemo(() => calculateBollingerBands(closes, 20, 2), [closes]);
  const st = useMemo(() => calculateSupertrend(candles, 10, 3), [candles]);

  const isLight = theme === 'light';

  // Redraw canvas on data or layout change
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = isLight ? '#ffffff' : '#0c1017';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    const rightMargin = 75;
    const bottomMargin = 28;
    const topMargin = 38;
    const chartHeight = height - bottomMargin - topMargin;
    const chartWidth = width - rightMargin;

    // Slice visible candles + extra future space for projections
    const totalCount = candles.length;
    const startIndex = Math.max(0, totalCount - visibleCount - offsetRight);
    const endIndex = Math.min(totalCount, totalCount - offsetRight);
    const visibleCandles = candles.slice(startIndex, endIndex);

    if (visibleCandles.length === 0) return;

    const futureCandleSlots = showProjections && forecast ? 10 : 3;
    const slotCount = visibleCandles.length + futureCandleSlots;
    const candleWidth = Math.max(3, (chartWidth / slotCount) * 0.7);
    const stepX = chartWidth / slotCount;

    // Determine min/max price for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVol) maxVol = c.volume;

      const idx = startIndex + i;
      if (showEMA) {
        if (ema20[idx]) { minPrice = Math.min(minPrice, ema20[idx]); maxPrice = Math.max(maxPrice, ema20[idx]); }
        if (ema50[idx]) { minPrice = Math.min(minPrice, ema50[idx]); maxPrice = Math.max(maxPrice, ema50[idx]); }
      }
      if (showBB && bb.upper[idx] && bb.lower[idx]) {
        minPrice = Math.min(minPrice, bb.lower[idx]);
        maxPrice = Math.max(maxPrice, bb.upper[idx]);
      }
    }

    if (showProjections && forecast) {
      if (forecast.scenarios.bullish.targetPrice) maxPrice = Math.max(maxPrice, forecast.scenarios.bullish.targetPrice * 1.002);
      if (forecast.scenarios.bearish.targetPrice) minPrice = Math.min(minPrice, forecast.scenarios.bearish.targetPrice * 0.998);
      forecast.projectedCandles?.forEach((p) => {
        if (p.upperBound) maxPrice = Math.max(maxPrice, p.upperBound);
        if (p.lowerBound) minPrice = Math.min(minPrice, p.lowerBound);
      });
    }

    if (signal) {
      maxPrice = Math.max(maxPrice, signal.takeProfit2 * 1.002);
      minPrice = Math.min(minPrice, signal.stopLoss * 0.998);
    }

    const pricePadding = (maxPrice - minPrice) * 0.1 || 0.1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    const getY = (price: number) => {
      return topMargin + (1 - (price - minPrice) / priceRange) * chartHeight;
    };

    const getX = (visibleIdx: number) => {
      return visibleIdx * stepX + stepX / 2;
    };

    // 1. Draw subtle background grid lines
    ctx.strokeStyle = isLight ? '#f1f5f9' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const y = topMargin + (i / gridSteps) * chartHeight;
      const price = maxPrice - (i / gridSteps) * priceRange;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price label on right axis
      ctx.setLineDash([]);
      ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(symbol.includes('EUR') ? 4 : 2), chartWidth + 6, y + 4);
      ctx.setLineDash([4, 4]);
    }
    ctx.setLineDash([]);

    // 2. Draw Bollinger Bands shaded channel & lines
    if (showBB) {
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const idx = startIndex + i;
        const x = getX(i);
        const yUp = getY(bb.upper[idx] || visibleCandles[i].close);
        if (i === 0) ctx.moveTo(x, yUp);
        else ctx.lineTo(x, yUp);
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const idx = startIndex + i;
        const x = getX(i);
        const yDown = getY(bb.lower[idx] || visibleCandles[i].close);
        ctx.lineTo(x, yDown);
      }
      ctx.closePath();
      ctx.fillStyle = isLight ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)';
      ctx.fill();

      ctx.strokeStyle = isLight ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Draw EMA Lines
    const drawEmaLine = (emaSeries: number[], color: string, widthLine: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = widthLine;
      let started = false;

      for (let i = 0; i < visibleCandles.length; i++) {
        const idx = startIndex + i;
        const val = emaSeries[idx];
        if (val) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    };

    if (showEMA) {
      drawEmaLine(ema20, '#0284c7', 1.5); // Sky Blue EMA 20
      drawEmaLine(ema50, '#d97706', 1.5); // Amber EMA 50
      drawEmaLine(ema200, '#9333ea', 1.2); // Purple EMA 200
    }

    // 4. Draw Supertrend dots
    if (showSupertrend) {
      for (let i = 0; i < visibleCandles.length; i++) {
        const idx = startIndex + i;
        const val = st.values[idx];
        const dir = st.directions[idx];
        if (val) {
          const x = getX(i);
          const y = getY(val);
          ctx.fillStyle = dir === 'BULLISH' ? '#10b981' : '#ef4444';
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 5. Draw Volume Histogram bars
    if (showVolume) {
      const volHeight = chartHeight * 0.16;
      const volBottom = topMargin + chartHeight;

      for (let i = 0; i < visibleCandles.length; i++) {
        const c = visibleCandles[i];
        const isGreen = c.close >= c.open;
        const h = (c.volume / (maxVol || 1)) * volHeight;
        const x = getX(i) - candleWidth / 2;
        const y = volBottom - h;

        ctx.fillStyle = isGreen
          ? isLight ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)'
          : isLight ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(x, y, candleWidth, h);
      }
    }

    // 6. Draw Candlesticks
    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const isGreen = c.close >= c.open;
      const color = isGreen ? '#10b981' : '#ef4444';
      const wickColor = isGreen ? '#059669' : '#dc2626';

      const x = getX(i);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);
      const yOpen = getY(c.open);
      const yClose = getY(c.close);

      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    }

    const lastCandleIdx = visibleCandles.length - 1;
    const lastX = getX(lastCandleIdx);
    const lastClose = visibleCandles[lastCandleIdx].close;
    const lastY = getY(lastClose);

    // Current Price Line
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartWidth, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Price Tag on Axis
    ctx.fillStyle = '#10b981';
    ctx.fillRect(chartWidth + 1, lastY - 10, rightMargin - 4, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lastClose.toFixed(symbol.includes('EUR') ? 4 : 2), chartWidth + (rightMargin - 4) / 2, lastY + 4);

    // 7. DRAW AI SCENARIO PROJECTION CONE
    if (showProjections && forecast && forecast.projectedCandles && forecast.projectedCandles.length > 0) {
      const proj = forecast.projectedCandles;
      const projXCoords: number[] = [];
      const projUpperY: number[] = [];
      const projLowerY: number[] = [];
      const projCloseY: number[] = [];

      projXCoords.push(lastX);
      projUpperY.push(lastY);
      projLowerY.push(lastY);
      projCloseY.push(lastY);

      proj.forEach((p, idx) => {
        const px = getX(lastCandleIdx + idx + 1);
        projXCoords.push(px);
        projUpperY.push(getY(p.upperBound));
        projLowerY.push(getY(p.lowerBound));
        projCloseY.push(getY(p.projectedClose));
      });

      // Shaded Forecast Cone
      ctx.beginPath();
      ctx.moveTo(projXCoords[0], projUpperY[0]);
      for (let i = 1; i < projXCoords.length; i++) {
        ctx.lineTo(projXCoords[i], projUpperY[i]);
      }
      for (let i = projXCoords.length - 1; i >= 0; i--) {
        ctx.lineTo(projXCoords[i], projLowerY[i]);
      }
      ctx.closePath();

      const isBullBias = forecast.bias.includes('BUY');
      const gradient = ctx.createLinearGradient(lastX, 0, projXCoords[projXCoords.length - 1], 0);
      if (isBullBias) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.30)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
      } else {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.30)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      }
      ctx.fillStyle = gradient;
      ctx.fill();

      // Cone upper & lower dashed boundaries
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isBullBias ? '#059669' : '#dc2626';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      for (let i = 0; i < projXCoords.length; i++) {
        if (i === 0) ctx.moveTo(projXCoords[i], projUpperY[i]);
        else ctx.lineTo(projXCoords[i], projUpperY[i]);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < projXCoords.length; i++) {
        if (i === 0) ctx.moveTo(projXCoords[i], projLowerY[i]);
        else ctx.lineTo(projXCoords[i], projLowerY[i]);
      }
      ctx.stroke();

      // Main Trajectory Line
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = isBullBias ? '#0284c7' : '#e11d48';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < projXCoords.length; i++) {
        if (i === 0) ctx.moveTo(projXCoords[i], projCloseY[i]);
        else ctx.lineTo(projXCoords[i], projCloseY[i]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Nodes on projected trajectory
      for (let i = 1; i < projXCoords.length; i++) {
        const px = projXCoords[i];
        const py = projCloseY[i];

        ctx.fillStyle = isBullBias ? '#0284c7' : '#e11d48';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${i}`, px, topMargin + chartHeight - 6);
      }
    }

    // 8. Draw Signal Overlay Levels (TP1, TP2, SL)
    if (showLevels && signal) {
      const drawLevelLine = (price: number, label: string, color: string, dash: number[] = [4, 4]) => {
        const y = getY(price);
        ctx.setLineDash(dash);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = color;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${label}: $${price.toFixed(symbol.includes('EUR') ? 4 : 2)}`, 8, y - 4);
      };

      drawLevelLine(signal.takeProfit1, 'TP1', '#10b981', [6, 3]);
      drawLevelLine(signal.takeProfit2, 'TP2', '#059669', [4, 4]);
      drawLevelLine(signal.stopLoss, 'STOP LOSS', '#ef4444', [3, 3]);
    }

    // 9. Crosshair
    if (crosshair) {
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = isLight ? 'rgba(71, 85, 105, 0.4)' : 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(crosshair.x, topMargin);
      ctx.lineTo(crosshair.x, topMargin + chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(chartWidth, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const chPrice = maxPrice - ((crosshair.y - topMargin) / chartHeight) * priceRange;
      ctx.fillStyle = isLight ? '#1e293b' : '#334155';
      ctx.fillRect(chartWidth + 1, crosshair.y - 10, rightMargin - 4, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(chPrice.toFixed(symbol.includes('EUR') ? 4 : 2), chartWidth + (rightMargin - 4) / 2, crosshair.y + 4);

      if (crosshair.candle) {
        const timeStr = new Date(crosshair.candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        ctx.fillStyle = isLight ? '#1e293b' : '#334155';
        ctx.fillRect(crosshair.x - 38, topMargin + chartHeight + 4, 76, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, crosshair.x, topMargin + chartHeight + 16);
      }
    }
  }, [
    candles,
    visibleCount,
    offsetRight,
    crosshair,
    showEMA,
    showBB,
    showSupertrend,
    showProjections,
    showVolume,
    showLevels,
    ema20,
    ema50,
    ema200,
    bb,
    st,
    signal,
    forecast,
    symbol,
    isLight,
  ]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    initialOffsetRef.current = offsetRight;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      const candleStep = rect.width / visibleCount;
      const offsetShift = Math.round(deltaX / candleStep);
      const newOffset = Math.max(0, Math.min(candles.length - visibleCount, initialOffsetRef.current + offsetShift));
      setOffsetRight(newOffset);
    }

    const rightMargin = 75;
    const chartWidth = rect.width - rightMargin;
    const totalCount = candles.length;
    const startIndex = Math.max(0, totalCount - visibleCount - offsetRight);
    const slotCount = visibleCount + (showProjections && forecast ? 10 : 3);
    const stepX = chartWidth / slotCount;
    const hoveredIdx = Math.floor(x / stepX);

    const candle = candles[startIndex + hoveredIdx] || null;
    setCrosshair({ x, y, candle });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setCrosshair(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setVisibleCount((prev) => Math.max(25, prev - 5));
    } else {
      setVisibleCount((prev) => Math.min(Math.min(140, candles.length), prev + 5));
    }
  };

  const currentCandle = crosshair?.candle || candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const changePct = currentCandle && prevCandle
    ? (((currentCandle.close - prevCandle.close) / prevCandle.close) * 100).toFixed(2)
    : '0.00';
  const isUp = Number(changePct) >= 0;

  return (
    <div className="relative flex flex-col w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50/90 border-b border-slate-200 gap-2 backdrop-blur-md z-10">
        {/* Timeframes */}
        <div className="flex items-center gap-1">
          {(['1m', '5m', '15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all font-mono ${
                timeframe === tf
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* OHLC Readout */}
        {currentCandle && (
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500">
              O: <strong className="text-slate-800">${currentCandle.open.toFixed(2)}</strong>
            </span>
            <span className="text-slate-500">
              H: <strong className="text-emerald-600">${currentCandle.high.toFixed(2)}</strong>
            </span>
            <span className="text-slate-500">
              L: <strong className="text-rose-600">${currentCandle.low.toFixed(2)}</strong>
            </span>
            <span className="text-slate-500">
              C: <strong className={isUp ? 'text-emerald-600' : 'text-rose-600'}>${currentCandle.close.toFixed(2)}</strong>
            </span>
            <span className={`px-1.5 py-0.5 rounded font-bold ${isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {isUp ? '+' : ''}{changePct}%
            </span>
          </div>
        )}

        {/* Indicator Toggles */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setShowProjections(!showProjections)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
              showProjections
                ? 'bg-sky-100 text-sky-700 border border-sky-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>AI Cone</span>
          </button>

          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              showEMA ? 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            EMA
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              showBB ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            BB
          </button>

          <button
            onClick={() => setShowSupertrend(!showSupertrend)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              showSupertrend ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            Supertrend
          </button>

          <button
            onClick={() => {
              setVisibleCount(55);
              setOffsetRight(0);
            }}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-[380px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />

        {/* Legend overlays */}
        <div className="absolute top-2 left-3 flex flex-wrap items-center gap-3 text-[11px] font-mono pointer-events-none bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-xs backdrop-blur-sm">
          {showEMA && (
            <>
              <span className="text-sky-700">EMA(20): {metrics.ema.ema21}</span>
              <span className="text-amber-700">EMA(50): {metrics.ema.ema50}</span>
              <span className="text-purple-700">EMA(200): {metrics.ema.ema200}</span>
            </>
          )}
          {showBB && (
            <span className="text-blue-700">
              BB: [{metrics.bollinger.lower} - {metrics.bollinger.upper}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

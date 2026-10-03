import { Candle, IndicatorMetrics, LiveSignal, SignalType, Timeframe } from '../types/trading';

// Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(data.length);
  
  if (data.length === 0) return [];
  
  // First EMA value is SMA of initial elements
  let sum = 0;
  const initialPeriod = Math.min(period, data.length);
  for (let i = 0; i < initialPeriod; i++) {
    sum += data[i];
  }
  let currentEma = sum / initialPeriod;
  for (let i = 0; i < initialPeriod; i++) {
    emaArray[i] = currentEma;
  }

  for (let i = initialPeriod; i < data.length; i++) {
    currentEma = data[i] * k + currentEma * (1 - k);
    emaArray[i] = currentEma;
  }
  return emaArray;
}

// Relative Strength Index (RSI) with Wilder's Smoothing
export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) return new Array(closes.length).fill(50);

  const rsi: number[] = new Array(closes.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = 100 - (100 / (1 + rs));

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = 100 - (100 / (1 + rs));
  }

  return rsi;
}

// Moving Average Convergence Divergence (MACD)
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((m, i) => m - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

// Bollinger Bands (20, 2)
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  multiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[] } {
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      middle.push(closes[i]);
      upper.push(closes[i]);
      lower.push(closes[i]);
      bandwidth.push(0);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, v) => acc + v, 0) / period;
    const variance = slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const up = mean + multiplier * stdDev;
    const dn = mean - multiplier * stdDev;

    middle.push(mean);
    upper.push(up);
    lower.push(dn);
    bandwidth.push(mean > 0 ? ((up - dn) / mean) * 100 : 0);
  }

  return { upper, middle, lower, bandwidth };
}

// Average True Range (ATR)
export function calculateATR(candles: Candle[], period: number = 14): number[] {
  if (candles.length === 0) return [];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prevClose = candles[i - 1].close;
    const hl = c.high - c.low;
    const hc = Math.abs(c.high - prevClose);
    const lc = Math.abs(c.low - prevClose);
    tr.push(Math.max(hl, hc, lc));
  }

  return calculateEMA(tr, period);
}

// Supertrend Indicator (10, 3)
export function calculateSupertrend(
  candles: Candle[],
  period: number = 10,
  multiplier: number = 3
): { values: number[]; directions: Array<'BULLISH' | 'BEARISH'> } {
  const atr = calculateATR(candles, period);
  const values: number[] = new Array(candles.length);
  const directions: Array<'BULLISH' | 'BEARISH'> = new Array(candles.length);

  let prevUpper = 0;
  let prevLower = 0;
  let direction: 'BULLISH' | 'BEARISH' = 'BULLISH';

  for (let i = 0; i < candles.length; i++) {
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const currentAtr = atr[i] || candles[i].close * 0.01;

    let basicUpper = hl2 + multiplier * currentAtr;
    let basicLower = hl2 - multiplier * currentAtr;

    if (i === 0) {
      prevUpper = basicUpper;
      prevLower = basicLower;
      values[i] = basicLower;
      directions[i] = 'BULLISH';
      continue;
    }

    const prevClose = candles[i - 1].close;

    // Final Upper Band
    const finalUpper = basicUpper < prevUpper || prevClose > prevUpper ? basicUpper : prevUpper;
    // Final Lower Band
    const finalLower = basicLower > prevLower || prevClose < prevLower ? basicLower : prevLower;

    if (direction === 'BULLISH') {
      if (candles[i].close < finalLower) {
        direction = 'BEARISH';
        values[i] = finalUpper;
      } else {
        values[i] = finalLower;
      }
    } else {
      if (candles[i].close > finalUpper) {
        direction = 'BULLISH';
        values[i] = finalLower;
      } else {
        values[i] = finalUpper;
      }
    }

    prevUpper = finalUpper;
    prevLower = finalLower;
    directions[i] = direction;
  }

  return { values, directions };
}

// Full Indicator Metrics computation from current candle series
export function computeIndicatorMetrics(candles: Candle[]): IndicatorMetrics {
  const closes = candles.map((c) => c.close);
  const lastIdx = candles.length - 1;
  const currentPrice = closes[lastIdx] || 100;

  // RSI
  const rsis = calculateRSI(closes, 14);
  const currentRsi = rsis[lastIdx] || 50;

  // Divergence check (last 10 candles)
  let rsiDivergence: 'BULLISH' | 'BEARISH' | 'NONE' = 'NONE';
  if (candles.length > 20) {
    const priceLowest = Math.min(...closes.slice(-10));
    const rsiLowest = Math.min(...rsis.slice(-10));
    const prevPriceLowest = Math.min(...closes.slice(-20, -10));
    const prevRsiLowest = Math.min(...rsis.slice(-20, -10));

    if (priceLowest < prevPriceLowest && rsiLowest > prevRsiLowest && currentRsi < 45) {
      rsiDivergence = 'BULLISH';
    } else if (
      Math.max(...closes.slice(-10)) > Math.max(...closes.slice(-20, -10)) &&
      Math.max(...rsis.slice(-10)) < Math.max(...rsis.slice(-20, -10)) &&
      currentRsi > 55
    ) {
      rsiDivergence = 'BEARISH';
    }
  }

  // MACD
  const { macdLine, signalLine, histogram } = calculateMACD(closes, 12, 26, 9);
  const curMacd = macdLine[lastIdx] || 0;
  const curSignal = signalLine[lastIdx] || 0;
  const curHist = histogram[lastIdx] || 0;
  const prevHist = histogram[lastIdx - 1] || 0;

  let macdCross: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NONE' = 'NONE';
  if (prevHist <= 0 && curHist > 0) macdCross = 'BULLISH_CROSS';
  else if (prevHist >= 0 && curHist < 0) macdCross = 'BEARISH_CROSS';

  // EMAs
  const ema9Arr = calculateEMA(closes, 9);
  const ema21Arr = calculateEMA(closes, 21);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, 200);

  const e9 = ema9Arr[lastIdx] || currentPrice;
  const e21 = ema21Arr[lastIdx] || currentPrice;
  const e50 = ema50Arr[lastIdx] || currentPrice;
  const e200 = ema200Arr[lastIdx] || currentPrice;

  let trend: 'STRONG_UP' | 'UP' | 'SIDEWAYS' | 'DOWN' | 'STRONG_DOWN' = 'SIDEWAYS';
  if (currentPrice > e9 && e9 > e21 && e21 > e50) {
    trend = e50 > e200 ? 'STRONG_UP' : 'UP';
  } else if (currentPrice < e9 && e9 < e21 && e21 < e50) {
    trend = e50 < e200 ? 'STRONG_DOWN' : 'DOWN';
  }

  // Bollinger Bands
  const bb = calculateBollingerBands(closes, 20, 2);
  const bbUp = bb.upper[lastIdx] || currentPrice * 1.02;
  const bbMid = bb.middle[lastIdx] || currentPrice;
  const bbLow = bb.lower[lastIdx] || currentPrice * 0.98;
  const bw = bb.bandwidth[lastIdx] || 2;
  const percentB = bbUp > bbLow ? (currentPrice - bbLow) / (bbUp - bbLow) : 0.5;
  const isSqueeze = bw < 1.5;

  // Supertrend
  const st = calculateSupertrend(candles, 10, 3);
  const curStDir = st.directions[lastIdx] || 'BULLISH';
  const prevStDir = st.directions[lastIdx - 1] || curStDir;
  const curStVal = st.values[lastIdx] || currentPrice * 0.98;

  // ATR
  const atrs = calculateATR(candles, 14);
  const curAtr = atrs[lastIdx] || currentPrice * 0.01;

  // Simulated live Order Book Depth
  const tickStep = currentPrice > 1000 ? 5 : currentPrice > 50 ? 0.05 : 0.005;
  const bids: Array<{ price: number; amount: number; total: number }> = [];
  const asks: Array<{ price: number; amount: number; total: number }> = [];

  let cumBid = 0;
  let cumAsk = 0;
  const isUp = trend.includes('UP') || curHist > 0;
  const baseBidBias = isUp ? 0.58 : 0.44;

  for (let i = 1; i <= 8; i++) {
    const bPrice = +(currentPrice - i * tickStep).toFixed(2);
    const bAmount = +(Math.random() * 2.5 + (isUp ? 1.2 : 0.5)).toFixed(3);
    cumBid += bAmount;
    bids.push({ price: bPrice, amount: bAmount, total: +cumBid.toFixed(3) });

    const aPrice = +(currentPrice + i * tickStep).toFixed(2);
    const aAmount = +(Math.random() * 2.5 + (!isUp ? 1.2 : 0.5)).toFixed(3);
    cumAsk += aAmount;
    asks.push({ price: aPrice, amount: aAmount, total: +cumAsk.toFixed(3) });
  }

  const bidRatio = +(cumBid / (cumBid + cumAsk)).toFixed(2);
  const spread = +(asks[0].price - bids[0].price).toFixed(2);

  return {
    rsi: +currentRsi.toFixed(1),
    rsiDivergence,
    macd: {
      macd: +curMacd.toFixed(2),
      signal: +curSignal.toFixed(2),
      hist: +curHist.toFixed(2),
      cross: macdCross,
    },
    ema: {
      ema9: +e9.toFixed(2),
      ema21: +e21.toFixed(2),
      ema50: +e50.toFixed(2),
      ema200: +e200.toFixed(2),
      trend,
    },
    bollinger: {
      upper: +bbUp.toFixed(2),
      middle: +bbMid.toFixed(2),
      lower: +bbLow.toFixed(2),
      bandwidth: +bw.toFixed(2),
      percentB: +percentB.toFixed(2),
      squeeze: isSqueeze,
    },
    supertrend: {
      value: +curStVal.toFixed(2),
      direction: curStDir,
      justFlipped: curStDir !== prevStDir,
    },
    atr: +curAtr.toFixed(2),
    orderBook: {
      bids,
      asks,
      bidRatio,
      spread,
    },
  };
}

// Generate comprehensive live signal from indicators
export function generateSignalFromIndicators(
  symbol: string,
  timeframe: Timeframe,
  candles: Candle[],
  metrics: IndicatorMetrics
): LiveSignal {
  const currentPrice = candles[candles.length - 1].close;
  const { rsi, rsiDivergence, macd, ema, bollinger, supertrend, atr, orderBook } = metrics;

  let bullScore = 0;
  let bearScore = 0;

  // 1. Trend alignment
  const trendPassed = ema.trend === 'STRONG_UP' || ema.trend === 'UP';
  if (trendPassed) bullScore += 25;
  else if (ema.trend.includes('DOWN')) bearScore += 25;

  // 2. Momentum (RSI)
  const rsiBull = rsi > 45 && rsi < 70;
  const rsiBear = rsi < 55 && rsi > 30;
  if (rsiBull) bullScore += 20;
  if (rsiBear) bearScore += 20;
  if (rsiDivergence === 'BULLISH') bullScore += 15;
  if (rsiDivergence === 'BEARISH') bearScore += 15;

  // 3. MACD
  const macdBull = macd.hist > 0;
  if (macdBull) bullScore += 20;
  else bearScore += 20;
  if (macd.cross === 'BULLISH_CROSS') bullScore += 15;
  if (macd.cross === 'BEARISH_CROSS') bearScore += 15;

  // 4. Supertrend
  const stBull = supertrend.direction === 'BULLISH';
  if (stBull) bullScore += 15;
  else bearScore += 15;

  // 5. Order Flow (Orderbook)
  const orderBookBull = orderBook.bidRatio > 0.52;
  if (orderBookBull) bullScore += 10;
  else bearScore += 10;

  let type: SignalType = 'NEUTRAL';
  let confidence = 50;

  if (bullScore >= 75) {
    type = 'STRONG_BUY';
    confidence = Math.min(96, Math.floor(bullScore * 0.95 + 15));
  } else if (bullScore > bearScore + 15) {
    type = 'BUY';
    confidence = Math.min(88, Math.floor(bullScore * 0.9));
  } else if (bearScore >= 75) {
    type = 'STRONG_SELL';
    confidence = Math.min(96, Math.floor(bearScore * 0.95 + 15));
  } else if (bearScore > bullScore + 15) {
    type = 'SELL';
    confidence = Math.min(88, Math.floor(bearScore * 0.9));
  } else {
    type = 'NEUTRAL';
    confidence = 52;
  }

  const isBuy = type.includes('BUY');
  const bufferAtr = atr * 1.5;
  const entrySpread = atr * 0.2;

  const entryZone: [number, number] = [
    +(currentPrice - entrySpread).toFixed(2),
    +(currentPrice + entrySpread).toFixed(2),
  ];

  const tp1 = isBuy
    ? +(currentPrice + bufferAtr * 1.6).toFixed(2)
    : +(currentPrice - bufferAtr * 1.6).toFixed(2);
  const tp2 = isBuy
    ? +(currentPrice + bufferAtr * 3.0).toFixed(2)
    : +(currentPrice - bufferAtr * 3.0).toFixed(2);
  const sl = isBuy
    ? +(currentPrice - bufferAtr * 1.2).toFixed(2)
    : +(currentPrice + bufferAtr * 1.2).toFixed(2);

  const checklist = [
    {
      label: 'Multi-EMA Structural Trend',
      passed: isBuy ? trendPassed : ema.trend.includes('DOWN'),
      note: `EMA 21/50 indicates ${ema.trend.replace('_', ' ')} alignment`,
    },
    {
      label: 'RSI Momentum & Divergence',
      passed: isBuy ? (rsiBull || rsiDivergence === 'BULLISH') : (rsiBear || rsiDivergence === 'BEARISH'),
      note: `RSI ${rsi} with ${rsiDivergence !== 'NONE' ? rsiDivergence + ' divergence' : 'steady gradient'}`,
    },
    {
      label: 'MACD Zero-Line & Histogram',
      passed: isBuy ? macdBull : !macdBull,
      note: `Histogram value ${macd.hist > 0 ? '+' : ''}${macd.hist} (${macd.cross})`,
    },
    {
      label: 'Supertrend Trailing Support/Resistance',
      passed: isBuy ? stBull : !stBull,
      note: `Level active at $${supertrend.value}`,
    },
    {
      label: 'Order Book Depth Imbalance',
      passed: isBuy ? orderBookBull : !orderBookBull,
      note: `${(orderBook.bidRatio * 100).toFixed(0)}% Bids vs ${((1 - orderBook.bidRatio) * 100).toFixed(0)}% Asks`,
    },
  ];

  const rationale = isBuy
    ? `Strong confluence of momentum across multi-timeframe moving averages and Supertrend. Order flow shows deep bid support absorption at $${entryZone[0]}.`
    : `Distribution volume confirms breakdown below pivotal moving averages with expanding bearish MACD impulse. Immediate invalidation above $${sl}.`;

  return {
    id: `sig_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    symbol,
    timeframe,
    type,
    confidence,
    timestamp: Date.now(),
    priceAtSignal: currentPrice,
    entryZone,
    takeProfit1: tp1,
    takeProfit2: tp2,
    stopLoss: sl,
    riskRewardRatio: '1:2.4',
    rationale,
    checklist,
    status: 'ACTIVE',
  };
}

// Generate realistic historic candles for simulation & chart rendering
export function generateHistoricCandles(
  basePrice: number,
  volatility: number,
  count: number = 90,
  timeframe: Timeframe = '15m'
): Candle[] {
  const candles: Candle[] = [];
  const msInterval =
    timeframe === '1m'
      ? 60 * 1000
      : timeframe === '5m'
      ? 5 * 60 * 1000
      : timeframe === '15m'
      ? 15 * 60 * 1000
      : timeframe === '1h'
      ? 60 * 60 * 1000
      : timeframe === '4h'
      ? 4 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const now = Date.now();
  let currentClose = basePrice * 0.94; // slight upward overall trend

  for (let i = count; i >= 0; i--) {
    const time = now - i * msInterval;
    const changePct = (Math.random() - 0.485) * (volatility * 0.02);
    const open = currentClose;
    const close = +(open * (1 + changePct)).toFixed(2);
    const wickHighPct = Math.random() * (volatility * 0.012);
    const wickLowPct = Math.random() * (volatility * 0.012);
    const high = +(Math.max(open, close) * (1 + wickHighPct)).toFixed(2);
    const low = +(Math.min(open, close) * (1 - wickLowPct)).toFixed(2);
    const volume = Math.floor(Math.random() * 1400 + 400);

    candles.push({ time, open, high, low, close, volume });
    currentClose = close;
  }

  return candles;
}

// Default supported asset list with SET:TRUE as primary default
export const SUPPORTED_ASSETS = [
  { symbol: 'SET:TRUE', displayName: 'True Corporation', category: 'EQUITIES' as const, basePrice: 12.90, decimals: 2, volatility: 0.5, currency: 'THB', exchange: 'SET (Thailand)' },
  { symbol: 'SET:PTT', displayName: 'PTT PCL', category: 'EQUITIES' as const, basePrice: 33.25, decimals: 2, volatility: 0.5, currency: 'THB', exchange: 'SET (Thailand)' },
  { symbol: 'NASDAQ:NVDA', displayName: 'NVIDIA Corp', category: 'EQUITIES' as const, basePrice: 142.80, decimals: 2, volatility: 1.2, currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'NASDAQ:AAPL', displayName: 'Apple Inc', category: 'EQUITIES' as const, basePrice: 234.20, decimals: 2, volatility: 0.8, currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'BINANCE:BTCUSDT', displayName: 'Bitcoin', category: 'CRYPTO' as const, basePrice: 94250, decimals: 2, volatility: 1.2, currency: 'USD', exchange: 'Binance' },
  { symbol: 'BINANCE:ETHUSDT', displayName: 'Ethereum', category: 'CRYPTO' as const, basePrice: 3480, decimals: 2, volatility: 1.3, currency: 'USD', exchange: 'Binance' },
  { symbol: 'FX:EURUSD', displayName: 'Euro / US Dollar', category: 'FOREX' as const, basePrice: 1.0825, decimals: 4, volatility: 0.3, currency: 'USD', exchange: 'Forex' },
  { symbol: 'OANDA:XAUUSD', displayName: 'Gold Spot', category: 'COMMODITIES' as const, basePrice: 2742.0, decimals: 2, volatility: 0.6, currency: 'USD', exchange: 'OANDA' },
];

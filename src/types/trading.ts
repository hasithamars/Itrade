export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface IndicatorMetrics {
  rsi: number;
  rsiDivergence?: 'BULLISH' | 'BEARISH' | 'NONE';
  macd: {
    macd: number;
    signal: number;
    hist: number;
    cross: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NONE';
  };
  ema: {
    ema9: number;
    ema21: number;
    ema50: number;
    ema200: number;
    trend: 'STRONG_UP' | 'UP' | 'SIDEWAYS' | 'DOWN' | 'STRONG_DOWN';
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
    squeeze: boolean;
  };
  supertrend: {
    value: number;
    direction: 'BULLISH' | 'BEARISH';
    justFlipped: boolean;
  };
  atr: number;
  orderBook: {
    bids: Array<{ price: number; amount: number; total: number }>;
    asks: Array<{ price: number; amount: number; total: number }>;
    bidRatio: number; // 0 to 1 (e.g. 0.58 = 58% bids)
    spread: number;
  };
}

export interface LiveSignal {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  type: SignalType;
  confidence: number; // 0 - 100
  timestamp: number;
  priceAtSignal: number;
  entryZone: [number, number];
  takeProfit1: number;
  takeProfit2: number;
  stopLoss: number;
  riskRewardRatio: string;
  rationale: string;
  checklist: Array<{ label: string; passed: boolean; note: string }>;
  status: 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'STOPPED' | 'EXPIRED';
}

export interface ScenarioForecast {
  bias: SignalType;
  confidenceScore: number;
  timeframe: string;
  summary: string;
  scenarios: {
    bullish: {
      probability: number;
      targetPrice: number;
      timeHorizon: string;
      catalyst: string;
      keyLevel: number;
    };
    baseCase: {
      probability: number;
      expectedRange: [number, number];
      timeHorizon: string;
      catalyst: string;
    };
    bearish: {
      probability: number;
      targetPrice: number;
      timeHorizon: string;
      catalyst: string;
      keyLevel: number;
    };
  };
  keyLevels: {
    immediateResistance: number;
    majorResistance: number;
    immediateSupport: number;
    criticalInvalidation: number;
  };
  projectedCandles: Array<{
    candleOffset: number;
    projectedClose: number;
    upperBound: number;
    lowerBound: number;
    predictedTrend: 'up' | 'down' | 'flat';
  }>;
  newsCatalysts: Array<{
    headline: string;
    source: string;
    url?: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    impactScore: number;
    summary: string;
  }>;
  macroFactors: {
    marketSentiment: string;
    interestRateImpact: string;
    liquidityCondition: string;
    riskIndex: number;
  };
  recommendedSignal: {
    action: SignalType | 'HOLD';
    entryZone: [number, number];
    takeProfit1: number;
    takeProfit2: number;
    stopLoss: number;
    riskRewardRatio: string;
    horizon: string;
    rationale: string;
  };
  groundingSources?: Array<{ title: string; url: string }>;
}

export interface AssetInfo {
  symbol: string;
  displayName: string;
  category: 'CRYPTO' | 'EQUITIES' | 'FOREX' | 'COMMODITIES';
  basePrice: number;
  decimals: number;
  volatility: number; // daily volatility multiplier
  currency?: string;
  exchange?: string;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  amountUsd: number;
  currentPrice: number;
  pnlUsd: number;
  pnlPercent: number;
  tp1: number;
  tp2: number;
  sl: number;
  openedAt: number;
  closedAt?: number;
  closeReason?: 'MANUAL' | 'TP1' | 'TP2' | 'SL';
  status: 'OPEN' | 'CLOSED';
}

export interface NewsArticle {
  headline: string;
  source: string;
  category: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactRating: 'HIGH' | 'MEDIUM' | 'LOW';
  timeAgo: string;
  summary: string;
  url?: string;
}

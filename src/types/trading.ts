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
  volumeAnalysis: VolumeAnalysis;
}

export interface VolumeAnalysis {
  currentVolume: number;
  avgVolume20: number;
  relativeVolume: number; // e.g. 2.4 (240% of average)
  volumeStatus: 'ULTRA_HIGH_CLIMAX' | 'HIGH_EXPANSION' | 'NORMAL' | 'LOW_TEST_NO_SUPPLY' | 'LOW_TEST_NO_DEMAND';
  buyVolume: number;
  sellVolume: number;
  deltaPercent: number; // e.g. +64% or -45%
  cvdTrend: 'STRONG_BUY_DELTA' | 'MODERATE_BUY_DELTA' | 'NEUTRAL' | 'MODERATE_SELL_DELTA' | 'STRONG_SELL_DELTA';
  cvdDivergence: 'BULLISH_CVD_DIVERGENCE' | 'BEARISH_CVD_DIVERGENCE' | 'NONE';
  vsaSummary: string;
}

// 🌐 Forex & Multi-Market Daily Bias Analysis
export interface DailyBiasInfo {
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0 - 100%
  higherTimeframeTrend: 'STRONG_UP' | 'UP' | 'SIDEWAYS' | 'DOWN' | 'STRONG_DOWN';
  dailyHigh: number;
  dailyLow: number;
  dailyOpen: number;
  dailyClose: number;
  sweptLiquidity: 'SWEPT_DAILY_HIGH' | 'SWEPT_DAILY_LOW' | 'INSIDE_DAY' | 'EXPANSION';
  biasScore: number; // -100 to +100
  keyFactors: string[];
  ictBiasDescription: string;
}

// 📊 Volume Profile (VPVR) Engine
export interface VolumeProfileLevel {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  isPOC: boolean;
  isValueArea: boolean;
  percentageOfMax: number;
}

export interface VolumeProfileData {
  poc: number; // Point of Control (Highest Volume Price)
  vah: number; // Value Area High (70% Volume Boundary)
  val: number; // Value Area Low (70% Volume Boundary)
  totalVolume: number;
  valueAreaVolume: number;
  profileHigh: number;
  profileLow: number;
  distribution: VolumeProfileLevel[];
  profileType: 'NORMAL_D_SHAPE' | 'P_SHAPE_BULLISH' | 'B_SHAPE_BEARISH' | 'BALANCED';
  confluenceStatus: string;
  priceVersusPOC: 'ABOVE_POC_BULLISH' | 'BELOW_POC_BEARISH' | 'AT_POC_ROTATING';
}

// 👣 Footprint Order Flow & Cluster Imbalance
export interface FootprintBarLevel {
  price: number;
  bidVolume: number;
  askVolume: number;
  delta: number;
  imbalance: 'BUY_IMBALANCE' | 'SELL_IMBALANCE' | 'NONE';
  stackedImbalance?: boolean;
}

export interface FootprintBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  totalVolume: number;
  totalDelta: number;
  pocPrice: number;
  levels: FootprintBarLevel[];
  absorptionSignal?: 'BUY_ABSORPTION' | 'SELL_ABSORPTION' | 'NONE';
}

export interface FootprintAnalysis {
  recentBars: FootprintBar[];
  cumulativeVolumeDelta: number;
  deltaDivergence: 'BULLISH_DELTA_DIVERGENCE' | 'BEARISH_DELTA_DIVERGENCE' | 'NONE';
  stackedBuyImbalances: number;
  stackedSellImbalances: number;
  dominantSide: 'AGGRESSIVE_BUYERS' | 'AGGRESSIVE_SELLERS' | 'BALANCED_AUCTION';
  summary: string;
}

// 🎯 Key Market Levels Identification
export interface KeyMarketLevel {
  id: string;
  price: number;
  label: string; // e.g. "PDH (Prev Day High)", "Daily FVG", "VP POC", "H4 Order Block"
  category: 'DAILY_BIAS' | 'VOLUME_PROFILE' | 'ORDER_BLOCK' | 'LIQUIDITY_POOL' | 'FAIR_VALUE_GAP' | 'SUPPORT_RESISTANCE';
  type: 'SUPPORT' | 'RESISTANCE' | 'PIVOT';
  strength: 'STRONG' | 'MODERATE' | 'TESTED';
  distancePoints: number;
  distancePercent: number;
  testedCount: number;
  status: 'UNTESTED' | 'TOUCHED' | 'BROKEN';
  reactionDescription: string;
}

export interface SmallAccountSizing {
  accountBalance: number; // e.g. $5.00
  riskPercent: number; // e.g. 3% ($0.15 on $5 account)
  maxRiskUsd: number; // e.g. $0.15
  lotSize: string; // e.g. "0.01 Micro Lot" or "0.001 Nano Lot"
  numericLotSize?: number; // e.g. 0.01
  recommendedLeverage: string; // e.g. "1:200 - 1:500"
  numericLeverage?: number; // e.g. 500
  estimatedMarginUsd: number; // e.g. $0.85
  pipValueUsd?: number; // e.g. $0.10
  potentialPnl: {
    tp1Usd: number; // e.g. +$0.35
    tp2Usd: number; // e.g. +$0.70
    tp3Usd: number; // e.g. +$1.25
    tp4Usd: number; // e.g. +$2.10
    slUsd: number; // e.g. -$0.18
  };
  survivalTrades: number; // number of consecutive losses account can withstand
  isMicroAccountSafe: boolean;
  advice: string;
}

export interface TradingViewAnalysis {
  ticker: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  recommendationScore: number; // -1 to +1
  recommendationMA: number; // -1 to +1
  recommendationOther: number; // -1 to +1
  rsi: number;
  macd: number;
  macdSignal: number;
  ema20: number;
  ema50: number;
  close: number;
  open: number;
  high: number;
  low: number;
  change24h: number;
  atr: number;
  timestamp: number;
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
  takeProfit3: number;
  takeProfit4: number;
  stopLoss: number;
  riskRewardRatio: string;
  rationale: string;
  checklist: Array<{ label: string; passed: boolean; note: string }>;
  volumeAnalysis: VolumeAnalysis;
  aiAnalysis: {
    verdict: string;
    analysis: string;
    volumeVerdict?: string;
    risk: 'Low' | 'Medium' | 'High';
  };
  status: 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'STOPPED' | 'EXPIRED';
  // Millisecond double-confirmation with verified market value
  verifiedMarketPrice?: number;
  marketSyncStatus?: 'CONFIRMED_MATCH' | 'CALIBRATING' | 'RE-ANCHORED';
  discrepancyPercent?: number;
  targetDistances?: {
    tp1Percent: number;
    tp2Percent: number;
    tp3Percent: number;
    tp4Percent: number;
    slPercent: number;
  };
  // Small account sizing & risk shield
  smallAccountSizing?: SmallAccountSizing;
  reliabilityTier?: 'ULTRA_HIGH_CONFLUENCE' | 'HIGH_CONFIDENCE' | 'STANDARD';
  // Real TradingView Technical Analysis Confluence
  tradingViewAnalysis?: TradingViewAnalysis;
  // Full Historical Candlestick Pattern Recognition
  candlePatternAnalysis?: {
    patternName: string;
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    reliability: number;
    description: string;
    confluenceNote: string;
  };
  // Historical Signal Backtest Probability Metrics
  backtestProbability?: {
    winRate: number;
    profitFactor: number;
    tp1HitRate: number;
    tp2HitRate: number;
    tp3HitRate: number;
    tp4HitRate: number;
    slRate: number;
    historicalSamples: number;
    grade: 'A+' | 'A' | 'B+' | 'B';
  };
  // Binary Campus AI Trend Predictor Engine
  aiTrendPredictor?: {
    strategyName: string;
    regime: 'BULLISH' | 'BEARISH';
    knnPrediction: number;
    predictedLine: number;
    oscillator: number;
    signalLine: number;
    histogram: number;
    trendUp: boolean;
    ema200: number;
    ema200FilterPassed: boolean;
    crossoverState: 'BULL_CROSS' | 'BEAR_CROSS' | 'NONE';
    validBull: boolean;
    validBear: boolean;
    atrRiskPoints: number;
    slLevel: number;
    tp1Level: number;
    tp2Level: number;
    tp3Level: number;
    summary: string;
  };
  // Active Strategy Details for Learning & Snapshots
  strategyUsed?: {
    name: string;
    description: string;
    coreMechanism: string;
    confluenceFactors: string[];
    riskManagementPlan: string;
  };
  // 🔮 Next Upcoming Candle Pattern Prediction Engine
  upcomingCandlePrediction?: {
    patternName: string;
    bias: 'BULLISH' | 'BEARISH';
    probability: number;
    timeframe: Timeframe;
    expectedMovePercent: number;
    projectedRange: {
      high: number;
      low: number;
      close: number;
    };
    catalyst: string;
    tradingAction: string;
    invalidationLevel: number;
  };
  // 🌐 Forex & Multi-Market Daily Bias
  dailyBias?: DailyBiasInfo;
  // 📊 Volume Profile (VPVR) Engine
  volumeProfile?: VolumeProfileData;
  // 👣 Footprint Order Flow Clusters & Imbalances
  footprintAnalysis?: FootprintAnalysis;
  // 🎯 Key Identified Market Levels
  keyLevels?: KeyMarketLevel[];
  // 🎲 Deriv Volatility Synthetics Option Signal (Rise/Fall, Higher/Lower)
  derivOptionSignal?: {
    isDerivSynthetic: boolean;
    contractType: 'RISE_CALL' | 'FALL_PUT' | 'HIGHER' | 'LOWER';
    recommendedDuration: string;
    payoutMultiplier: number;
    strikeBarrier: number;
    expectedPayoutUsd: number;
    recommendedStakeUsd: number;
    safetyBuffer: string;
  };
  // ⚡ Comprehensive Deriv DTrader All-Option Suite (Rise/Fall, Multipliers, Higher/Lower, Touch, Accumulators, Digits)
  derivFullSuite?: DerivFullOptionSuite;
}

export type DerivDTraderTradeType =
  | 'rise_fall'
  | 'multiplier'
  | 'higher_lower'
  | 'touch'
  | 'accumulator'
  | 'digits';

export interface DerivMultiplierSignal {
  direction: 'UP' | 'DOWN';
  recommendedMultiplier: number; // e.g. 100, 200, 300, 500
  takeProfitPrice: number;
  takeProfitUsd: number;
  stopLossPrice: number;
  stopLossUsd: number;
  dealCancellationRecommended: boolean;
  dealCancellationDuration: '5m' | '10m' | '15m' | '60m';
  stakeUsd: number;
  potentialProfitUsd: number;
  riskRewardRatio: string;
  rationale: string;
}

export interface DerivHigherLowerSignal {
  barrierOffset: string;
  barrierPrice: number;
  recommendedChoice: 'HIGHER' | 'LOWER';
  higherPayoutPercent: number;
  lowerPayoutPercent: number;
  winProbability: number;
  rationale: string;
}

export interface DerivTouchSignal {
  barrierPrice: number;
  barrierOffset: string;
  recommendedChoice: 'TOUCH' | 'NO_TOUCH';
  payoutPercent: number;
  probability: number;
  targetHorizon: string;
  rationale: string;
}

export interface DerivAccumulatorSignal {
  recommendedGrowthRate: '1%' | '2%' | '3%' | '4%' | '5%';
  rangeCorridor: { high: number; low: number };
  targetTicksBeforeCashout: number;
  stabilityScore: number;
  expectedCompoundReturn: number;
  rationale: string;
}

export interface DerivDigitsSignal {
  lastDigit: number;
  evenOddRecommendation: 'EVEN' | 'ODD';
  evenOddProbability: number;
  overUnderRecommendation: 'OVER_4' | 'UNDER_5';
  overUnderProbability: number;
  differRecommendation: number;
  rationale: string;
}

export interface DerivFullOptionSuite {
  symbol: string;
  dtraderSymbol: string; // e.g. "R_100", "R_10"
  currentPrice: number;
  decimals: number;
  timeframe: string;
  dtraderUrl: string;
  riseFall: {
    contract: 'RISE' | 'FALL';
    duration: string;
    payoutMultiplier: number;
    probability: number;
    entrySpot: number;
    expectedPayoutUsd: number;
    recommendedStakeUsd: number;
    rationale: string;
  };
  multiplier: DerivMultiplierSignal;
  higherLower: DerivHigherLowerSignal;
  touchNoTouch: DerivTouchSignal;
  accumulator: DerivAccumulatorSignal;
  digits: DerivDigitsSignal;
}

export interface MarketReversalAlert {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  timestamp: number;
  originalSignalType: SignalType;
  reversalDirection: 'BEARISH_REVERSAL' | 'BULLISH_REVERSAL';
  severity: 'CRITICAL' | 'WARNING';
  currentPrice: number;
  triggerReason: string;
  confluenceFactors: string[];
  recommendedAction: string;
  breakevenLevel?: number;
  suggestedStopLoss?: number;
  acknowledged?: boolean;
}

export interface WorldMarketItem {
  symbol: string;
  displayName: string;
  category: 'COMMODITIES' | 'FOREX' | 'INDICES' | 'CRYPTO' | 'EQUITIES' | 'SYNTHETICS';
  region: 'Americas' | 'Europe' | 'Asia-Pacific' | 'Global';
  basePrice: number;
  decimals: number;
  currency: string;
  exchange: string;
  volatility: number;
  tradingViewSymbol: string;
  description: string;
  flag?: string;
}

export interface ChartPattern {
  id: string;
  name: string;
  category: 'ICT_SMC' | 'CLASSICAL' | 'WYCKOFF';
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timeframe: string;
  status: 'ACTIVE_CONFIRMED' | 'FORMING' | 'TRIGGERED';
  confidence: number;
  keyLevels: {
    invalidation: number;
    breakoutLevel: number;
    target1: number;
    target2: number;
  };
  description: string;
  rules: string[];
  winRate: number;
  detectedAt: number;
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
  category: 'CRYPTO' | 'EQUITIES' | 'FOREX' | 'COMMODITIES' | 'INDICES' | 'SYNTHETICS';
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

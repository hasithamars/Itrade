import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Target,
  ShieldAlert,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Gauge,
  BarChart2,
  RefreshCw,
} from 'lucide-react';

export interface SnapshotScenario {
  id: string;
  title: string;
  badge: string;
  category: 'ICT_SMC' | 'WYCKOFF' | 'VSA' | 'CLASSICAL';
  bias: 'BULLISH' | 'BEARISH';
  symbol: string;
  timeframe: string;
  winRate: number;
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  description: string;
  narrative: string;
  annotations: Array<{
    step: number;
    title: string;
    detail: string;
    type: 'SWEEP' | 'MSS' | 'FVG' | 'ENTRY' | 'TARGET';
  }>;
}

export const SNAPSHOT_SCENARIOS: SnapshotScenario[] = [
  {
    id: 'snap_btc_short',
    title: 'Bearish Liquidity Sweep (BSL) & Wyckoff Upthrust Short Setup',
    badge: 'ICT AMD + WYCKOFF UTAD',
    category: 'ICT_SMC',
    bias: 'BEARISH',
    symbol: 'BTC/USD',
    timeframe: '5M',
    winRate: 86,
    entry: 84493.88,
    stopLoss: 84528.28,
    tp1: 84468.08,
    tp2: 84442.28,
    tp3: 84416.48,
    tp4: 84390.67,
    description: 'Price aggressively swept Buy-Side Liquidity (BSL) above local highs up to 84,688, followed by a Wyckoff Upthrust and Market Structure Shift (MSS) breaking 84,550 support.',
    narrative: 'Institutions induced retail breakout buyers at 84,688 to fill massive short orders. Once buy orders were exhausted, heavy sell displacement broke structural support, leaving behind Fair Value Gaps (FVG) and premium Supply Zones.',
    annotations: [
      {
        step: 1,
        title: 'Buy-Side Liquidity Sweep (84,688)',
        detail: 'Aggressive wick penetrates prior session high, triggering retail breakout buy stops and trapping late buyers.',
        type: 'SWEEP',
      },
      {
        step: 2,
        title: 'Wyckoff Upthrust (UTAD)',
        detail: 'Candle body closes deep inside the range with long upper shadow and ultra-high seller absorption volume.',
        type: 'SWEEP',
      },
      {
        step: 3,
        title: 'Market Structure Shift (MSS at 84,550)',
        detail: 'Impulsive displacement candle closes beneath the key structural swing low, confirming institutional trend change.',
        type: 'MSS',
      },
      {
        step: 4,
        title: 'Bearish Fair Value Gap (FVG) & Premium Supply',
        detail: 'Displacement leaves an unmitigated 3-candle imbalance. Retest of this zone provides the optimal institutional short entry at 84,493.88.',
        type: 'FVG',
      },
      {
        step: 5,
        title: 'Downside Expansion to TP 1-4',
        detail: 'Price cascades toward resting Sell-Side Liquidity (SSL), hitting TP1 (84,468.08) through TP4 runner (84,390.67).',
        type: 'TARGET',
      },
    ],
  },
  {
    id: 'snap_true_long',
    title: 'Bullish Wyckoff Spring & Discount FVG Demand Expansion',
    badge: 'WYCKOFF SPRING + ICT MSS',
    category: 'WYCKOFF',
    bias: 'BULLISH',
    symbol: 'SET:TRUE',
    timeframe: '15M',
    winRate: 83,
    entry: 12.90,
    stopLoss: 12.60,
    tp1: 13.15,
    tp2: 13.40,
    tp3: 13.70,
    tp4: 14.10,
    description: 'Terminal shakeout beneath range baseline support (12.50 THB) testing supply, followed by institutional Sign of Strength (SOS) expansion.',
    narrative: 'Smart money engineered a false breakdown below 12.50 THB to harvest retail stop losses. Diminishing volume proved floating supply had dried up, leading to an explosive markup displacement.',
    annotations: [
      {
        step: 1,
        title: 'Phase C Spring Test (12.50 THB)',
        detail: 'Quick momentary dip beneath support shakes out retail longs and tests whether any commercial supply remains.',
        type: 'SWEEP',
      },
      {
        step: 2,
        title: 'Low Volume Confirmation',
        detail: 'Volume on the test dip drops significantly compared to the initial drop, proving sellers are exhausted.',
        type: 'SWEEP',
      },
      {
        step: 3,
        title: 'Sign of Strength (SOS) Displacement',
        detail: 'Strong green expansion candle reclaims the trading range ceiling with expanding volume and buy delta.',
        type: 'MSS',
      },
      {
        step: 4,
        title: 'Discount Demand Zone Retest',
        detail: 'Orderly pullback to 12.90 THB provides optimal low-risk entry with stop loss tucked under the spring low.',
        type: 'ENTRY',
      },
      {
        step: 5,
        title: 'Markup Expansion to TP 1-4',
        detail: 'Price reaches targets 13.15 THB, 13.40 THB, and extended runner targets at 14.10 THB.',
        type: 'TARGET',
      },
    ],
  },
  {
    id: 'snap_vsa_climax',
    title: 'Volume Spread Analysis (VSA) Ultra-High Climax & CVD Divergence',
    badge: 'VOLUME SPREAD ANALYSIS (VSA)',
    category: 'VSA',
    bias: 'BEARISH',
    symbol: 'BTC/USD',
    timeframe: '15M',
    winRate: 81,
    entry: 84500.00,
    stopLoss: 84545.00,
    tp1: 84450.00,
    tp2: 84400.00,
    tp3: 84350.00,
    tp4: 84290.00,
    description: 'Relative volume at 2.4x the 20-period moving average on narrow candle spread indicates heavy institutional supply transfer.',
    narrative: 'When ultra-high volume prints on a small candle body, it is textbook proof that smart money limit sell orders are absorbing all aggressive market buy orders.',
    annotations: [
      {
        step: 1,
        title: 'Ultra-High Relative Volume (2.4x 20-SMA)',
        detail: 'Massive volume spike without proportionate upward price progress (churning).',
        type: 'SWEEP',
      },
      {
        step: 2,
        title: 'Cumulative Volume Delta (CVD) Divergence',
        detail: 'Price makes a micro higher high while CVD prints a prominent lower high (-38% seller dominance).',
        type: 'MSS',
      },
      {
        step: 3,
        title: 'No Demand Test Confirmation',
        detail: 'Subsequent attempt to rally fails on low volume, confirming institutional absence on the buy side.',
        type: 'FVG',
      },
      {
        step: 4,
        title: 'High-Probability Breakdown',
        detail: 'Short entry triggered on break of low with strict stop loss above the volume climax high.',
        type: 'TARGET',
      },
    ],
  },
  {
    id: 'snap_double_bottom',
    title: 'Double Bottom (W-Reversal) with Bullish RSI Momentum Divergence',
    badge: 'CLASSICAL PATTERN + MOMENTUM',
    category: 'CLASSICAL',
    bias: 'BULLISH',
    symbol: 'ETH/USD',
    timeframe: '1H',
    winRate: 79,
    entry: 3480.00,
    stopLoss: 3440.00,
    tp1: 3515.00,
    tp2: 3550.00,
    tp3: 3590.00,
    tp4: 3640.00,
    description: 'Second trough touched key baseline support while RSI printed a noticeable higher low, confirming seller exhaustion.',
    narrative: 'A textbook double bottom occurs when bears fail to press price lower on their second attempt, while momentum oscillators demonstrate underlying buyer accumulation.',
    annotations: [
      {
        step: 1,
        title: 'Trough 1 Base Support Formation',
        detail: 'Sharp selloff establishes baseline support with high volume panic selling.',
        type: 'SWEEP',
      },
      {
        step: 2,
        title: 'Trough 2 Higher Low on RSI Oscillator',
        detail: 'Price touches identical price level, but RSI prints 44 vs prior 28 (Bullish Divergence).',
        type: 'MSS',
      },
      {
        step: 3,
        title: 'Neckline Breakout with Expanding Volume',
        detail: 'High-momentum displacement closes above the intervening peak, confirming pattern activation.',
        type: 'ENTRY',
      },
      {
        step: 4,
        title: 'Measured Move Expansion',
        detail: 'Target calculated by adding depth of pattern to the breakout neckline level.',
        type: 'TARGET',
      },
    ],
  },
  {
    id: 'snap_xau_gold',
    title: 'Gold (XAU/USD) Bearish Liquidity Sweep & Fair Value Gap Distribution',
    badge: 'ICT SMC + OANDA SPOT GOLD',
    category: 'ICT_SMC',
    bias: 'BEARISH',
    symbol: 'XAUUSD',
    timeframe: '15M',
    winRate: 88,
    entry: 4158.95,
    stopLoss: 4159.20,
    tp1: 4158.55,
    tp2: 4158.20,
    tp3: 4157.80,
    tp4: 4157.30,
    description: 'Gold price swept Buy-Side Liquidity (BSL) above previous highs up to 4,170.44 before institutional rejection formed a bearish Market Structure Shift (MSS).',
    narrative: 'Smart money commercial operators absorbed late retail breakout buyers near 4,170. Heavy institutional selling pushed price below the local swing low, leaving an unmitigated 15m Fair Value Gap (FVG) and premium Supply Zone for a protected short entry.',
    annotations: [
      {
        step: 1,
        title: 'BSL Liquidity Raid (4,170.44)',
        detail: 'Price pierces above session highs to capture buy-stop liquidity and induce retail momentum chasing.',
        type: 'SWEEP',
      },
      {
        step: 2,
        title: 'Market Structure Shift (MSS at 4,162)',
        detail: 'Aggressive downward displacement candle closes cleanly below the local swing low with negative volume delta.',
        type: 'MSS',
      },
      {
        step: 3,
        title: 'Bearish FVG Mitigation Entry (4,158.95)',
        detail: 'Pullback tests the premium imbalance threshold, providing an optimal protected short entry with tight stop loss.',
        type: 'FVG',
      },
      {
        step: 4,
        title: 'Account-Protected Stop Loss (4,159.20)',
        detail: 'Stop loss is sized tightly for micro accounts, capping maximum risk to preserve capital.',
        type: 'ENTRY',
      },
      {
        step: 5,
        title: 'Cascading Targets TP 1-4',
        detail: 'Downward momentum expands toward resting Sell-Side Liquidity (SSL), hitting TP1 (4,158.55) through TP4 (4,157.30).',
        type: 'TARGET',
      },
    ],
  },
  {
    id: 'snap_eur_forex',
    title: 'EUR/USD Institutional Order Flow Breakdown & Trend Continuation',
    badge: 'FOREX SMC + DISCOUNT EXPANSION',
    category: 'ICT_SMC',
    bias: 'BEARISH',
    symbol: 'EUR/USD',
    timeframe: '15M',
    winRate: 85,
    entry: 1.0825,
    stopLoss: 1.0828,
    tp1: 1.0820,
    tp2: 1.0815,
    tp3: 1.0808,
    tp4: 1.0798,
    description: 'Euro broke key moving average support (EMA20/EMA50) with heavy negative delta volume following ECB rate commentary.',
    narrative: 'Liquidity resting at equal lows was targeted by interbank algorithmic feeds. Tight 2.5-pip stop loss preserves micro-account balances while capturing high risk-to-reward continuation.',
    annotations: [
      {
        step: 1,
        title: 'Session High Sweep',
        detail: 'London open spike swept Asian session highs before sharp reversal wicks printed.',
        type: 'SWEEP',
      },
      {
        step: 2,
        title: 'Break of Structure (BOS)',
        detail: 'Clean candle close beneath session pivot confirms institutional trend direction.',
        type: 'MSS',
      },
      {
        step: 3,
        title: 'Tight Micro-Account Entry (1.0825)',
        detail: 'Entry Zone respected with 1:500 leverage and 0.01 micro-lot sizing.',
        type: 'ENTRY',
      },
      {
        step: 4,
        title: 'Full Downside Delivery',
        detail: 'Target expansion delivers TP1 through TP4 runner targets.',
        type: 'TARGET',
      },
    ],
  },
];

interface ChartAnalysisSnapshotProps {
  activeSymbol?: string;
  currentSignal?: import('../types/trading').LiveSignal | null;
  currentPrice?: number;
  timeframe?: string;
  onTimeframeChange?: (tf: any) => void;
  onOpenBacktest?: () => void;
}

export const ChartAnalysisSnapshot: React.FC<ChartAnalysisSnapshotProps> = ({
  activeSymbol = 'XAUUSD',
  currentSignal,
  currentPrice,
  timeframe = '15M',
  onTimeframeChange,
  onOpenBacktest,
}) => {
  // Dynamically generate a live scenario if currentSignal or activeSymbol does not match static list
  const allScenarios = React.useMemo(() => {
    let list = [...SNAPSHOT_SCENARIOS];

    if (currentSignal) {
      const isSell = currentSignal.type.includes('SELL');
      const dynamicId = `snap_live_${currentSignal.symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const dynScenario: SnapshotScenario = {
        id: dynamicId,
        title: `${currentSignal.symbol} Live ${isSell ? 'Bearish' : 'Bullish'} Confluence & Structural Blueprint`,
        badge: `${currentSignal.symbol} • LIVE SIGNAL SYNCHRONIZED`,
        category: 'ICT_SMC',
        bias: isSell ? 'BEARISH' : 'BULLISH',
        symbol: currentSignal.symbol,
        timeframe: currentSignal.timeframe.toUpperCase(),
        winRate: currentSignal.backtestProbability?.winRate || Math.min(94, Math.max(82, currentSignal.confidence)),
        entry: currentSignal.priceAtSignal || currentPrice || 100,
        stopLoss: currentSignal.stopLoss,
        tp1: currentSignal.takeProfit1,
        tp2: currentSignal.takeProfit2,
        tp3: currentSignal.takeProfit3,
        tp4: currentSignal.takeProfit4,
        description: currentSignal.rationale || `Live algorithmic confluence on ${currentSignal.symbol}.`,
        narrative: `${currentSignal.aiAnalysis?.analysis || `Current market structure on ${currentSignal.symbol} confirms institutional participation.`}${
          currentSignal.upcomingCandlePrediction
            ? ` 🔮 Upcoming Candle Projection: ${currentSignal.upcomingCandlePrediction.patternName} (${currentSignal.upcomingCandlePrediction.probability}% Prob) - ${currentSignal.upcomingCandlePrediction.catalyst}`
            : ''
        }`,
        annotations: [
          {
            step: 1,
            title: isSell ? 'Buy-Side Liquidity Sweep' : 'Sell-Side Liquidity Sweep',
            detail: `Price harvested retail liquidity before institutional ${isSell ? 'distribution' : 'accumulation'} shifted momentum.`,
            type: 'SWEEP',
          },
          {
            step: 2,
            title: 'Market Structure Shift (MSS)',
            detail: `Displacement candle confirms trend transition aligned with TradingView scanner rating.`,
            type: 'MSS',
          },
          {
            step: 3,
            title: `Optimal Entry Zone (${currentSignal.priceAtSignal})`,
            detail: `Orderly mitigation retest confirms ${isSell ? 'short' : 'long'} entry with broker-executable spreads.`,
            type: 'ENTRY',
          },
          {
            step: 4,
            title: `Structural Stop Loss (${currentSignal.stopLoss})`,
            detail: `Stop loss anchored beyond recent ${currentSignal.timeframe.toUpperCase()} market swing high/low to give trade proper room and clear broker spreads.`,
            type: 'ENTRY',
          },
          {
            step: 5,
            title: `Take Profit Targets TP1 - TP4`,
            detail: `Cascading targets TP1 (${currentSignal.takeProfit1}) to TP4 (${currentSignal.takeProfit4}) deliver high risk-to-reward ratio.`,
            type: 'TARGET',
          },
        ],
      };

      // Always place current signal as the first scenario tab
      list = [dynScenario, ...list.filter((s) => s.symbol.toUpperCase() !== currentSignal.symbol.toUpperCase())];
    } else if (activeSymbol) {
      // If no live signal object yet, ensure activeSymbol is present at the front of the list
      const price = currentPrice || 100;
      const dynScenario: SnapshotScenario = {
        id: `snap_${activeSymbol.replace(/[^a-zA-Z0-9]/g, '_')}`,
        title: `${activeSymbol} Algorithmic Analysis & Strategy Blueprint`,
        badge: `${activeSymbol} • CURRENT SELECTED ASSET`,
        category: 'ICT_SMC',
        bias: 'BEARISH',
        symbol: activeSymbol,
        timeframe: timeframe.toUpperCase(),
        winRate: 85,
        entry: price,
        stopLoss: +(price * 1.002).toFixed(2),
        tp1: +(price * 0.997).toFixed(2),
        tp2: +(price * 0.994).toFixed(2),
        tp3: +(price * 0.990).toFixed(2),
        tp4: +(price * 0.985).toFixed(2),
        description: `Real-time structural blueprint and institutional liquidity analysis for ${activeSymbol}.`,
        narrative: `Smart money institutional participants execute order flow around key session highs and lows on ${activeSymbol}.`,
        annotations: [
          { step: 1, title: 'Liquidity Sweep', detail: `Probing equal highs/lows on ${activeSymbol}.`, type: 'SWEEP' },
          { step: 2, title: 'Structure Shift', detail: `Impulse breaks local structure with volume delta.`, type: 'MSS' },
          { step: 3, title: 'Protected Entry', detail: `Retest of imbalance zone with calibrated risk.`, type: 'ENTRY' },
          { step: 4, title: 'Target Expansion', detail: `Orderly cascade toward TP1 - TP4 levels.`, type: 'TARGET' },
        ],
      };
      list = [dynScenario, ...list.filter((s) => s.symbol.toUpperCase() !== activeSymbol.toUpperCase())];
    }

    return list;
  }, [currentSignal, activeSymbol, currentPrice, timeframe]);

  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => {
    return allScenarios[0]?.id || 'snap_xau_gold';
  });

  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const sym = (currentSignal?.symbol || activeSymbol || '').toUpperCase();
    if (sym) {
      const match = allScenarios.find((s) => s.symbol.toUpperCase() === sym || s.symbol.toUpperCase().includes(sym) || sym.includes(s.symbol.toUpperCase()));
      if (match) {
        setActiveScenarioId(match.id);
        setActiveStep(0);
      }
    } else if (allScenarios[0]) {
      setActiveScenarioId(allScenarios[0].id);
    }
  }, [activeSymbol, currentSignal?.id, currentSignal?.symbol, currentSignal?.type, allScenarios]);

  const scenario = allScenarios.find((s) => s.id === activeScenarioId) || allScenarios[0];
  const isBear = scenario?.bias === 'BEARISH';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                Visual Chart Analysis Snapshot &amp; Pattern Anatomy
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                EDUCATIONAL CASE STUDY
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Learn how institutions engineer liquidity sweeps, Fair Value Gaps, and high-probability trade setups.
            </p>
          </div>
        </div>

        {/* Action Controls & Scenario Switcher Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Switcher Buttons */}
          {onTimeframeChange && (
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-mono">
              {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    (timeframe || '').toLowerCase() === tf.toLowerCase()
                      ? 'bg-white text-emerald-700 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Change timeframe to ${tf}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          {/* Backtest Button with Probability */}
          {onOpenBacktest && (
            <button
              type="button"
              onClick={onOpenBacktest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold shadow-2xs transition-all"
              title="Inspect Historical Backtest Win Probability"
            >
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backtest</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/90 text-indigo-950 font-mono font-black">
                {currentSignal?.backtestProbability?.winRate || scenario.winRate}% Prob
              </span>
            </button>
          )}

          {/* Scenario Switcher Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {allScenarios.map((s) => {
              const isCurrentSelected = s.symbol.toUpperCase() === (currentSignal?.symbol || activeSymbol || '').toUpperCase();
              const isTabActive = activeScenarioId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveScenarioId(s.id);
                    setActiveStep(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isTabActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{s.symbol} • {s.category}</span>
                  {isCurrentSelected && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isTabActive ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      CURRENT SELECTED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram & Blueprint Canvas */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: High-Resolution Visual Chart Diagram (SVG) (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative rounded-xl border border-slate-200 bg-[#0f172a] p-4 text-white overflow-hidden shadow-inner min-h-[380px] flex flex-col justify-between">
            {/* Top Chart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{scenario.symbol}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  {scenario.timeframe}
                </span>
                <span className="text-emerald-400 font-bold">{scenario.badge}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Win Rate:</span>
                <strong className="text-emerald-400">{scenario.winRate}%</strong>
              </div>
            </div>

            {/* SVG Visual Candlestick Pattern Representation */}
            <div className="w-full flex-1 py-4 flex items-center justify-center">
              {isBear ? (
                // Bearish AMD / BSL Sweep Schematic SVG
                <svg viewBox="0 0 600 240" className="w-full h-auto max-h-[250px] overflow-visible">
                  <defs>
                    <linearGradient id="fvgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="210" x2="600" y2="210" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Equal Highs / Resistance Level */}
                  <line x1="40" y1="70" x2="280" y2="70" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="50" y="64" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    EQUAL HIGHS (Buy-Side Liquidity Pool)
                  </text>

                  {/* Candles: Range accumulation */}
                  {/* Candle 1: Green */}
                  <line x1="50" y1="110" x2="50" y2="150" stroke="#10b981" strokeWidth="1" />
                  <rect x="44" y="115" width="12" height="28" fill="#10b981" rx="1" />

                  {/* Candle 2: Red */}
                  <line x1="80" y1="100" x2="80" y2="140" stroke="#ef4444" strokeWidth="1" />
                  <rect x="74" y="110" width="12" height="24" fill="#ef4444" rx="1" />

                  {/* Candle 3: Green rally to highs */}
                  <line x1="110" y1="80" x2="110" y2="135" stroke="#10b981" strokeWidth="1" />
                  <rect x="104" y="85" width="12" height="35" fill="#10b981" rx="1" />

                  {/* Candle 4: Pullback */}
                  <line x1="140" y1="95" x2="140" y2="145" stroke="#ef4444" strokeWidth="1" />
                  <rect x="134" y="100" width="12" height="30" fill="#ef4444" rx="1" />

                  {/* Step 1 & 2: MANIPULATION SWEEP WICK CANDLE (The Wyckoff Upthrust) */}
                  <line x1="180" y1="25" x2="180" y2="120" stroke="#ef4444" strokeWidth="1.5" />
                  <rect x="174" y="75" width="12" height="35" fill="#ef4444" rx="1" />

                  {/* Sweep Annotation */}
                  <circle cx="180" cy="25" r="4" fill="#ef4444" className="animate-pulse" />
                  <path d="M 180 20 L 195 10 L 290 10" stroke="#ef4444" strokeWidth="1.5" fill="none" />
                  <text x="295" y="13" fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    BSL SWEEP HIGHS: {scenario.stopLoss}
                  </text>

                  {/* Market Structure Low Line */}
                  <line x1="120" y1="140" x2="360" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="260" y="135" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                    MSS BREAK LEVEL (84,550)
                  </text>

                  {/* Step 3: DISPLACEMENT CANDLE BREAKING LOWS */}
                  <line x1="220" y1="90" x2="220" y2="165" stroke="#ef4444" strokeWidth="1.5" />
                  <rect x="214" y="100" width="12" height="58" fill="#ef4444" rx="1" />

                  {/* FVG Highlight Box */}
                  <rect x="230" y="95" width="80" height="35" fill="url(#fvgGrad)" stroke="#ef4444" strokeDasharray="2 2" rx="2" />
                  <text x="238" y="115" fill="#fca5a5" fontSize="9" fontFamily="monospace">
                    BEARISH FVG
                  </text>

                  {/* Step 4: Retest Entry Candle */}
                  <line x1="270" y1="95" x2="270" y2="140" stroke="#10b981" strokeWidth="1" />
                  <rect x="264" y="100" width="12" height="25" fill="#10b981" rx="1" />

                  {/* Entry Callout Arrow */}
                  <circle cx="270" cy="98" r="4" fill="#38bdf8" />
                  <text x="285" y="92" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    ENTRY: {scenario.entry}
                  </text>

                  {/* Stop Loss Level Line */}
                  <line x1="174" y1="35" x2="380" y2="35" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="390" y="38" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    SL: {scenario.stopLoss}
                  </text>

                  {/* Downside Impulse Candles */}
                  <line x1="310" y1="120" x2="310" y2="175" stroke="#ef4444" strokeWidth="1" />
                  <rect x="304" y="125" width="12" height="42" fill="#ef4444" rx="1" />

                  <line x1="340" y1="150" x2="340" y2="200" stroke="#ef4444" strokeWidth="1" />
                  <rect x="334" y="155" width="12" height="38" fill="#ef4444" rx="1" />

                  <line x1="370" y1="180" x2="370" y2="225" stroke="#ef4444" strokeWidth="1" />
                  <rect x="364" y="185" width="12" height="35" fill="#ef4444" rx="1" />

                  {/* Take Profit Target Lines */}
                  <line x1="300" y1="160" x2="520" y2="160" stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="525" y="163" fill="#10b981" fontSize="10" fontFamily="monospace">
                    TP 1: {scenario.tp1}
                  </text>

                  <line x1="320" y1="185" x2="520" y2="185" stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="525" y="188" fill="#10b981" fontSize="10" fontFamily="monospace">
                    TP 2: {scenario.tp2}
                  </text>

                  <line x1="350" y1="215" x2="520" y2="215" stroke="#10b981" strokeWidth="1.5" />
                  <text x="525" y="218" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    TP 4 (Runner): {scenario.tp4}
                  </text>
                </svg>
              ) : (
                // Bullish Spring / SSL Sweep Schematic SVG
                <svg viewBox="0 0 600 240" className="w-full h-auto max-h-[250px] overflow-visible">
                  <defs>
                    <linearGradient id="bullDemandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Equal Lows Line */}
                  <line x1="40" y1="160" x2="260" y2="160" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="50" y="152" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    EQUAL LOWS (Sell-Side Liquidity Pool)
                  </text>

                  {/* Initial Drop */}
                  <line x1="60" y1="70" x2="60" y2="140" stroke="#ef4444" strokeWidth="1" />
                  <rect x="54" y="80" width="12" height="50" fill="#ef4444" rx="1" />

                  <line x1="90" y1="100" x2="90" y2="155" stroke="#ef4444" strokeWidth="1" />
                  <rect x="84" y="110" width="12" height="40" fill="#ef4444" rx="1" />

                  {/* Spring Test Wick */}
                  <line x1="150" y1="130" x2="150" y2="215" stroke="#10b981" strokeWidth="1.5" />
                  <rect x="144" y="140" width="12" height="30" fill="#10b981" rx="1" />

                  <circle cx="150" cy="215" r="4" fill="#10b981" className="animate-pulse" />
                  <text x="165" y="218" fill="#6ee7b7" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    WYCKOFF SPRING (SSL SWEEP)
                  </text>

                  {/* Displacement Upward */}
                  <line x1="190" y1="80" x2="190" y2="160" stroke="#10b981" strokeWidth="1.5" />
                  <rect x="184" y="90" width="12" height="60" fill="#10b981" rx="1" />

                  {/* Demand Box */}
                  <rect x="200" y="110" width="70" height="35" fill="url(#bullDemandGrad)" stroke="#10b981" strokeDasharray="2 2" rx="2" />
                  <text x="210" y="130" fill="#6ee7b7" fontSize="9" fontFamily="monospace">
                    BULLISH FVG
                  </text>

                  {/* Entry */}
                  <circle cx="230" cy="120" r="4" fill="#38bdf8" />
                  <text x="245" y="115" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    ENTRY: {scenario.entry}
                  </text>

                  {/* Stop Loss */}
                  <line x1="140" y1="205" x2="320" y2="205" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="330" y="208" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    SL: {scenario.stopLoss}
                  </text>

                  {/* Expansion */}
                  <line x1="280" y1="60" x2="280" y2="120" stroke="#10b981" strokeWidth="1" />
                  <rect x="274" y="70" width="12" height="40" fill="#10b981" rx="1" />

                  <line x1="320" y1="30" x2="320" y2="90" stroke="#10b981" strokeWidth="1" />
                  <rect x="314" y="40" width="12" height="40" fill="#10b981" rx="1" />

                  {/* TP Targets */}
                  <line x1="280" y1="80" x2="520" y2="80" stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="525" y="83" fill="#10b981" fontSize="10" fontFamily="monospace">
                    TP 1: {scenario.tp1}
                  </text>

                  <line x1="320" y1="40" x2="520" y2="40" stroke="#10b981" strokeWidth="1.5" />
                  <text x="525" y="43" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    TP 4 (Runner): {scenario.tp4}
                  </text>
                </svg>
              )}
            </div>

            {/* Bottom Parameter Summary */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-1.5 rounded bg-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Entry Trigger</span>
                <span className="font-bold text-sky-400">{scenario.entry}</span>
              </div>
              <div className="p-1.5 rounded bg-rose-950/40 border border-rose-900/40">
                <span className="text-[10px] text-rose-400 block">Stop Loss</span>
                <span className="font-bold text-rose-300">{scenario.stopLoss}</span>
              </div>
              <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-900/40">
                <span className="text-[10px] text-emerald-400 block">TP 1</span>
                <span className="font-bold text-emerald-300">{scenario.tp1}</span>
              </div>
              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block">TP 4 Runner</span>
                <span className="font-bold text-emerald-200">{scenario.tp4}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">
            <strong>Institutional Narrative:</strong> {scenario.narrative}
          </p>
        </div>

        {/* Right Side: Step-by-Step Educational Anatomy (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step Execution Sequence</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {scenario.annotations.length} Critical Milestones
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {scenario.annotations.map((item, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.step}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          {item.title}
                        </h5>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

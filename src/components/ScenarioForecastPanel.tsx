import React from 'react';
import { ScenarioForecast } from '../types/trading';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Globe,
  ExternalLink,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
} from 'lucide-react';

interface ScenarioForecastPanelProps {
  forecast: ScenarioForecast | null;
  loading: boolean;
  onRefresh: () => void;
  currentPrice: number;
  symbol: string;
  currency?: string;
}

export const ScenarioForecastPanel: React.FC<ScenarioForecastPanelProps> = ({
  forecast,
  loading,
  onRefresh,
  currentPrice,
  symbol,
  currency = 'THB',
}) => {
  if (!forecast) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
        <Sparkles className="w-8 h-8 text-sky-600 animate-spin mb-3" />
        <h4 className="text-sm font-bold text-slate-800">Initializing AI Forecast Engine...</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Scanning real-time technical indicators, historical price patterns, and world news catalysts for {symbol}.
        </p>
      </div>
    );
  }

  const { scenarios, keyLevels, newsCatalysts, groundingSources } = forecast;

  const bullDiffPct = (
    ((scenarios.bullish.targetPrice - currentPrice) / currentPrice) *
    100
  ).toFixed(2);
  const bearDiffPct = (
    ((scenarios.bearish.targetPrice - currentPrice) / currentPrice) *
    100
  ).toFixed(2);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">WHAT HAPPENS NEXT?</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
                AI SCENARIO FORECAST
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Search-Grounded Technical + World News Engine
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Scanning News...' : 'Scan Now'}</span>
        </button>
      </div>

      {/* Executive Summary */}
      <div className="my-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
        <div className="flex items-center gap-1.5 text-sky-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
          <Activity className="w-3.5 h-3.5" />
          <span>Market Synthesis for {symbol}</span>
        </div>
        {forecast.summary}
      </div>

      {/* Probabilistic Scenario Projections (Bull / Base / Bear) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
        {/* Bullish Scenario */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold rounded-bl-lg">
            {scenarios.bullish.probability}% PROBABILITY
          </div>
          <div>
            <div className="flex items-center gap-1 text-emerald-800 text-xs font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bullish Breakout</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-black text-slate-900">
                {currency} {scenarios.bullish.targetPrice.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +{bullDiffPct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {scenarios.bullish.catalyst}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span>Horizon: {scenarios.bullish.timeHorizon}</span>
            <span className="text-emerald-700 font-bold">Key: {scenarios.bullish.keyLevel}</span>
          </div>
        </div>

        {/* Base Case (Consolidation) */}
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-sky-200 text-sky-900 font-mono text-[10px] font-bold rounded-bl-lg">
            {scenarios.baseCase.probability}% PROBABILITY
          </div>
          <div>
            <div className="flex items-center gap-1 text-sky-800 text-xs font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Range Accumulation</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-mono font-bold text-slate-900">
                {currency} {scenarios.baseCase.expectedRange[0].toFixed(2)} - {scenarios.baseCase.expectedRange[1].toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {scenarios.baseCase.catalyst}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-sky-200 flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span>Horizon: {scenarios.baseCase.timeHorizon}</span>
            <span className="text-sky-700 font-bold">Sideways</span>
          </div>
        </div>

        {/* Bearish Invalidation */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-rose-200 text-rose-900 font-mono text-[10px] font-bold rounded-bl-lg">
            {scenarios.bearish.probability}% PROBABILITY
          </div>
          <div>
            <div className="flex items-center gap-1 text-rose-800 text-xs font-bold mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span>Downside Breakdown</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-black text-slate-900">
                {currency} {scenarios.bearish.targetPrice.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-rose-700 font-bold flex items-center">
                <ArrowDownRight className="w-3 h-3" />
                {bearDiffPct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {scenarios.bearish.catalyst}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-200 flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span>Horizon: {scenarios.bearish.timeHorizon}</span>
            <span className="text-rose-700 font-bold">Risk: {scenarios.bearish.keyLevel}</span>
          </div>
        </div>
      </div>

      {/* World News Catalysts */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Real-time World News Catalysts Impacting {symbol}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-mono bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 font-semibold">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            LIVE NEWS FEED
          </span>
        </div>

        <div className="space-y-2">
          {newsCatalysts.map((news, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-semibold text-slate-900 leading-snug">
                  {news.headline}
                </h5>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    news.sentiment === 'BULLISH'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : news.sentiment === 'BEARISH'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {news.sentiment} ({news.impactScore > 0 ? '+' : ''}{news.impactScore})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {news.summary}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                <span>Source: {news.source}</span>
                {news.url && (
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-700 hover:text-sky-800 font-medium transition-colors"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Search Grounding Sources */}
        {groundingSources && groundingSources.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 font-mono block mb-1">
              Verified Web Sources (Google Search Grounding):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {groundingSources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-white text-slate-600 hover:text-emerald-700 border border-slate-200 text-[10px] shadow-2xs transition-colors"
                >
                  <span className="truncate max-w-[140px]">{source.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Technical Levels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Major Resistance</span>
          <span className="font-bold text-rose-700">${keyLevels.majorResistance.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Immediate Res.</span>
          <span className="font-bold text-amber-700">${keyLevels.immediateResistance.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Immediate Support</span>
          <span className="font-bold text-emerald-700">${keyLevels.immediateSupport.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Critical Invalid.</span>
          <span className="font-bold text-rose-700">${keyLevels.criticalInvalidation.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

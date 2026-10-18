import React, { useState } from 'react';
import { Wallet, ShieldCheck, DollarSign, Zap, Check, AlertTriangle, ArrowRight, Sliders, Scale } from 'lucide-react';

interface AccountSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSaveBalance: (newBalance: number) => void;
  highReliabilityOnly: boolean;
  onToggleHighReliability: (enabled: boolean) => void;
  forexLeverage?: number;
  onSaveForexLeverage?: (leverage: number) => void;
  forexLotSize?: number;
  onSaveForexLotSize?: (lotSize: number) => void;
}

export const AccountSizeModal: React.FC<AccountSizeModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onSaveBalance,
  highReliabilityOnly,
  onToggleHighReliability,
  forexLeverage = 500,
  onSaveForexLeverage,
  forexLotSize = 0.01,
  onSaveForexLotSize,
}) => {
  const [balanceInput, setBalanceInput] = useState<string>(currentBalance.toString());
  const [shieldActive, setShieldActive] = useState<boolean>(highReliabilityOnly);
  const [selectedLeverage, setSelectedLeverage] = useState<number>(forexLeverage);
  const [selectedLotSize, setSelectedLotSize] = useState<number>(forexLotSize);
  const [customLotInput, setCustomLotInput] = useState<string>(forexLotSize.toString());

  if (!isOpen) return null;

  const parsedBalance = parseFloat(balanceInput) || 5;
  const activeLot = parseFloat(customLotInput) || selectedLotSize || 0.01;
  const riskPercent = parsedBalance <= 10 ? 3.5 : parsedBalance <= 50 ? 2.8 : 2.0;
  const maxRiskUsd = +(parsedBalance * (riskPercent / 100)).toFixed(2);
  const pipValue = +(activeLot * 10).toFixed(2); // 1 pip on EURUSD = $0.10 for 0.01 lot
  const estimatedMarginForex = +((activeLot * 100000 * 1.08) / selectedLeverage).toFixed(2);
  const estimatedMarginGold = +((activeLot * 100 * 4166) / selectedLeverage).toFixed(2);
  const potentialTp1 = +(maxRiskUsd * 1.5).toFixed(2);
  const potentialTp2 = +(maxRiskUsd * 2.8).toFixed(2);
  const survivalTrades = Math.max(1, Math.floor(parsedBalance / Math.max(0.01, maxRiskUsd)));

  const presets = [5, 10, 25, 50, 100, 250, 500, 1000];
  const leverageOptions = [100, 200, 500, 1000, 2000];
  const lotOptions = [0.01, 0.02, 0.05, 0.10, 0.50, 1.00];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBalance > 0) {
      onSaveBalance(parsedBalance);
      onToggleHighReliability(shieldActive);
      if (onSaveForexLeverage) onSaveForexLeverage(selectedLeverage);
      if (onSaveForexLotSize) onSaveForexLotSize(activeLot);
      localStorage.setItem('forex_leverage', selectedLeverage.toString());
      localStorage.setItem('forex_lot_size', activeLot.toString());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Account Size, Leverage &amp; Lot Sizing
                </h3>
                {parsedBalance <= 10 && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                    MICRO ACCOUNT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Calibrate exact Forex leverage, lot size, and dollar stop loss to protect your account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Account Balance */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              1. Your Account Balance ($ USD):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">
                $
              </span>
              <input
                type="number"
                step="any"
                min="1"
                max="1000000"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="5.00"
                className="w-full pl-8 pr-4 py-2 text-lg font-mono font-black text-slate-900 bg-white border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* Quick Balance Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {presets.map((amt) => {
                const isSelected = parsedBalance === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBalanceInput(amt.toString())}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ${amt} {amt === 5 ? '🔥 Micro' : amt === 10 ? 'Mini' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 💱 Forex Leverage Setting */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>2. Forex &amp; Metals Leverage:</span>
              </span>
              <span className="text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                1:{selectedLeverage}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {leverageOptions.map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setSelectedLeverage(lev)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-mono font-bold border transition-all text-center ${
                    selectedLeverage === lev
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  1:{lev}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Higher leverage reduces required margin for small accounts like $5.00 (e.g. 1:500 to 1:2000).
            </p>
          </div>

          {/* 📦 Forex Lot Size Setting */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>3. Forex Lot Size for Signals:</span>
              </span>
              <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {activeLot} Lot ({activeLot <= 0.01 ? 'Micro' : activeLot <= 0.1 ? 'Mini' : 'Standard'})
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1">
              {lotOptions.map((lot) => (
                <button
                  key={lot}
                  type="button"
                  onClick={() => {
                    setSelectedLotSize(lot);
                    setCustomLotInput(lot.toString());
                  }}
                  className={`py-1 px-1 rounded-lg text-[11px] font-mono font-bold border transition-all text-center ${
                    activeLot === lot
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {lot} {lot === 0.01 ? '★' : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-600 font-semibold shrink-0">Custom Lot:</span>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="50"
                value={customLotInput}
                onChange={(e) => setCustomLotInput(e.target.value)}
                placeholder="0.01"
                className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 📊 Live Margin & Pip Value Calculation Preview */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 flex flex-col gap-1.5 font-mono text-xs">
            <span className="font-bold text-slate-900 flex items-center justify-between text-[11px]">
              <span>💡 Forex &amp; Metals Execution Math:</span>
              <span className="text-emerald-700 font-bold">{survivalTrades}+ Trades Survival</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Pip Value</span>
                <strong className="text-slate-900">${pipValue}/pip</strong>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Forex Margin (1:{selectedLeverage})</span>
                <strong className={estimatedMarginForex > parsedBalance ? 'text-rose-600 font-black' : 'text-slate-900'}>
                  ${estimatedMarginForex}
                </strong>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Gold Margin</span>
                <strong className={estimatedMarginGold > parsedBalance ? 'text-rose-600 font-black' : 'text-slate-900'}>
                  ${estimatedMarginGold}
                </strong>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">SL Risk Allowed</span>
                <strong className="text-rose-600">-${maxRiskUsd} ({riskPercent}%)</strong>
              </div>
            </div>

            {estimatedMarginForex > parsedBalance && (
              <p className="text-[10px] text-rose-700 font-sans mt-1 bg-rose-50 p-1.5 rounded border border-rose-200">
                ⚠️ <strong>Margin Warning:</strong> ${estimatedMarginForex} required margin exceeds your ${parsedBalance.toFixed(2)} balance. Increase leverage to 1:1000 or lower lot size to 0.01 micro-lot.
              </p>
            )}
          </div>

          {/* High Reliability Shield Toggle */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  Ultra-High Reliability Filter (Small Account Shield)
                </span>
                <span className="text-[11px] text-indigo-700">
                  Filters out choppy false breakouts; triggers ONLY when 4+ indicators align (80%+ confidence)
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={shieldActive}
                onChange={(e) => setShieldActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save &amp; Apply to Signals (${parsedBalance.toFixed(2)} • 1:{selectedLeverage} • {activeLot} Lot)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

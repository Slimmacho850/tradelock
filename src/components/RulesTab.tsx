import React, { useState } from 'react';
import { useGuardian } from '../context/GuardianContext';
import { GuardianRules } from '../types/guardian';
import { ShieldCheck, AlertTriangle, Target, Activity, Flame, Lock, Clock, Check, Save } from 'lucide-react';
import { audioHaptics } from '../services/audioHaptics';

export const RulesTab: React.FC = () => {
  const { rules, updateRules } = useGuardian();
  const [formData, setFormData] = useState<GuardianRules>(rules);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    audioHaptics.tapFeedback();
    updateRules(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Guardrail Rules & Lock Criteria
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          When any enabled threshold is breached, MT5 Lock Guardian will immediately trigger the lock protocol, close open positions, and lock trading.
        </p>
      </div>

      {/* Criterion 1: Daily Max Loss Limit */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Daily Maximum Loss Limit</h3>
              <p className="text-[11px] text-slate-400">Lock out account if today's net loss hits this cap.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.dailyLossLimitEnabled}
            onChange={(e) => setFormData({ ...formData, dailyLossLimitEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {formData.dailyLossLimitEnabled && (
          <div className="pt-2 border-t border-dark-800 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Mode</label>
              <div className="grid grid-cols-2 bg-dark-950 p-1 rounded-xl border border-dark-700">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dailyLossLimitType: 'currency' })}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.dailyLossLimitType === 'currency' ? 'bg-dark-800 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Amount ($)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dailyLossLimitType: 'percent' })}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.dailyLossLimitType === 'percent' ? 'bg-dark-800 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Percent (%)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Threshold {formData.dailyLossLimitType === 'currency' ? '($)' : '(%)'}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={formData.dailyLossLimitValue}
                onChange={(e) => setFormData({ ...formData, dailyLossLimitValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Criterion 2: Daily Profit Target */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Daily Profit Target Lock</h3>
              <p className="text-[11px] text-slate-400">Lock in your profits so you don't overtrade or give back gains.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.profitTargetEnabled}
            onChange={(e) => setFormData({ ...formData, profitTargetEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {formData.profitTargetEnabled && (
          <div className="pt-2 border-t border-dark-800 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Mode</label>
              <div className="grid grid-cols-2 bg-dark-950 p-1 rounded-xl border border-dark-700">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, profitTargetType: 'currency' })}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.profitTargetType === 'currency' ? 'bg-dark-800 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Amount ($)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, profitTargetType: 'percent' })}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.profitTargetType === 'percent' ? 'bg-dark-800 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Percent (%)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Target {formData.profitTargetType === 'currency' ? '($)' : '(%)'}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={formData.profitTargetValue}
                onChange={(e) => setFormData({ ...formData, profitTargetValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Criterion 3: Max Trailing Drawdown */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Trailing Drawdown from Peak Equity</h3>
              <p className="text-[11px] text-slate-400">Lock if equity retraces by this amount from today's highest watermark.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.maxDrawdownEnabled}
            onChange={(e) => setFormData({ ...formData, maxDrawdownEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {formData.maxDrawdownEnabled && (
          <div className="pt-2 border-t border-dark-800 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Mode</label>
              <div className="grid grid-cols-2 bg-dark-950 p-1 rounded-xl border border-dark-700">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, maxDrawdownType: 'currency' })}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.maxDrawdownType === 'currency' ? 'bg-dark-800 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Amount ($)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, maxDrawdownType: 'percent' })}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.maxDrawdownType === 'percent' ? 'bg-dark-800 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Percent (%)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Max Drop {formData.maxDrawdownType === 'currency' ? '($)' : '(%)'}
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={formData.maxDrawdownValue}
                onChange={(e) => setFormData({ ...formData, maxDrawdownValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Criterion 4: Max Daily Trades Limit */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Max Daily Trades (Anti-Revenge)</h3>
              <p className="text-[11px] text-slate-400">Lock out after placing a fixed number of trades in a single day.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.maxDailyTradesEnabled}
            onChange={(e) => setFormData({ ...formData, maxDailyTradesEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {formData.maxDailyTradesEnabled && (
          <div className="pt-2 border-t border-dark-800">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Maximum Trades Allowed Today
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.maxDailyTradesValue}
              onChange={(e) => setFormData({ ...formData, maxDailyTradesValue: parseInt(e.target.value) || 1 })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Lock Duration & Strict Mode Section */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-400" />
          Lock Protocol Settings
        </h3>

        {/* Lock Duration Choice */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium">Cooldown Duration</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="lockDurationType"
                checked={formData.lockUntilMidnightUtc}
                onChange={() => setFormData({ ...formData, lockUntilMidnightUtc: true })}
                className="text-emerald-500 focus:ring-0"
              />
              <span>Lock Until Next Trading Day (00:00 UTC Midnight)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="lockDurationType"
                checked={!formData.lockUntilMidnightUtc}
                onChange={() => setFormData({ ...formData, lockUntilMidnightUtc: false })}
                className="text-emerald-500 focus:ring-0"
              />
              <span>Lock for Fixed Hours:</span>
            </label>

            {!formData.lockUntilMidnightUtc && (
              <div className="pl-6 pt-1">
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={formData.lockDurationHours}
                  onChange={(e) => setFormData({ ...formData, lockDurationHours: parseInt(e.target.value) || 1 })}
                  className="w-32 bg-dark-950 border border-dark-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 ml-2">hours</span>
              </div>
            )}
          </div>
        </div>

        {/* Strict Mode Toggle */}
        <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Strict Discipline Mode
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Prevents manual early unlocking until the timer has fully expired.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.strictMode}
            onChange={(e) => setFormData({ ...formData, strictMode: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {/* Auto Liquidate Toggle */}
        <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Emergency Auto-Liquidation</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Immediately market-close all open trades when lock triggers.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.autoLiquidateOpenPositions}
            onChange={(e) => setFormData({ ...formData, autoLiquidateOpenPositions: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {/* Auto Kill incoming trades */}
        <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Instant Auto-Kill Watchdog</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instantly close any trade opened from MT5 mobile app while locked.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.autoKillNewTradesWhileLocked}
            onChange={(e) => setFormData({ ...formData, autoKillNewTradesWhileLocked: e.target.checked })}
            className="w-5 h-5 rounded bg-dark-950 border-dark-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg glow-emerald flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>RULES SAVED SUCCESSFULLY!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>SAVE & APPLY RULES</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

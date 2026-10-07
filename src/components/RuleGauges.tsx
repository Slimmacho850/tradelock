import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { AlertTriangle, Target, Activity, Flame, ShieldAlert, Award } from 'lucide-react';

export const RuleGauges: React.FC = () => {
  const {
    accountInfo,
    rules,
    dailyLossAmount,
    dailyLossPct,
    dailyProfitAmount,
    dailyProfitPct,
    trailingDrawdownAmount,
    trailingDrawdownPct,
    totalTradesToday
  } = useGuardian();

  // Helper for loss threshold
  const lossLimitValue = rules.dailyLossLimitType === 'currency'
    ? rules.dailyLossLimitValue
    : (rules.dailyLossLimitValue * accountInfo.startingDailyBalance) / 100;
  const lossProgress = lossLimitValue > 0 ? Math.min(100, (dailyLossAmount / lossLimitValue) * 100) : 0;
  const lossBuffer = Math.max(0, lossLimitValue - dailyLossAmount);

  // Helper for profit target
  const profitTargetValue = rules.profitTargetType === 'currency'
    ? rules.profitTargetValue
    : (rules.profitTargetValue * accountInfo.startingDailyBalance) / 100;
  const profitProgress = profitTargetValue > 0 ? Math.min(100, (dailyProfitAmount / profitTargetValue) * 100) : 0;
  const profitBuffer = Math.max(0, profitTargetValue - dailyProfitAmount);

  // Helper for trailing drawdown
  const ddLimitValue = rules.maxDrawdownType === 'currency'
    ? rules.maxDrawdownValue
    : (rules.maxDrawdownValue * accountInfo.peakDailyEquity) / 100;
  const ddProgress = ddLimitValue > 0 ? Math.min(100, (trailingDrawdownAmount / ddLimitValue) * 100) : 0;
  const ddBuffer = Math.max(0, ddLimitValue - trailingDrawdownAmount);

  // Helper for max trades
  const tradesMax = rules.maxDailyTradesValue || 1;
  const tradesProgress = Math.min(100, (totalTradesToday / tradesMax) * 100);
  const tradesRemaining = Math.max(0, tradesMax - totalTradesToday);

  return (
    <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-dark-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Guardrail Thresholds
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Live Monitored</span>
      </div>

      {/* Gauge 1: Daily Max Loss Limit */}
      {rules.dailyLossLimitEnabled && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                lossProgress >= 80 ? 'bg-red-500 animate-ping' : lossProgress >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              Daily Max Loss
            </span>
            <span className="font-mono text-slate-200">
              <span className={dailyLossAmount > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                -${dailyLossAmount.toFixed(2)}
              </span>
              {' / '}
              <span className="text-slate-400">-${lossLimitValue.toFixed(2)}</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-dark-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                lossProgress >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : lossProgress >= 50
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${lossProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Buffer: ${lossBuffer.toFixed(2)} left</span>
            <span className={lossProgress >= 80 ? 'text-red-400 font-bold' : ''}>
              {lossProgress.toFixed(0)}% to lockout
            </span>
          </div>
        </div>
      )}

      {/* Gauge 2: Daily Profit Target */}
      {rules.profitTargetEnabled && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              Profit Lock Target
            </span>
            <span className="font-mono text-slate-200">
              <span className={dailyProfitAmount > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                +${dailyProfitAmount.toFixed(2)}
              </span>
              {' / '}
              <span className="text-slate-400">+${profitTargetValue.toFixed(2)}</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-dark-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${profitProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{profitProgress >= 100 ? 'Target Achieved!' : `+$${profitBuffer.toFixed(2)} needed`}</span>
            <span className="text-emerald-400 font-medium">{profitProgress.toFixed(0)}% reached</span>
          </div>
        </div>
      )}

      {/* Gauge 3: Max Trailing Drawdown */}
      {rules.maxDrawdownEnabled && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Trailing Drawdown (Peak)
            </span>
            <span className="font-mono text-slate-200">
              <span className={trailingDrawdownAmount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                -${trailingDrawdownAmount.toFixed(2)}
              </span>
              {' / '}
              <span className="text-slate-400">-${ddLimitValue.toFixed(2)}</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-dark-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ddProgress >= 80 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-amber-500'
              }`}
              style={{ width: `${ddProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Buffer: ${ddBuffer.toFixed(2)} left</span>
            <span>{ddProgress.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Gauge 4: Max Daily Trades */}
      {rules.maxDailyTradesEnabled && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Max Daily Trades (Overtrading Guard)
            </span>
            <span className="font-mono text-slate-200">
              <strong className={totalTradesToday >= tradesMax ? 'text-red-400' : 'text-white'}>
                {totalTradesToday}
              </strong>
              {' / '}
              <span className="text-slate-400">{tradesMax}</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-dark-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                tradesProgress >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-amber-400'
              }`}
              style={{ width: `${tradesProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{tradesRemaining === 0 ? 'Trade limit reached' : `${tradesRemaining} trade(s) left`}</span>
            <span>{tradesProgress.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { Lock, Unlock, AlertOctagon, CheckCircle2, Clock, ShieldX, Flame } from 'lucide-react';

export const StatusBanner: React.FC = () => {
  const {
    lockState,
    rules,
    timeRemainingSeconds,
    unlockAccount,
    dailyLossAmount,
    dailyLossPct
  } = useGuardian();

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (lockState.isLocked) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-red-950/80 to-dark-900 border-2 border-red-500/60 p-4 shadow-2xl glow-red">
        {/* Animated background beacon */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-red-600/10 rounded-full blur-2xl animate-pulse" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 animate-bounce">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500 text-black">
                  ACCOUNT LOCKED
                </span>
                {rules.strictMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    STRICT MODE ON
                  </span>
                )}
              </div>
              <h2 className="text-sm font-semibold text-white mt-1 leading-snug">
                {lockState.reason || 'Risk threshold breached'}
              </h2>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-4 pt-3 border-t border-red-500/20 grid grid-cols-2 gap-3 items-center">
          <div className="bg-dark-950/70 rounded-xl p-2.5 border border-red-500/30">
            <div className="flex items-center gap-1.5 text-xs text-red-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Cooldown Lockout</span>
            </div>
            <div className="text-xl font-black font-mono tracking-wider text-white mt-0.5">
              {formatCountdown(timeRemainingSeconds)}
            </div>
          </div>

          <div className="bg-dark-950/70 rounded-xl p-2.5 border border-red-500/30">
            <div className="flex items-center gap-1.5 text-xs text-red-300">
              <ShieldX className="w-3.5 h-3.5" />
              <span>Watchdog Actions</span>
            </div>
            <div className="text-xs font-medium text-slate-300 mt-1">
              Liquidated: <strong className="text-white">{lockState.autoLiquidatedCount}</strong> | Blocked: <strong className="text-red-400">{lockState.rejectedTradesCount}</strong>
            </div>
          </div>
        </div>

        {/* Auto-Kill Notice */}
        <div className="mt-3 text-[11px] text-red-300/80 bg-red-950/40 rounded-lg p-2 border border-red-900/50 flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-400 shrink-0" />
          <span>Any trade opened on your MT5 mobile app will be killed instantly.</span>
        </div>

        {/* Unlock Action Button */}
        <div className="mt-3">
          <button
            onClick={() => unlockAccount(false)}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              rules.strictMode && timeRemainingSeconds > 0
                ? 'bg-dark-800 text-slate-500 border border-dark-700 cursor-not-allowed'
                : 'bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 hover:border-red-400'
            }`}
          >
            <Unlock className="w-4 h-4" />
            {rules.strictMode && timeRemainingSeconds > 0
              ? 'Strict Mode: Unlocks when timer ends'
              : 'Emergency Override / Unlock Account'}
          </button>
        </div>
      </div>
    );
  }

  // When Safe & Active
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-emerald-500/30 p-4 glow-emerald">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                GUARDRAILS ACTIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Account monitored in real time • Kill switch armed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

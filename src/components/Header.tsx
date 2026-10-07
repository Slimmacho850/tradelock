import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { Shield, ShieldAlert, Lock, Zap, RefreshCw, Volume2, Sparkles } from 'lucide-react';
import { audioHaptics } from '../services/audioHaptics';

export const Header: React.FC<{ onOpenSimModal?: () => void }> = ({ onOpenSimModal }) => {
  const {
    accountInfo,
    lockState,
    isDemoMode,
    setIsDemoMode,
    isConnected,
    isLoading,
    refreshData,
    dailyLossAmount,
    rules
  } = useGuardian();

  // Determine threat level
  const lossLimit = rules.dailyLossLimitType === 'currency'
    ? rules.dailyLossLimitValue
    : (rules.dailyLossLimitValue * accountInfo.startingDailyBalance) / 100;
  const isNearLimit = rules.dailyLossLimitEnabled && lossLimit > 0 && (dailyLossAmount / lossLimit) >= 0.8;

  return (
    <header className="sticky top-0 z-40 bg-[#070a12]/90 backdrop-blur-md border-b border-dark-700/60 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand & Account Name */}
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            lockState.isLocked
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 glow-red animate-pulse'
              : isNearLimit
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 glow-gold'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 glow-emerald'
          }`}>
            {lockState.isLocked ? (
              <Lock className="w-5 h-5 animate-bounce" />
            ) : isNearLimit ? (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            ) : (
              <Shield className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                MT5 GUARDIAN
              </h1>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                isDemoMode
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isDemoMode ? 'SIMULATOR' : 'LIVE CLOUD'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping-slow' : 'bg-red-400'}`} />
              <span className="truncate max-w-[130px]">{accountInfo.broker}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound test button */}
          <button
            onClick={() => audioHaptics.playWarningChime()}
            title="Sound Test"
            className="p-2 rounded-lg bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700/60 active:scale-95 transition-transform"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Refresh button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700/60 active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
              isDemoMode
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isDemoMode ? 'Go Live' : 'Demo'}
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { Play, TrendingDown, TrendingUp, PlusCircle, RotateCcw, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const {
    isDemoMode,
    lockState,
    simulateAddTrade,
    simulateTriggerLossLimit,
    simulateTriggerProfitTarget,
    resetSimulationDay
  } = useGuardian();

  if (!isDemoMode) return null;

  return (
    <div className="bg-dark-900/90 border border-blue-500/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Simulator & Testbed Controls
          </h3>
        </div>
        <span className="text-[10px] text-blue-400/80 font-mono">Test Rules Risk-Free</span>
      </div>

      <p className="text-xs text-slate-400">
        Test how the app reacts when your rules are hit. Tap below to simulate live market events:
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Test Loss Breach */}
        <button
          onClick={simulateTriggerLossLimit}
          className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-left transition-all active:scale-95"
        >
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
            <TrendingDown className="w-3.5 h-3.5" />
            Trigger Daily Loss
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Simulates a -$210 drop to trigger immediate account lock.
          </p>
        </button>

        {/* Test Profit Lock */}
        <button
          onClick={simulateTriggerProfitTarget}
          className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 text-left transition-all active:scale-95"
        >
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            Trigger Profit Target
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Simulates a +$415 gain to test profit lock protection.
          </p>
        </button>

        {/* Add Trade */}
        <button
          onClick={() => simulateAddTrade('XAUUSD', 'POSITION_TYPE_BUY')}
          className="p-2.5 rounded-xl bg-dark-950 hover:bg-dark-800 border border-dark-700 text-left transition-all active:scale-95"
        >
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold">
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            {lockState.isLocked ? 'Test Auto-Kill Trade' : 'Add Open Trade'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {lockState.isLocked
              ? 'Tests watchdog: trade will be killed instantly!'
              : 'Adds a simulated 0.5 lot gold trade.'}
          </p>
        </button>

        {/* Reset */}
        <button
          onClick={resetSimulationDay}
          className="p-2.5 rounded-xl bg-dark-950 hover:bg-dark-800 border border-dark-700 text-left transition-all active:scale-95"
        >
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            Reset Sim Day
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Resets back to clean $10k starting balance and unlocks.
          </p>
        </button>
      </div>
    </div>
  );
};

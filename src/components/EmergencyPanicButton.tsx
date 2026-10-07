import React, { useState, useRef, useEffect } from 'react';
import { useGuardian } from '../context/GuardianContext';
import { AlertOctagon, Lock, ShieldAlert } from 'lucide-react';
import { audioHaptics } from '../services/audioHaptics';

export const EmergencyPanicButton: React.FC = () => {
  const { lockState, triggerEmergencyLock } = useGuardian();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const HOLD_DURATION_MS = 1500; // 1.5 seconds hold to prevent accidental triggers

  const startHold = () => {
    if (lockState.isLocked) return;
    audioHaptics.vibrate(40);
    setHolding(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timerRef.current);
        setHolding(false);
        setProgress(0);
        triggerEmergencyLock();
      }
    }, 30);
  };

  const endHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (lockState.isLocked) return null;

  return (
    <div className="bg-dark-900/90 border border-red-500/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          Emergency Kill Switch
        </div>
        <span className="text-[10px] text-slate-400">Hold 1.5s to trigger</span>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Feeling tilted or need to walk away? Instantly close all open positions and lock down MT5.
      </p>

      {/* Deliberate Hold-to-Lock Button */}
      <div className="relative">
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          className={`w-full relative overflow-hidden py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all select-none ${
            holding
              ? 'bg-red-600 text-white scale-[0.99] glow-red'
              : 'bg-red-950/60 hover:bg-red-900/50 text-red-200 border border-red-500/40 active:scale-[0.99]'
          }`}
        >
          {/* Progress fill animation behind text */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-red-600 transition-all duration-75 opacity-80"
            style={{ width: `${progress}%` }}
          />

          <span className="relative z-10 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {holding ? `HOLDING... ${Math.round(progress)}%` : 'HOLD TO LOCK ACCOUNT NOW'}
          </span>
        </button>
      </div>
    </div>
  );
};

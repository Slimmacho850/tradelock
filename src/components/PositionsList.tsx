import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { Layers, XCircle, ArrowUpRight, ArrowDownRight, Trash2, AlertCircle } from 'lucide-react';

export const PositionsList: React.FC = () => {
  const {
    positions,
    lockState,
    closePositionManual,
    closeAllPositionsManual,
    floatingPnL
  } = useGuardian();

  return (
    <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Open Positions ({positions.length})
          </h3>
        </div>

        {positions.length > 0 && (
          <button
            onClick={closeAllPositionsManual}
            className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Trash2 className="w-3 h-3" />
            Close All
          </button>
        )}
      </div>

      {positions.length === 0 ? (
        <div className="py-8 text-center text-slate-500 space-y-1">
          <Layers className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
          <p className="text-xs font-medium">No open positions</p>
          <p className="text-[11px] text-slate-600">Your account is currently flat.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {positions.map((pos) => {
            const isBuy = pos.type === 'POSITION_TYPE_BUY';
            const isProfit = pos.profit >= 0;

            return (
              <div
                key={pos.id}
                className="bg-dark-950/80 border border-dark-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-dark-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg font-bold text-[10px] flex items-center gap-0.5 ${
                    isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{isBuy ? 'BUY' : 'SELL'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white tracking-wide">{pos.symbol}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-800 text-slate-400">
                        {pos.volume} lots
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Entry: {pos.openPrice} → Now: {pos.currentPrice}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono ${
                      isProfit ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}${pos.profit.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      #{pos.id.slice(-6)}
                    </div>
                  </div>

                  <button
                    onClick={() => closePositionManual(pos.id)}
                    title="Close position immediately"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-colors active:scale-90"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

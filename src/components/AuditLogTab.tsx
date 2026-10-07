import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { FileText, Trash2, AlertOctagon, CheckCircle2, ShieldAlert, XCircle, Info, Flame } from 'lucide-react';
import { audioHaptics } from '../services/audioHaptics';

export const AuditLogTab: React.FC = () => {
  const { logs, clearLogs } = useGuardian();

  const getBadge = (type: string) => {
    switch (type) {
      case 'LOCK':
        return (
          <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-red-400" />
            LOCKED
          </span>
        );
      case 'LIQUIDATION':
        return (
          <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            LIQUIDATION
          </span>
        );
      case 'REJECTED_TRADE':
        return (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" />
            AUTO-KILL
          </span>
        );
      case 'WARNING':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case 'UNLOCK':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            UNLOCKED
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-400" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Audit Trail & Event Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time record of all rule breaches, liquidations, and watchdogs.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={() => {
              audioHaptics.tapFeedback();
              clearLogs();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-dark-950 border border-dark-800 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-8 text-center text-slate-500 space-y-1">
          <FileText className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
          <p className="text-xs font-medium">No log events yet</p>
          <p className="text-[11px] text-slate-600">Events will appear here as criteria are checked.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-dark-900/90 border border-dark-800 rounded-xl p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getBadge(log.type)}
                </div>
                <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">{log.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

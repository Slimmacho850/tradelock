import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { DollarSign, TrendingDown, TrendingUp, Wallet, ShieldAlert, Layers } from 'lucide-react';

export const QuickStats: React.FC = () => {
  const {
    accountInfo,
    floatingPnL,
    netDailyPnL,
    trailingDrawdownAmount,
    trailingDrawdownPct,
    positions
  } = useGuardian();

  const isNetProfit = netDailyPnL >= 0;
  const isFloatingProfit = floatingPnL >= 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Card 1: Balance & Equity */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
            Equity / Bal
          </span>
          <span className="text-[10px] font-mono text-slate-500">1:{accountInfo.leverage}</span>
        </div>

        <div className="mt-2">
          <div className="text-xl font-bold font-mono tracking-tight text-white">
            ${accountInfo.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
            <span>Bal: ${accountInfo.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            <span className="text-slate-500">Free: ${accountInfo.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Today's Net P&L */}
      <div className={`bg-dark-900/90 border rounded-2xl p-3.5 flex flex-col justify-between transition-colors ${
        isNetProfit
          ? 'border-emerald-500/30'
          : 'border-red-500/30'
      }`}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            {isNetProfit ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            )}
            Today's Net P&L
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
            isNetProfit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {isNetProfit ? '+' : ''}
            {accountInfo.startingDailyBalance > 0
              ? ((netDailyPnL / accountInfo.startingDailyBalance) * 100).toFixed(2)
              : '0.00'}%
          </span>
        </div>

        <div className="mt-2">
          <div className={`text-xl font-bold font-mono tracking-tight ${
            isNetProfit ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isNetProfit ? '+' : '-'}${Math.abs(netDailyPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
            <span>Realized: {accountInfo.dayClosedPnL >= 0 ? '+' : ''}${accountInfo.dayClosedPnL.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Floating P&L & Open Positions */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Floating P&L
          </span>
          <span className="text-[11px] font-semibold text-slate-300">
            {positions.length} {positions.length === 1 ? 'Trade' : 'Trades'}
          </span>
        </div>

        <div className="mt-2">
          <div className={`text-xl font-bold font-mono tracking-tight ${
            floatingPnL === 0
              ? 'text-slate-300'
              : isFloatingProfit
                ? 'text-emerald-400'
                : 'text-red-400'
          }`}>
            {floatingPnL > 0 ? '+' : floatingPnL < 0 ? '-' : ''}
            ${Math.abs(floatingPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Margin Used: ${accountInfo.margin.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Card 4: Trailing Drawdown */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Peak Drawdown
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Peak: ${accountInfo.peakDailyEquity.toFixed(0)}
          </span>
        </div>

        <div className="mt-2">
          <div className={`text-xl font-bold font-mono tracking-tight ${
            trailingDrawdownAmount > 0 ? 'text-amber-400' : 'text-slate-300'
          }`}>
            -${trailingDrawdownAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Drawdown: {trailingDrawdownPct.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

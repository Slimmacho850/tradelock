import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  MT5AccountInfo,
  MT5Position,
  GuardianRules,
  LockState,
  LogEntry,
  MetaApiConfig
} from '../types/guardian';
import {
  storageService,
  defaultRules,
  defaultLockState
} from '../services/storageService';
import { metaApiService } from '../services/metaApiService';
import { audioHaptics } from '../services/audioHaptics';

interface GuardianContextType {
  // States
  accountInfo: MT5AccountInfo;
  positions: MT5Position[];
  rules: GuardianRules;
  lockState: LockState;
  logs: LogEntry[];
  metaConfig: MetaApiConfig;
  isDemoMode: boolean;
  isLoading: boolean;
  isConnected: boolean;
  lastSyncTime: string;

  // Real-time calculated metrics
  floatingPnL: number;
  netDailyPnL: number;
  dailyLossAmount: number;
  dailyLossPct: number;
  dailyProfitAmount: number;
  dailyProfitPct: number;
  trailingDrawdownAmount: number;
  trailingDrawdownPct: number;
  totalTradesToday: number;
  timeRemainingSeconds: number;

  // Actions
  updateRules: (newRules: Partial<GuardianRules>) => void;
  updateMetaConfig: (newConfig: Partial<MetaApiConfig>) => void;
  setIsDemoMode: (isDemo: boolean) => void;
  triggerEmergencyLock: () => Promise<void>;
  unlockAccount: (overrideStrict?: boolean) => boolean;
  closePositionManual: (positionId: string) => Promise<void>;
  closeAllPositionsManual: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearLogs: () => void;

  // Simulation Actions
  simulateAddTrade: (symbol?: string, type?: 'POSITION_TYPE_BUY' | 'POSITION_TYPE_SELL') => void;
  simulatePnLChange: (delta: number) => void;
  simulateTriggerLossLimit: () => void;
  simulateTriggerProfitTarget: () => void;
  resetSimulationDay: () => void;
}

const GuardianContext = createContext<GuardianContextType | null>(null);

const DEMO_ACCOUNT_INITIAL: MT5AccountInfo = {
  id: 'mt5-demo-782941',
  name: 'Prop Trader Live',
  broker: 'MetaQuotes Cloud (Demo)',
  currency: 'USD',
  server: 'MetaQuotes-Demo',
  balance: 10000.00,
  equity: 10000.00,
  margin: 120.00,
  freeMargin: 9880.00,
  leverage: 100,
  startingDailyBalance: 10000.00,
  peakDailyEquity: 10000.00,
  dayClosedPnL: 0.00,
  dayTradesCount: 2
};

const INITIAL_DEMO_POSITIONS: MT5Position[] = [
  {
    id: 'pos-101',
    symbol: 'XAUUSD',
    type: 'POSITION_TYPE_BUY',
    volume: 0.5,
    openPrice: 2645.20,
    currentPrice: 2646.80,
    profit: 80.00,
    time: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'pos-102',
    symbol: 'EURUSD',
    type: 'POSITION_TYPE_SELL',
    volume: 1.0,
    openPrice: 1.0850,
    currentPrice: 1.0855,
    profit: -50.00,
    time: new Date(Date.now() - 1800000).toISOString()
  }
];

export const GuardianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<GuardianRules>(storageService.getRules);
  const [metaConfig, setMetaConfig] = useState<MetaApiConfig>(storageService.getMetaApiConfig);
  const [lockState, setLockState] = useState<LockState>(storageService.getLockState);
  const [logs, setLogs] = useState<LogEntry[]>(storageService.getLogs);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(storageService.getDemoMode);
  
  const [accountInfo, setAccountInfo] = useState<MT5AccountInfo>(DEMO_ACCOUNT_INITIAL);
  const [positions, setPositions] = useState<MT5Position[]>(INITIAL_DEMO_POSITIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  const lockStateRef = useRef(lockState);
  lockStateRef.current = lockState;
  const rulesRef = useRef(rules);
  rulesRef.current = rules;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const addLog = useCallback((type: LogEntry['type'], message: string, details?: Record<string, any>) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    };
    setLogs((prev) => {
      const updated = [entry, ...prev].slice(0, 150);
      storageService.saveLogs(updated);
      return updated;
    });
  }, []);

  // Sync state to storage
  const updateRules = (newRules: Partial<GuardianRules>) => {
    setRules((prev) => {
      const updated = { ...prev, ...newRules };
      storageService.saveRules(updated);
      return updated;
    });
    addLog('INFO', 'Guardrail rules updated.');
  };

  const updateMetaConfig = (newConfig: Partial<MetaApiConfig>) => {
    setMetaConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      storageService.saveMetaApiConfig(updated);
      return updated;
    });
    addLog('INFO', 'MetaApi configuration updated.');
  };

  const setIsDemoMode = (isDemo: boolean) => {
    setIsDemoModeState(isDemo);
    storageService.saveDemoMode(isDemo);
    addLog('INFO', `Switched to ${isDemo ? 'Simulation / Demo' : 'Live MetaApi'} mode.`);
  };

  // Calculate live floating P&L
  const floatingPnL = positions.reduce((acc, pos) => acc + (pos.profit || 0), 0);
  
  // Update Equity & Peak Equity dynamically
  useEffect(() => {
    const currentEquity = accountInfo.balance + floatingPnL;
    setAccountInfo((prev) => {
      const newPeak = Math.max(prev.peakDailyEquity, currentEquity);
      return {
        ...prev,
        equity: currentEquity,
        peakDailyEquity: newPeak,
        freeMargin: Math.max(0, currentEquity - prev.margin)
      };
    });
  }, [floatingPnL, accountInfo.balance]);

  // Derived metrics
  const netDailyPnL = accountInfo.dayClosedPnL + floatingPnL;
  
  const dailyLossAmount = netDailyPnL < 0 ? Math.abs(netDailyPnL) : 0;
  const dailyLossPct = accountInfo.startingDailyBalance > 0
    ? (dailyLossAmount / accountInfo.startingDailyBalance) * 100
    : 0;

  const dailyProfitAmount = netDailyPnL > 0 ? netDailyPnL : 0;
  const dailyProfitPct = accountInfo.startingDailyBalance > 0
    ? (dailyProfitAmount / accountInfo.startingDailyBalance) * 100
    : 0;

  const trailingDrawdownAmount = Math.max(0, accountInfo.peakDailyEquity - accountInfo.equity);
  const trailingDrawdownPct = accountInfo.peakDailyEquity > 0
    ? (trailingDrawdownAmount / accountInfo.peakDailyEquity) * 100
    : 0;

  const totalTradesToday = accountInfo.dayTradesCount + positions.length;

  // Calculate lock expiration target
  const calculateLockExpiry = useCallback((): string => {
    const now = new Date();
    if (rules.lockUntilMidnightUtc) {
      const midnightUtc = new Date(now);
      midnightUtc.setUTCHours(24, 0, 0, 0); // 00:00 UTC next day
      return midnightUtc.toISOString();
    } else {
      const durationMs = (rules.lockDurationHours || 12) * 3600 * 1000;
      return new Date(now.getTime() + durationMs).toISOString();
    }
  }, [rules.lockUntilMidnightUtc, rules.lockDurationHours]);

  // Execute Lock Protocol
  const executeLockProtocol = useCallback(async (reason: string, metric?: string) => {
    if (lockStateRef.current.isLocked) return;

    const unlocksAt = calculateLockExpiry();
    const newLockState: LockState = {
      isLocked: true,
      reason,
      lockedAt: new Date().toISOString(),
      unlocksAt,
      violatingMetric: metric,
      autoLiquidatedCount: 0,
      rejectedTradesCount: 0
    };

    setLockState(newLockState);
    storageService.saveLockState(newLockState);

    // Audio siren & haptic vibrations
    audioHaptics.playLockAlarm();

    addLog('LOCK', `🔒 ACCOUNT LOCKED: ${reason}`, { metric, unlocksAt });

    // Step 1: Auto Liquidate Open Positions if enabled
    if (rulesRef.current.autoLiquidateOpenPositions && positionsRef.current.length > 0) {
      const currentPositions = [...positionsRef.current];
      addLog('LIQUIDATION', `Liquidating ${currentPositions.length} active positions immediately...`);
      
      if (!isDemoMode && metaConfig.token && metaConfig.accountId) {
        try {
          const closed = await metaApiService.closeAllPositions(
            metaConfig,
            currentPositions,
            `[LOCKED: ${reason}]`
          );
          newLockState.autoLiquidatedCount = closed;
        } catch (e: any) {
          addLog('BREACH', `Failed to close some positions via MetaApi: ${e?.message || e}`);
        }
      } else {
        // Simulation mode liquidation
        let closedPnLDelta = 0;
        currentPositions.forEach((p) => {
          closedPnLDelta += p.profit;
        });
        
        setAccountInfo((prev) => ({
          ...prev,
          balance: prev.balance + closedPnLDelta,
          dayClosedPnL: prev.dayClosedPnL + closedPnLDelta,
          dayTradesCount: prev.dayTradesCount + currentPositions.length,
          margin: 0
        }));
        setPositions([]);
        newLockState.autoLiquidatedCount = currentPositions.length;
      }

      audioHaptics.playTradeLiquidatedSound();
      setLockState({ ...newLockState });
      storageService.saveLockState(newLockState);
      addLog('LIQUIDATION', `Closed all ${currentPositions.length} open positions.`);
    }
  }, [addLog, calculateLockExpiry, isDemoMode, metaConfig]);

  // Emergency Lock Trigger (Manual from phone)
  const triggerEmergencyLock = async () => {
    audioHaptics.tapFeedback();
    await executeLockProtocol('Emergency Kill Switch activated manually from phone', 'MANUAL');
  };

  // Unlock Account
  const unlockAccount = (overrideStrict: boolean = false): boolean => {
    audioHaptics.tapFeedback();
    if (lockState.isLocked && rules.strictMode && !overrideStrict) {
      const now = new Date();
      if (lockState.unlocksAt && new Date(lockState.unlocksAt) > now) {
        addLog('WARNING', 'Unlock blocked: Strict Mode is active until lock duration finishes.');
        return false;
      }
    }

    const resetState: LockState = {
      isLocked: false,
      reason: null,
      lockedAt: null,
      unlocksAt: null,
      autoLiquidatedCount: 0,
      rejectedTradesCount: 0
    };

    setLockState(resetState);
    storageService.saveLockState(resetState);
    audioHaptics.playSuccessChime();
    addLog('UNLOCK', 'Account unlocked. Trading monitor resumed.');
    return true;
  };

  // Close single position manually
  const closePositionManual = async (positionId: string) => {
    audioHaptics.tapFeedback();
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    if (!isDemoMode && metaConfig.token && metaConfig.accountId) {
      try {
        await metaApiService.closePosition(metaConfig, positionId, 'Manual close from Guardian app');
      } catch (e: any) {
        addLog('WARNING', `Error closing position #${positionId}: ${e?.message}`);
        return;
      }
    }

    // Update state
    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    setAccountInfo((prev) => ({
      ...prev,
      balance: prev.balance + pos.profit,
      dayClosedPnL: prev.dayClosedPnL + pos.profit,
      dayTradesCount: prev.dayTradesCount + 1,
      margin: Math.max(0, prev.margin - 60)
    }));
    audioHaptics.playTradeLiquidatedSound();
    addLog('INFO', `Closed position #${positionId} (${pos.symbol}) for $${pos.profit.toFixed(2)}.`);
  };

  // Close all positions manually
  const closeAllPositionsManual = async () => {
    audioHaptics.tapFeedback();
    if (positions.length === 0) return;

    if (!isDemoMode && metaConfig.token && metaConfig.accountId) {
      await metaApiService.closeAllPositions(metaConfig, positions, 'Close all from Guardian app');
    }

    let closedProfit = 0;
    positions.forEach((p) => { closedProfit += p.profit; });

    setAccountInfo((prev) => ({
      ...prev,
      balance: prev.balance + closedProfit,
      dayClosedPnL: prev.dayClosedPnL + closedProfit,
      dayTradesCount: prev.dayTradesCount + positions.length,
      margin: 0
    }));
    setPositions([]);
    audioHaptics.playTradeLiquidatedSound();
    addLog('INFO', `Closed all ${positions.length} open positions.`);
  };

  // Live MetaApi Data Synchronization
  const refreshData = useCallback(async () => {
    if (isDemoMode) {
      setLastSyncTime(new Date().toLocaleTimeString());
      return;
    }

    if (!metaConfig.token || !metaConfig.accountId) {
      setIsConnected(false);
      return;
    }

    try {
      setIsLoading(true);
      const [accInfo, livePositions, deals] = await Promise.all([
        metaApiService.getAccountInformation(metaConfig),
        metaApiService.getPositions(metaConfig),
        metaApiService.getDailyDeals(metaConfig)
      ]);

      setAccountInfo((prev) => ({
        ...prev,
        ...accInfo,
        dayClosedPnL: deals.closedPnL,
        dayTradesCount: deals.tradeCount,
        startingDailyBalance: prev.startingDailyBalance || (accInfo.balance ?? 10000)
      }));

      setPositions(livePositions);
      setIsConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
      setIsConnected(false);
      console.error('Sync error', e);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, metaConfig]);

  // Real-time Guardian Watchdog (Checks every 1.5s)
  useEffect(() => {
    const watchdogInterval = setInterval(() => {
      const currentLock = lockStateRef.current;
      const currentRules = rulesRef.current;
      const currentPos = positionsRef.current;

      // 1. Check countdown timer expiration
      if (currentLock.isLocked && currentLock.unlocksAt) {
        const remaining = Math.max(0, Math.floor((new Date(currentLock.unlocksAt).getTime() - Date.now()) / 1000));
        setTimeRemainingSeconds(remaining);
        if (remaining <= 0) {
          unlockAccount(true);
          return;
        }
      }

      // 2. ENFORCEMENT WATCHDOG WHILE LOCKED:
      // If locked, immediately kill any new trade that appeared!
      if (currentLock.isLocked && currentRules.autoKillNewTradesWhileLocked && currentPos.length > 0) {
        addLog('REJECTED_TRADE', `🚨 AUTO-KILL: Detected ${currentPos.length} trade(s) while account is locked! Instant liquidation...`);
        audioHaptics.playTradeLiquidatedSound();

        if (!isDemoMode && metaConfig.token && metaConfig.accountId) {
          metaApiService.closeAllPositions(
            metaConfig,
            currentPos,
            '[LOCKED: Trade Kill Switch Enforced]'
          );
        }

        setPositions([]);
        setLockState((prev) => {
          const updated = {
            ...prev,
            rejectedTradesCount: prev.rejectedTradesCount + currentPos.length
          };
          storageService.saveLockState(updated);
          return updated;
        });
        return;
      }

      // 3. CRITERIA CHECKING (When NOT locked)
      if (!currentLock.isLocked) {
        // Criterion 1: Daily Max Loss Limit
        if (currentRules.dailyLossLimitEnabled) {
          const limitBreached = currentRules.dailyLossLimitType === 'currency'
            ? dailyLossAmount >= currentRules.dailyLossLimitValue
            : dailyLossPct >= currentRules.dailyLossLimitValue;

          if (limitBreached) {
            executeLockProtocol(
              `Daily Max Loss Limit Exceeded (-$${dailyLossAmount.toFixed(2)} / ${dailyLossPct.toFixed(1)}%)`,
              'DAILY_LOSS'
            );
            return;
          }

          // Warning chime when nearing loss limit (>80%)
          const lossRatio = currentRules.dailyLossLimitType === 'currency'
            ? dailyLossAmount / currentRules.dailyLossLimitValue
            : dailyLossPct / currentRules.dailyLossLimitValue;
          if (lossRatio > 0.8 && lossRatio < 1.0) {
            audioHaptics.playWarningChime();
          }
        }

        // Criterion 2: Daily Profit Target
        if (currentRules.profitTargetEnabled && dailyProfitAmount > 0) {
          const targetHit = currentRules.profitTargetType === 'currency'
            ? dailyProfitAmount >= currentRules.profitTargetValue
            : dailyProfitPct >= currentRules.profitTargetValue;

          if (targetHit) {
            audioHaptics.playSuccessChime();
            executeLockProtocol(
              `Daily Profit Target Reached (+$${dailyProfitAmount.toFixed(2)} / ${dailyProfitPct.toFixed(1)}%). Gains protected!`,
              'PROFIT_TARGET'
            );
            return;
          }
        }

        // Criterion 3: Max Trailing Drawdown from Peak Daily Equity
        if (currentRules.maxDrawdownEnabled) {
          const ddBreached = currentRules.maxDrawdownType === 'currency'
            ? trailingDrawdownAmount >= currentRules.maxDrawdownValue
            : trailingDrawdownPct >= currentRules.maxDrawdownValue;

          if (ddBreached && trailingDrawdownAmount > 0) {
            executeLockProtocol(
              `Max Trailing Drawdown Breached ($${trailingDrawdownAmount.toFixed(2)} / ${trailingDrawdownPct.toFixed(1)}% from peak $${accountInfo.peakDailyEquity.toFixed(2)})`,
              'TRAILING_DRAWDOWN'
            );
            return;
          }
        }

        // Criterion 4: Max Daily Trades (Anti-Revenge Trading)
        if (currentRules.maxDailyTradesEnabled) {
          if (totalTradesToday >= currentRules.maxDailyTradesValue) {
            executeLockProtocol(
              `Max Daily Trades Limit (${totalTradesToday}/${currentRules.maxDailyTradesValue}) reached. Cooling down.`,
              'MAX_TRADES'
            );
            return;
          }
        }
      }
    }, 1500);

    return () => clearInterval(watchdogInterval);
  }, [
    rules,
    lockState,
    dailyLossAmount,
    dailyLossPct,
    dailyProfitAmount,
    dailyProfitPct,
    trailingDrawdownAmount,
    trailingDrawdownPct,
    totalTradesToday,
    accountInfo.peakDailyEquity,
    executeLockProtocol,
    unlockAccount,
    addLog,
    isDemoMode,
    metaConfig
  ]);

  // Periodic polling for Live MetaApi (every 4 seconds)
  useEffect(() => {
    if (isDemoMode) return;
    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [isDemoMode, refreshData]);

  // Simulation Helpers
  const simulateAddTrade = (symbol: string = 'XAUUSD', type: 'POSITION_TYPE_BUY' | 'POSITION_TYPE_SELL' = 'POSITION_TYPE_BUY') => {
    audioHaptics.tapFeedback();
    const newPos: MT5Position = {
      id: `pos-${Date.now().toString().slice(-4)}`,
      symbol,
      type,
      volume: 0.5,
      openPrice: symbol === 'XAUUSD' ? 2640.00 : 1.0850,
      currentPrice: symbol === 'XAUUSD' ? 2640.00 : 1.0850,
      profit: 0.00,
      time: new Date().toISOString()
    };
    setPositions((prev) => [newPos, ...prev]);
    setAccountInfo((prev) => ({ ...prev, margin: prev.margin + 60 }));
    addLog('INFO', `Simulated trade opened: ${type === 'POSITION_TYPE_BUY' ? 'BUY' : 'SELL'} 0.5 ${symbol}`);
  };

  const simulatePnLChange = (delta: number) => {
    audioHaptics.tapFeedback();
    if (positions.length === 0) {
      simulateAddTrade();
    }
    setPositions((prev) => {
      if (prev.length === 0) return prev;
      const first = { ...prev[0], profit: prev[0].profit + delta };
      return [first, ...prev.slice(1)];
    });
  };

  const simulateTriggerLossLimit = () => {
    audioHaptics.tapFeedback();
    // Drop first position by loss limit amount + $10
    const lossTarget = rules.dailyLossLimitType === 'currency'
      ? rules.dailyLossLimitValue + 10
      : (rules.dailyLossLimitValue * accountInfo.startingDailyBalance) / 100 + 10;
    
    if (positions.length === 0) {
      simulateAddTrade('XAUUSD', 'POSITION_TYPE_BUY');
    }
    setPositions((prev) => [
      {
        id: `pos-loss-${Date.now().toString().slice(-3)}`,
        symbol: 'XAUUSD',
        type: 'POSITION_TYPE_BUY',
        volume: 1.0,
        openPrice: 2650.00,
        currentPrice: 2620.00,
        profit: -Math.abs(lossTarget),
        time: new Date().toISOString()
      }
    ]);
    addLog('WARNING', `Simulated market drop: position in loss by -$${lossTarget.toFixed(2)}`);
  };

  const simulateTriggerProfitTarget = () => {
    audioHaptics.tapFeedback();
    const profitTarget = rules.profitTargetType === 'currency'
      ? rules.profitTargetValue + 15
      : (rules.profitTargetValue * accountInfo.startingDailyBalance) / 100 + 15;

    setPositions((prev) => [
      {
        id: `pos-win-${Date.now().toString().slice(-3)}`,
        symbol: 'US30',
        type: 'POSITION_TYPE_BUY',
        volume: 2.0,
        openPrice: 42000.00,
        currentPrice: 42200.00,
        profit: profitTarget,
        time: new Date().toISOString()
      }
    ]);
    addLog('INFO', `Simulated winning rally: position in profit by +$${profitTarget.toFixed(2)}`);
  };

  const resetSimulationDay = () => {
    audioHaptics.tapFeedback();
    setAccountInfo(DEMO_ACCOUNT_INITIAL);
    setPositions(INITIAL_DEMO_POSITIONS);
    unlockAccount(true);
    addLog('INFO', 'Simulation day reset to initial starting balance ($10,000).');
  };

  const clearLogs = () => {
    setLogs([]);
    storageService.saveLogs([]);
  };

  return (
    <GuardianContext.Provider
      value={{
        accountInfo,
        positions,
        rules,
        lockState,
        logs,
        metaConfig,
        isDemoMode,
        isLoading,
        isConnected,
        lastSyncTime,
        floatingPnL,
        netDailyPnL,
        dailyLossAmount,
        dailyLossPct,
        dailyProfitAmount,
        dailyProfitPct,
        trailingDrawdownAmount,
        trailingDrawdownPct,
        totalTradesToday,
        timeRemainingSeconds,
        updateRules,
        updateMetaConfig,
        setIsDemoMode,
        triggerEmergencyLock,
        unlockAccount,
        closePositionManual,
        closeAllPositionsManual,
        refreshData,
        clearLogs,
        simulateAddTrade,
        simulatePnLChange,
        simulateTriggerLossLimit,
        simulateTriggerProfitTarget,
        resetSimulationDay
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
};

export const useGuardian = () => {
  const ctx = useContext(GuardianContext);
  if (!ctx) throw new Error('useGuardian must be used within a GuardianProvider');
  return ctx;
};

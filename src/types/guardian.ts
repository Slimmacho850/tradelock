export interface MT5AccountInfo {
  id: string;
  name: string;
  broker: string;
  currency: string;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  startingDailyBalance: number; // For daily loss % & $ calculation
  peakDailyEquity: number; // For trailing drawdown calculation
  dayClosedPnL: number; // Realized P&L today
  dayTradesCount: number; // Number of trades closed today
}

export interface MT5Position {
  id: string;
  symbol: string;
  type: 'POSITION_TYPE_BUY' | 'POSITION_TYPE_SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  time: string;
  comment?: string;
}

export interface GuardianRules {
  // Criterion 1: Daily Max Loss Limit
  dailyLossLimitEnabled: boolean;
  dailyLossLimitType: 'currency' | 'percent';
  dailyLossLimitValue: number; // e.g. $250 or 3%

  // Criterion 2: Daily Profit Target
  profitTargetEnabled: boolean;
  profitTargetType: 'currency' | 'percent';
  profitTargetValue: number; // e.g. $500 or 5%

  // Criterion 3: Max Trailing Drawdown from peak daily equity
  maxDrawdownEnabled: boolean;
  maxDrawdownType: 'currency' | 'percent';
  maxDrawdownValue: number; // e.g. $300 or 4%

  // Criterion 4: Max Daily Trades (anti-overtrading / anti-revenge)
  maxDailyTradesEnabled: boolean;
  maxDailyTradesValue: number; // e.g. 5 trades

  // Criterion 5: Emergency Lock
  emergencyLockEnabled: boolean;

  // Lock Protocol Configuration
  lockDurationHours: number; // e.g. 12 hours, or until next day
  lockUntilMidnightUtc: boolean; // lock until 00:00 UTC
  strictMode: boolean; // cannot be unlocked manually once triggered until cooldown finishes!
  autoLiquidateOpenPositions: boolean; // close all open positions immediately upon lock
  cancelPendingOrders: boolean; // cancel all limits/stops
  autoKillNewTradesWhileLocked: boolean; // immediately close any trade opened from MT5 mobile app
}

export interface LockState {
  isLocked: boolean;
  reason: string | null;
  lockedAt: string | null;
  unlocksAt: string | null;
  violatingMetric?: string;
  autoLiquidatedCount: number;
  rejectedTradesCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'BREACH' | 'LOCK' | 'UNLOCK' | 'LIQUIDATION' | 'REJECTED_TRADE';
  message: string;
  details?: Record<string, any>;
}

export interface MetaApiConfig {
  token: string;
  accountId: string;
  region: 'new-york' | 'london' | 'singapore' | 'tokyo' | 'germany';
}

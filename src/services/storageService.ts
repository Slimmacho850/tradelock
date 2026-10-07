import { GuardianRules, MetaApiConfig, LockState, LogEntry, MT5AccountInfo } from '../types/guardian';

const STORAGE_KEYS = {
  RULES: 'mt5_guardian_rules_v1',
  META_API: 'mt5_guardian_meta_api_v1',
  LOCK_STATE: 'mt5_guardian_lock_state_v1',
  LOGS: 'mt5_guardian_logs_v1',
  ACCOUNT_BASE: 'mt5_guardian_account_base_v1',
  DEMO_MODE: 'mt5_guardian_demo_mode_v1'
};

export const defaultRules: GuardianRules = {
  dailyLossLimitEnabled: true,
  dailyLossLimitType: 'currency',
  dailyLossLimitValue: 200, // $200 default daily loss limit

  profitTargetEnabled: true,
  profitTargetType: 'currency',
  profitTargetValue: 400, // $400 default profit target

  maxDrawdownEnabled: true,
  maxDrawdownType: 'percent',
  maxDrawdownValue: 3.5, // 3.5% trailing drawdown from peak daily equity

  maxDailyTradesEnabled: true,
  maxDailyTradesValue: 6, // 6 max trades per day

  emergencyLockEnabled: true,

  lockDurationHours: 12,
  lockUntilMidnightUtc: true,
  strictMode: false,
  autoLiquidateOpenPositions: true,
  cancelPendingOrders: true,
  autoKillNewTradesWhileLocked: true
};

export const defaultLockState: LockState = {
  isLocked: false,
  reason: null,
  lockedAt: null,
  unlocksAt: null,
  autoLiquidatedCount: 0,
  rejectedTradesCount: 0
};

export const storageService = {
  getRules(): GuardianRules {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      return data ? { ...defaultRules, ...JSON.parse(data) } : defaultRules;
    } catch {
      return defaultRules;
    }
  },

  saveRules(rules: GuardianRules) {
    try {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    } catch (e) {
      console.error(e);
    }
  },

  getMetaApiConfig(): MetaApiConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.META_API);
      return data ? JSON.parse(data) : { token: '', accountId: '', region: 'new-york' };
    } catch {
      return { token: '', accountId: '', region: 'new-york' };
    }
  },

  saveMetaApiConfig(config: MetaApiConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.META_API, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  },

  getLockState(): LockState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCK_STATE);
      return data ? { ...defaultLockState, ...JSON.parse(data) } : defaultLockState;
    } catch {
      return defaultLockState;
    }
  },

  saveLockState(state: LockState) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCK_STATE, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  },

  getLogs(): LogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLogs(logs: LogEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(-150))); // Keep last 150
    } catch (e) {
      console.error(e);
    }
  },

  getDemoMode(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      return val === null ? true : val === 'true'; // Default to Demo Mode so user can test immediately!
    } catch {
      return true;
    }
  },

  saveDemoMode(isDemo: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(isDemo));
    } catch (e) {
      console.error(e);
    }
  }
};

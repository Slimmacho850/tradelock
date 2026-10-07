/**
 * MT5 Lock Guardian - 24/7 Cloud Sentinel & Web Service
 * 
 * Runs 24/7 in the cloud (e.g. Render, Railway, VPS) with ZERO COMPUTER NEEDED.
 * 
 * Works even when:
 *   - Your phone screen is OFF
 *   - Your phone is locked or in your pocket
 *   - The mobile app is closed
 *   - Your phone battery is dead
 * 
 * Features:
 *   1. 24/7 Watchdog: Checks MetaApi MT5 every 2 seconds in the cloud.
 *   2. Auto-Liquidation: Closes all positions if daily loss limit / profit target / drawdown is reached.
 *   3. Auto-Kill: Kills any trade opened from MT5 mobile app while locked.
 *   4. Telegram Alerts: Sends instant push notifications directly to your phone.
 *   5. Web Server: Serves the mobile dashboard and API for phone control.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Configuration with environment variable overrides
const CONFIG = {
  port: parseInt(process.env.PORT || '3001'),
  token: process.env.META_API_TOKEN || '',
  accountId: process.env.META_API_ACCOUNT_ID || '',
  region: process.env.META_API_REGION || 'new-york',
  dailyLossLimit: parseFloat(process.env.DAILY_LOSS_LIMIT || '200'),
  profitTarget: parseFloat(process.env.DAILY_PROFIT_TARGET || '400'),
  maxTrailingDD: parseFloat(process.env.MAX_TRAILING_DD || '300'),
  maxDailyTrades: parseInt(process.env.MAX_DAILY_TRADES || '6'),
  strictMode: process.env.STRICT_MODE === 'true' || true,
  checkIntervalMs: 2000,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
};

const BASE_URL = `https://mt-client-api-v1.${CONFIG.region}.agiliumtrade.ai`;

// In-Memory Cloud State
const STATE = {
  isLocked: false,
  lockReason: null,
  lockedAt: null,
  unlocksAt: null,
  liquidatedCount: 0,
  killedTradesCount: 0,
  startingDailyBalance: 0,
  peakDailyEquity: 0,
  lastCheckedAt: new Date().toISOString(),
  accountInfo: {
    balance: 10000,
    equity: 10000,
    freeMargin: 10000,
    currency: 'USD',
    broker: 'Connecting...'
  },
  positions: []
};

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [CLOUD-SENTINEL] ${msg}`);
}

// Send Instant Telegram Push Notification to phone
async function sendTelegramAlert(message) {
  if (!CONFIG.telegramToken || !CONFIG.telegramChatId) return;
  try {
    const url = `https://api.telegram.org/bot${CONFIG.telegramToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CONFIG.telegramChatId,
        text: `🛡️ MT5 RISK GUARDIAN (Cloud Alert):\n\n${message}`,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error('Telegram notification error:', e.message);
  }
}

// MetaApi REST Request Helper
async function metaFetch(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}/users/current/accounts/${CONFIG.accountId}${endpoint}`;
  const options = {
    method,
    headers: {
      'auth-token': CONFIG.token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MetaApi [${res.status}]: ${text}`);
  }
  return await res.json();
}

// Emergency close all positions
async function closeAllPositions(positions, comment) {
  log(`🚨 LIQUIDATING ${positions.length} OPEN POSITIONS: ${comment}`);
  let closed = 0;
  for (const pos of positions) {
    try {
      await metaFetch('/trade', 'POST', {
        actionType: 'POSITION_CLOSE_ID',
        positionId: String(pos.id),
        comment: `[LOCK: ${comment}]`
      });
      closed++;
      log(`Closed position #${pos.id} (${pos.symbol} ${pos.volume} lots)`);
    } catch (e) {
      console.error(`Failed to close #${pos.id}:`, e.message);
    }
  }
  return closed;
}

// Cancel all pending orders
async function cancelAllOrders(orders) {
  for (const ord of orders) {
    try {
      await metaFetch('/trade', 'POST', {
        actionType: 'ORDER_CANCEL',
        orderId: String(ord.id)
      });
      log(`Cancelled order #${ord.id}`);
    } catch (e) {
      console.error(`Failed to cancel order #${ord.id}:`, e.message);
    }
  }
}

// Trigger Lock Protocol
async function triggerLock(reason, currentPositions = [], currentOrders = []) {
  if (STATE.isLocked) return;

  STATE.isLocked = true;
  STATE.lockReason = reason;
  STATE.lockedAt = new Date().toISOString();

  // Midnight UTC unlock time
  const now = new Date();
  const midnightUtc = new Date(now);
  midnightUtc.setUTCHours(24, 0, 0, 0);
  STATE.unlocksAt = midnightUtc.toISOString();

  log(`🔒 ACCOUNT LOCKED! Reason: ${reason}`);
  log(`Cooldown active until: ${STATE.unlocksAt}`);

  // Send push alert to phone
  await sendTelegramAlert(
    `<b>🔒 ACCOUNT LOCKED OUT</b>\n` +
    `<b>Reason:</b> ${reason}\n` +
    `<b>Positions Liquidated:</b> ${currentPositions.length}\n` +
    `<b>Cooldown until:</b> ${midnightUtc.toUTCString()}\n\n` +
    `<i>Any trade opened on your MT5 mobile app will be killed immediately.</i>`
  );

  // Close open positions
  if (currentPositions && currentPositions.length > 0) {
    const closed = await closeAllPositions(currentPositions, reason);
    STATE.liquidatedCount += closed;
  }

  // Cancel orders
  if (currentOrders && currentOrders.length > 0) {
    await cancelAllOrders(currentOrders);
  }
}

// 24/7 Autonomous Sentinel Loop
async function sentinelWatchdog() {
  if (!CONFIG.token || !CONFIG.accountId) {
    // Waiting for credentials
    return;
  }

  try {
    STATE.lastCheckedAt = new Date().toISOString();

    // 1. Check if cooldown has finished
    if (STATE.isLocked && STATE.unlocksAt && new Date() >= new Date(STATE.unlocksAt)) {
      STATE.isLocked = false;
      STATE.lockReason = null;
      STATE.unlocksAt = null;
      log('🔓 Cooldown expired. Account unlocked and guardrails resumed.');
      await sendTelegramAlert('<b>🔓 Account Unlocked</b>\nTrading guardrails active.');
    }

    // 2. Fetch live status from MetaApi cloud
    const [account, livePositions, orders] = await Promise.all([
      metaFetch('/accountInformation'),
      metaFetch('/positions'),
      metaFetch('/orders')
    ]);

    STATE.accountInfo = account;
    STATE.positions = livePositions;

    const balance = account.balance || 0;
    const equity = account.equity || balance;

    if (STATE.startingDailyBalance === 0) STATE.startingDailyBalance = balance;
    if (equity > STATE.peakDailyEquity) STATE.peakDailyEquity = equity;

    const netDailyPnL = equity - STATE.startingDailyBalance;
    const trailingDD = Math.max(0, STATE.peakDailyEquity - equity);

    // 3. WATCHDOG WHILE LOCKED: Instantly kill any trade opened!
    if (STATE.isLocked && livePositions.length > 0) {
      log(`🚨 AUTO-KILL: Detected ${livePositions.length} trade(s) while locked! Immediate liquidation...`);
      const killed = await closeAllPositions(livePositions, 'Auto-Kill Locked Account');
      STATE.killedTradesCount += killed;
      await sendTelegramAlert(`🚨 <b>AUTO-KILL EXECUTED:</b> Closed ${killed} trade(s) opened while locked!`);
      return;
    }

    // 4. CHECK RULES (when not locked)
    if (!STATE.isLocked) {
      // Rule 1: Daily Max Loss Limit
      if (CONFIG.dailyLossLimit > 0 && netDailyPnL <= -CONFIG.dailyLossLimit) {
        await triggerLock(`Daily Max Loss Limit hit (-$${Math.abs(netDailyPnL).toFixed(2)} >= $${CONFIG.dailyLossLimit})`, livePositions, orders);
        return;
      }

      // Rule 2: Daily Profit Target
      if (CONFIG.profitTarget > 0 && netDailyPnL >= CONFIG.profitTarget) {
        await triggerLock(`Daily Profit Target reached (+$${netDailyPnL.toFixed(2)} >= $${CONFIG.profitTarget}). Gains protected!`, livePositions, orders);
        return;
      }

      // Rule 3: Trailing Drawdown
      if (CONFIG.maxTrailingDD > 0 && trailingDD >= CONFIG.maxTrailingDD) {
        await triggerLock(`Max Trailing Drawdown breached (-$${trailingDD.toFixed(2)} from peak $${STATE.peakDailyEquity.toFixed(2)})`, livePositions, orders);
        return;
      }
    }
  } catch (err) {
    // MetaApi temporary error or rate limit
    if (!err.message.includes('429')) {
      console.error('Sentinel loop warning:', err.message);
    }
  }
}

// Start Sentinel 2-second background timer
setInterval(sentinelWatchdog, CONFIG.checkIntervalMs);

// Helper for MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// HTTP Server: Serves UI & Remote Control API
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, auth-token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // API Endpoints
  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      state: STATE,
      config: {
        dailyLossLimit: CONFIG.dailyLossLimit,
        profitTarget: CONFIG.profitTarget,
        maxTrailingDD: CONFIG.maxTrailingDD,
        region: CONFIG.region,
        hasToken: Boolean(CONFIG.token),
        hasAccountId: Boolean(CONFIG.accountId)
      }
    }));
    return;
  }

  // Emergency Lock from Phone
  if (url.pathname === '/api/lock' && req.method === 'POST') {
    await triggerLock('Manual Emergency Lock from Phone', STATE.positions, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, state: STATE }));
    return;
  }

  // Update Config from Phone
  if (url.pathname === '/api/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.token) CONFIG.token = data.token;
        if (data.accountId) CONFIG.accountId = data.accountId;
        if (data.region) CONFIG.region = data.region;
        if (data.dailyLossLimit) CONFIG.dailyLossLimit = parseFloat(data.dailyLossLimit);
        if (data.profitTarget) CONFIG.profitTarget = parseFloat(data.profitTarget);
        if (data.maxTrailingDD) CONFIG.maxTrailingDD = parseFloat(data.maxTrailingDD);
        if (data.telegramToken) CONFIG.telegramToken = data.telegramToken;
        if (data.telegramChatId) CONFIG.telegramChatId = data.telegramChatId;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, config: CONFIG }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Health check endpoint (keeps Render/Railway cloud alive)
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', isLocked: STATE.isLocked }));
    return;
  }

  // Static File Serving (Mobile App Dashboard)
  let filePath = path.join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('MT5 Risk Guardian: Build frontend first (npm run build)');
  }
});

server.listen(CONFIG.port, '0.0.0.0', () => {
  log(`🚀 Cloud Sentinel & Web Service active on port ${CONFIG.port}`);
  log(`Watching MT5 24/7 every ${CONFIG.checkIntervalMs}ms | Screen-off proof`);
});

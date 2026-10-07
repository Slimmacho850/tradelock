# MT5 Risk Guardian 🛡️🔒

An advanced discipline and account lockout mobile application designed for **MetaTrader 5 (MT5)**, running directly on your **Android phone**.

MT5 Risk Guardian continuously monitors your MT5 trading account in the cloud via MetaApi. The moment any of your risk criteria are breached, it automatically executes the **Lock Protocol**:
1. **Emergency Liquidation**: Market-closes all open positions instantly.
2. **Order Cancellation**: Cancels all pending limit and stop orders.
3. **Lockout Cooldown**: Locks your account until midnight (00:00 UTC) or for a configurable duration.
4. **Auto-Kill Watchdog**: If you try to open any new trade from your MT5 mobile app while locked, the watchdog detects and terminates it within seconds!

---

## ⚡ The 5 Guardrail Criteria

1. **Daily Maximum Loss Limit** (Currency or %): Locks your account if today's net loss hits your threshold (e.g., -$200 or 3%).
2. **Daily Profit Target** (Currency or %): Locks in your profits after hitting your target (e.g., +$400 or 5%) so you don't overtrade or give back gains.
3. **Trailing Drawdown from Peak Equity** (Currency or %): Locks your account if intraday equity retraces by a set amount from today's highest watermark.
4. **Max Daily Trades (Anti-Revenge Limit)**: Caps the number of trades allowed in a single day (e.g., max 5 trades/day).
5. **Manual Emergency Kill Switch**: A deliberate 1.5-second hold button directly on your phone to immediately flatten your account and walk away.

---

## 📱 How to Run and Install on Your Android Phone

The app is built as an **Android Progressive Web App (PWA)**, which installs directly from Google Chrome into a full-screen, standalone Android app with native haptics and alarms:

### Step 1: Start the App
On your computer or server:
```bash
cd "C:\Users\KWABENA YEBOAH\.gemini\antigravity\scratch\mt5-lock-guardian"
npm run dev
```
Vite will output a local network URL, e.g.:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.XX:5173/
```

### Step 2: Open in Android Chrome
1. Make sure your Android phone is connected to the same Wi-Fi network (or host it on a free service like Vercel/Render).
2. Open **Google Chrome** on your phone and navigate to `http://192.168.1.XX:5173/`.

### Step 3: Add to Home Screen
1. Tap the **3 dots (⋮)** in the top-right corner of Chrome.
2. Tap **"Install App"** (or **"Add to Home Screen"**).
3. The **MT5 Guardian** icon will now appear on your Android home screen right next to your MT5 app!
4. Launch it — it opens full-screen without any browser address bar.

---

## ☁️ Connecting to Live MT5 (100% Cloud, Zero PC Required)

MT5 Lock Guardian uses **MetaApi Cloud** (`metaapi.cloud`) to connect directly to the MetaTrader 5 server without needing a local Windows PC running:

1. Create a free account at [MetaApi](https://metaapi.cloud).
2. In the MetaApi dashboard, click **"Add Account"**:
   - Platform: **MetaTrader 5**
   - Account login & password
   - Server name (e.g. `ICMarketsSC-Live`, `FTMO-Server`, etc.)
3. Copy your **Account ID** and **API Token**.
4. Open the **Settings** tab in MT5 Risk Guardian on your phone, paste the credentials, and tap **Save Credentials**.
5. Switch the top toggle from **Simulator** to **Live Cloud**!

---

## 🤖 24/7 Background Cloud Sentinel Daemon

If you want your rules enforced even if your phone battery dies or the screen is off, run the included standalone daemon:

```bash
# In your terminal or hosted on Railway/Render/Koyeb
npm run sentinel
```

You can set environment variables in a `.env` file:
```env
META_API_TOKEN="your_token_here"
META_API_ACCOUNT_ID="your_account_id_here"
META_API_REGION="new-york"
DAILY_LOSS_LIMIT=200
DAILY_PROFIT_TARGET=400
MAX_TRAILING_DD=300
MAX_DAILY_TRADES=6
```

---

## 🔒 Strict Discipline Mode

Under the **Rules** tab, enabling **Strict Discipline Mode** disables the manual override unlock button while a lock timer is active. If you tilt or experience emotional regret after hitting your daily loss limit, you cannot bypass the lock until the cooldown time expires.

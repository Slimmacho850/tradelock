import { MT5AccountInfo, MT5Position, MetaApiConfig } from '../types/guardian';

export class MetaApiService {
  private getBaseUrl(region: string = 'new-york'): string {
    return `https://mt-client-api-v1.${region}.agiliumtrade.ai`;
  }

  private getHeaders(token: string) {
    return {
      'auth-token': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Fetch real-time account information
  async getAccountInformation(config: MetaApiConfig): Promise<Partial<MT5AccountInfo>> {
    const url = `${this.getBaseUrl(config.region)}/users/current/accounts/${config.accountId}/accountInformation`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(config.token)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`MetaApi Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return {
      id: config.accountId,
      name: data.name || 'MT5 Live Account',
      broker: data.broker || 'Connected Broker',
      currency: data.currency || 'USD',
      server: data.server || 'MetaTrader 5',
      balance: data.balance ?? 0,
      equity: data.equity ?? data.balance ?? 0,
      margin: data.margin ?? 0,
      freeMargin: data.freeMargin ?? data.equity ?? 0,
      leverage: data.leverage ?? 100
    };
  }

  // Fetch open positions
  async getPositions(config: MetaApiConfig): Promise<MT5Position[]> {
    const url = `${this.getBaseUrl(config.region)}/users/current/accounts/${config.accountId}/positions`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(config.token)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`MetaApi Positions Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return (data || []).map((pos: any) => ({
      id: String(pos.id),
      symbol: pos.symbol,
      type: pos.type === 'POSITION_TYPE_BUY' || pos.type === 0 ? 'POSITION_TYPE_BUY' : 'POSITION_TYPE_SELL',
      volume: pos.volume,
      openPrice: pos.openPrice,
      currentPrice: pos.currentPrice,
      profit: pos.profit ?? 0,
      time: pos.time || new Date().toISOString(),
      comment: pos.comment
    }));
  }

  // Close a specific open position
  async closePosition(config: MetaApiConfig, positionId: string, comment: string = 'LOCK: Rule Breached'): Promise<any> {
    const url = `${this.getBaseUrl(config.region)}/users/current/accounts/${config.accountId}/trade`;
    const body = {
      actionType: 'POSITION_CLOSE_ID',
      positionId: positionId,
      comment: comment
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(config.token),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to close position #${positionId}: ${err}`);
    }

    return await res.json();
  }

  // Emergency Liquidation: Close ALL open positions
  async closeAllPositions(config: MetaApiConfig, positions: MT5Position[], comment: string): Promise<number> {
    let closedCount = 0;
    for (const pos of positions) {
      try {
        await this.closePosition(config, pos.id, comment);
        closedCount++;
      } catch (e) {
        console.error(`Error closing position ${pos.id}`, e);
      }
    }
    return closedCount;
  }

  // Cancel a pending order
  async cancelOrder(config: MetaApiConfig, orderId: string): Promise<any> {
    const url = `${this.getBaseUrl(config.region)}/users/current/accounts/${config.accountId}/trade`;
    const body = {
      actionType: 'ORDER_CANCEL',
      orderId: orderId
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(config.token),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to cancel order #${orderId}: ${err}`);
    }

    return await res.json();
  }

  // Fetch closed deals today to calculate daily realized P&L and trade counts
  async getDailyDeals(config: MetaApiConfig): Promise<{ closedPnL: number; tradeCount: number }> {
    try {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const startTime = todayStart.toISOString();
      const endTime = new Date().toISOString();

      const url = `${this.getBaseUrl(config.region)}/users/current/accounts/${config.accountId}/history-deals/time/${encodeURIComponent(startTime)}/${encodeURIComponent(endTime)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(config.token)
      });

      if (!res.ok) {
        return { closedPnL: 0, tradeCount: 0 };
      }

      const deals = await res.json();
      let totalPnL = 0;
      let count = 0;

      if (Array.isArray(deals)) {
        for (const deal of deals) {
          // Entry out deals represent closed positions
          if (deal.entryType === 'DEAL_ENTRY_OUT' || deal.entryType === 1) {
            totalPnL += (deal.profit ?? 0) + (deal.swap ?? 0) + (deal.commission ?? 0);
            count++;
          }
        }
      }

      return { closedPnL: totalPnL, tradeCount: count };
    } catch (e) {
      console.warn('Deals history fetch error', e);
      return { closedPnL: 0, tradeCount: 0 };
    }
  }
}

export const metaApiService = new MetaApiService();

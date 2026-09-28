export function getUsMarketOverview(): Promise<{
  indices: Array<{
    symbol: string;
    name: string;
    providerName: string;
    exchange: string;
    price: number;
    change: number;
    changePercent: number;
    previousClose: number;
    currency: string;
    marketTime: number;
    quoteTime: number;
    timeZone: string;
    marketState: string;
    provider: string;
  }>;
  retrievedAt: string;
  provider: string;
  note: string;
}>;
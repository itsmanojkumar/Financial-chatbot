const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const cache = new Map();
const BENCHMARKS = [
  { symbol: "^GSPC", name: "S&P 500", exchange: "S&P Dow Jones Indices" },
  { symbol: "^IXIC", name: "Nasdaq Composite", exchange: "Nasdaq" },
  { symbol: "^DJI", name: "Dow Jones Industrial Average", exchange: "S&P Dow Jones Indices" },
  { symbol: "^RUT", name: "Russell 2000", exchange: "FTSE Russell" },
];

function getCached(key) {
  const hit = cache.get(key);
  return hit && hit.expiresAt > Date.now() ? hit.value : undefined;
}

async function fetchBenchmark(benchmark) {
  const cached = getCached(benchmark.symbol);
  if (cached) return cached;
  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(benchmark.symbol)}?range=1d&interval=1d`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; LedgerMind/1.0; public-market-summary)",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  const price = Number(meta?.regularMarketPrice);
  if (!meta || !Number.isFinite(price) || price <= 0) return null;

  const previousClose = Number(
    meta.chartPreviousClose ?? meta.previousClose ?? price,
  );
  const change = price - previousClose;
  const pointTimestamp = Number(result.timestamp?.at(-1) ?? meta.regularMarketTime);
  const quote = {
    symbol: benchmark.symbol,
    name: benchmark.name,
    providerName: meta.shortName || benchmark.name,
    exchange: benchmark.exchange,
    price,
    change,
    changePercent: previousClose ? (change / previousClose) * 100 : 0,
    previousClose,
    currency: meta.currency || "USD",
    marketTime: Number(meta.regularMarketTime ?? pointTimestamp),
    quoteTime: pointTimestamp,
    timeZone: meta.exchangeTimezoneName || "America/New_York",
    marketState: meta.marketState || "UNKNOWN",
    provider: "Yahoo Finance",
  };
  cache.set(benchmark.symbol, { value: quote, expiresAt: Date.now() + 60_000 });
  return quote;
}

export async function getUsMarketOverview() {
  const results = await Promise.allSettled(BENCHMARKS.map(fetchBenchmark));
  const indices = results.flatMap((result) =>
    result.status === "fulfilled" && result.value ? [result.value] : [],
  );
  return {
    indices,
    retrievedAt: new Date().toISOString(),
    provider: "Yahoo Finance chart data",
    note: "Indicative index data; timestamp and availability depend on the upstream quote feed. Not an exchange-controlled real-time feed.",
  };
}
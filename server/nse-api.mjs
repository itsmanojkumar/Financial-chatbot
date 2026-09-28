const NSE_COMPANY_LIST_URL =
  "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv";
const NSE_ANNOUNCEMENTS_URL =
  "https://nsearchives.nseindia.com/content/RSS/Online_announcements.xml";
const ANNOUNCEMENTS_PAGE =
  "https://www.nseindia.com/companies-listing/corporate-filings-announcements";
const NSE_INDICES_API = "https://www.nseindia.com/api/allIndices";
const NSE_EVENTS_API = "https://www.nseindia.com/api/event-calendar";
const cache = new Map();

function getCached(key) {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  return undefined;
}

function setCached(key, value, ttl) {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

async function fetchText(url, key, ttl) {
  const cached = getCached(key);
  if (cached !== undefined) return cached;
  const response = await fetch(url, {
    headers: {
      Accept: "text/csv,application/rss+xml,application/xml,text/xml,*/*",
      "User-Agent": "LedgerMind/1.0 (public NSE company disclosures viewer)",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const error = new Error(`NSE India returned ${response.status}.`);
    error.status = 502;
    throw error;
  }
  return setCached(key, await response.text(), ttl);
}

async function fetchNseJson(url, key, ttl) {
  const cached = getCached(key);
  if (cached !== undefined) return cached;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      Referer: "https://www.nseindia.com/market-data/live-market-indices",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const error = new Error(`NSE India market data returned ${response.status}.`);
    error.status = 502;
    throw error;
  }
  return setCached(key, await response.json(), ttl);
}

function parseNseDate(value) {
  const match = String(value ?? "").match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;
  const month = new Date(`${match[2]} 1, 2000 UTC`).getUTCMonth();
  if (!Number.isFinite(month)) return null;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
}

function nseQuote(row) {
  return {
    symbol: row.indexSymbol || row.index,
    name: row.index,
    price: Number(row.last),
    change: Number(row.variation),
    changePercent: Number(row.percentChange),
    previousClose: Number(row.previousClose),
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    yearHigh: Number(row.yearHigh),
    yearLow: Number(row.yearLow),
    advances: Number(row.advances) || 0,
    declines: Number(row.declines) || 0,
    unchanged: Number(row.unchanged) || 0,
    pe: Number(row.pe) || null,
    pb: Number(row.pb) || null,
    currency: "INR",
  };
}

export async function getNseMarketOverview() {
  const [indicesResult, eventsResult] = await Promise.allSettled([
    fetchNseJson(NSE_INDICES_API, "nse-live-indices", 60_000),
    fetchNseJson(NSE_EVENTS_API, "nse-upcoming-events", 5 * 60_000),
  ]);
  if (indicesResult.status === "rejected" && eventsResult.status === "rejected") {
    throw indicesResult.reason;
  }
  const indicesResponse = indicesResult.status === "fulfilled" ? indicesResult.value : {};
  const eventsResponse = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const names = new Set([
    "NIFTY 50",
    "NIFTY NEXT 50",
    "NIFTY BANK",
    "NIFTY IT",
    "NIFTY MIDCAP 100",
    "NIFTY 500",
    "INDIA VIX",
  ]);
  const indices = (indicesResponse.data ?? [])
    .filter((row) => names.has(row.index))
    .map(nseQuote)
    .filter((row) => Number.isFinite(row.price) && row.price > 0);
  const now = new Date();
  const todayIndia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const upcomingResults = (Array.isArray(eventsResponse) ? eventsResponse : [])
    .filter((event) => {
      const date = parseNseDate(event.date);
      return (
        date &&
        date.toISOString().slice(0, 10) >= todayIndia &&
        /financial\s+results/i.test(`${event.purpose ?? ""} ${event.bm_desc ?? ""}`)
      );
    })
    .map((event) => ({
      symbol: String(event.symbol ?? ""),
      company: String(event.company ?? ""),
      purpose: String(event.purpose ?? "Financial Results"),
      description: String(event.bm_desc ?? ""),
      date: String(event.date ?? ""),
      sourceUrl: `https://www.nseindia.com/companies-listing/corporate-filings-event-calendar?symbol=${encodeURIComponent(event.symbol ?? "")}`,
    }))
    .sort((a, b) => {
      const first = parseNseDate(a.date)?.valueOf() ?? 0;
      const second = parseNseDate(b.date)?.valueOf() ?? 0;
      return first - second;
    })
    .slice(0, 60);

  return {
    indices,
    upcomingResults,
    retrievedAt: now.toISOString(),
    exchange: "National Stock Exchange of India",
    indicesSource: NSE_INDICES_API,
    calendarSource: NSE_EVENTS_API,
    indicesError: indicesResult.status === "rejected" ? String(indicesResult.reason?.message ?? "Index feed unavailable") : undefined,
    calendarError: eventsResult.status === "rejected" ? String(eventsResult.reason?.message ?? "Event calendar unavailable") : undefined,
  };
}

function parseCsvLine(line) {
  const columns = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      columns.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  columns.push(current.trim());
  return columns;
}

async function getListedCompanies() {
  const text = await fetchText(
    NSE_COMPANY_LIST_URL,
    "nse-equity-directory",
    6 * 60 * 60 * 1000,
  );
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("NSE company directory was empty.");
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (const line of lines.slice(1)) {
    const columns = parseCsvLine(line);
    const item = Object.fromEntries(headers.map((header, index) => [header, columns[index] ?? ""]));
    if (!item.SYMBOL || !item["NAME OF COMPANY"]) continue;
    rows.push({
      symbol: item.SYMBOL.toUpperCase(),
      name: item["NAME OF COMPANY"],
      series: item.SERIES,
      listingDate: item["DATE OF LISTING"],
      paidUpValue: Number(item["PAID UP VALUE"]) || null,
      marketLot: Number(item["MARKET LOT"]) || null,
      isin: item["ISIN NUMBER"],
      faceValue: Number(item["FACE VALUE"]) || null,
    });
  }
  return setCached("nse-equities", rows, 6 * 60 * 60 * 1000);
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .trim();
}

function xmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

async function getAnnouncements() {
  const xml = await fetchText(
    NSE_ANNOUNCEMENTS_URL,
    "nse-announcements-rss",
    5 * 60 * 1000,
  );
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => {
    const item = match[1];
    const rawUrl = xmlValue(item, "link");
    let documentUrl = ANNOUNCEMENTS_PAGE;
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "https:" && ["nsearchives.nseindia.com", "www.nseindia.com", "nseindia.com"].includes(parsed.hostname)) {
        documentUrl = parsed.toString();
      }
    } catch {
      // Keep the safe official announcements-page fallback.
    }
    return {
      companyName: xmlValue(item, "title"),
      url: documentUrl,
      description: xmlValue(item, "description"),
      publishedAt: xmlValue(item, "pubDate"),
    };
  });
}

function companyKey(value) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/\b(limited|ltd|private|pvt|public|company|co|incorporated|inc)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function searchNseCompanies(query) {
  const normalized = String(query ?? "").trim().slice(0, 80).toLowerCase();
  const directory = await getListedCompanies();
  if (!normalized) return { companies: [], listedCount: directory.length };
  const companies = directory
    .filter(
      (company) =>
        company.symbol.toLowerCase() === normalized ||
        company.name.toLowerCase() === normalized ||
        company.symbol.toLowerCase().startsWith(normalized) ||
        company.name.toLowerCase().includes(normalized),
    )
    .sort((a, b) => {
      const aExact = a.symbol.toLowerCase() === normalized;
      const bExact = b.symbol.toLowerCase() === normalized;
      return Number(bExact) - Number(aExact) || a.name.localeCompare(b.name);
    })
    .slice(0, 12);
  return { companies, listedCount: directory.length };
}

export async function getNseCompany(symbol) {
  const normalized = String(symbol ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9._&-]{1,30}$/.test(normalized)) {
    const error = new Error("Enter a valid NSE symbol.");
    error.status = 400;
    throw error;
  }
  const directory = await getListedCompanies();
  const company = directory.find((item) => item.symbol === normalized);
  if (!company) {
    const error = new Error("That symbol was not found in the NSE equity directory.");
    error.status = 404;
    throw error;
  }

  const announcements = await getAnnouncements();
  const key = companyKey(company.name);
  const filings = announcements
    .filter((item) => {
      const itemKey = companyKey(item.companyName);
      return itemKey === key || itemKey.includes(key) || key.includes(itemKey);
    })
    .slice(0, 12);

  return {
    ...company,
    filings,
    announcementsPage: ANNOUNCEMENTS_PAGE,
    annualReportsPage: "https://www.nseindia.com/companies-listing/corporate-filings-annual-reports",
    financialResultsPage: `https://www.nseindia.com/companies-listing/corporate-filings-financial-results?symbol=${encodeURIComponent(normalized)}`,
    shareholdingPage: `https://www.nseindia.com/companies-listing/corporate-filings-shareholding-pattern?symbol=${encodeURIComponent(normalized)}`,
    directoryCount: directory.length,
    sourceUpdatedAt: new Date().toISOString(),
  };
}

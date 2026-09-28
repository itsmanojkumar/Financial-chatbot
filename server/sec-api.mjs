const SEC_USER_AGENT =
  process.env.SEC_USER_AGENT || "LedgerMind EDGAR explorer contact: admin@example.com";
const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers_exchange.json";
const SEC_DATA_URL = "https://data.sec.gov";
const cache = new Map();

const METRICS = [
  {
    key: "revenue",
    label: "Revenue",
    concepts: [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
    ],
    unit: "USD",
    period: "annual",
  },
  { key: "netIncome", label: "Net income", concepts: ["NetIncomeLoss"], unit: "USD", period: "annual" },
  {
    key: "operatingCashFlow",
    label: "Operating cash flow",
    concepts: ["NetCashProvidedByUsedInOperatingActivities"],
    unit: "USD",
    period: "annual",
  },
  { key: "assets", label: "Total assets", concepts: ["Assets"], unit: "USD", period: "instant" },
  {
    key: "equity",
    label: "Stockholders’ equity",
    concepts: ["StockholdersEquity"],
    unit: "USD",
    period: "instant",
  },
  {
    key: "cash",
    label: "Cash & equivalents",
    concepts: ["CashAndCashEquivalentsAtCarryingValue"],
    unit: "USD",
    period: "instant",
  },
  {
    key: "longTermDebt",
    label: "Long-term debt",
    concepts: ["LongTermDebtCurrentAndNoncurrent", "LongTermDebt"],
    unit: "USD",
    period: "instant",
  },
  {
    key: "eps",
    label: "Diluted EPS",
    concepts: ["EarningsPerShareDiluted"],
    unit: "USD/shares",
    period: "annual",
  },
];

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit || hit.expiresAt <= Date.now()) return undefined;
  return hit.value;
}

function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

async function fetchSecJson(url, cacheKey, ttlMs) {
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": SEC_USER_AGENT,
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`SEC EDGAR returned ${response.status} for this request.`);
  }

  return cacheSet(cacheKey, await response.json(), ttlMs);
}

function normalizeCik(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits && digits.length <= 10 ? digits.padStart(10, "0") : "";
}

function makeMetric(facts, metric) {
  let concept;
  let unit = metric.unit;
  let records = [];

  for (const name of metric.concepts) {
    const entry = facts?.[name];
    if (!entry) continue;
    const units = entry.units ?? {};
    const unitKey = units[metric.unit] ? metric.unit : Object.keys(units)[0];
    if (!unitKey) continue;
    const annual = units[unitKey].filter((fact) => {
      if (!["10-K", "20-F", "40-F"].includes(fact.form) || !fact.end) {
        return false;
      }
      if (metric.period === "instant") return !fact.start;
      if (!fact.start) return false;
      const days =
        (Date.parse(`${fact.end}T00:00:00Z`) -
          Date.parse(`${fact.start}T00:00:00Z`)) /
        86_400_000;
      return days >= 300 && days <= 400;
    });
    if (annual.length) {
      concept = name;
      unit = unitKey;
      records = annual;
      break;
    }
  }

  if (!records.length) {
    return { key: metric.key, label: metric.label, concept: null, unit, values: [] };
  }

  const byPeriod = new Map();
  for (const fact of records) {
    // Annual facts in a 10-K also repeat comparative values for earlier years.
    // `fy` identifies the filing fiscal year for all of them, so group by the
    // reported period end instead of collapsing the current and comparative facts.
    const periodKey = fact.end;
    const current = byPeriod.get(periodKey);
    if (!current || String(fact.filed ?? "") > String(current.filed ?? "")) {
      byPeriod.set(periodKey, fact);
    }
  }

  const values = [...byPeriod.values()]
    .sort((a, b) => String(b.end).localeCompare(String(a.end)))
    .slice(0, 6)
    .map((fact) => ({
      year: Number(String(fact.end).slice(0, 4)),
      end: fact.end,
      filed: fact.filed,
      form: fact.form,
      value: fact.val,
      unit,
    }));

  return { key: metric.key, label: metric.label, concept, unit, values };
}

function recentFilings(submissions) {
  const recent = submissions?.filings?.recent;
  if (!recent?.form) return [];

  const rows = [];
  const count = recent.form.length;
  for (let i = 0; i < count && rows.length < 16; i += 1) {
    const form = recent.form[i];
    if (!["10-K", "10-Q", "8-K", "20-F", "6-K", "DEF 14A"].includes(form)) {
      continue;
    }

    const accession = recent.accessionNumber?.[i];
    const document = recent.primaryDocument?.[i];
    const rawDescription = recent.primaryDocDescription?.[i];
    const formDescriptions = {
      "10-K": "Annual report",
      "10-Q": "Quarterly report",
      "8-K": "Current report",
      "20-F": "Foreign issuer annual report",
      "6-K": "Foreign issuer current report",
      "DEF 14A": "Definitive proxy statement",
    };
    rows.push({
      form,
      filingDate: recent.filingDate?.[i],
      reportDate: recent.reportDate?.[i],
      description:
        rawDescription && rawDescription.toUpperCase() !== form
          ? rawDescription
          : formDescriptions[form] || document || "Filing document",
      accessionNumber: accession,
      url:
        accession && document
          ? `https://www.sec.gov/Archives/edgar/data/${Number(submissions.cik)}/${accession.replaceAll("-", "")}/${encodeURIComponent(document)}`
          : `https://www.sec.gov/edgar/browse/?CIK=${submissions.cik}`,
    });
  }
  return rows;
}

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function createResponseCapture() {
  return {
    statusCode: 200,
    headers: new Headers(),
    body: "",
    setHeader(name, value) {
      this.headers.set(name, value);
    },
    end(body = "") {
      this.body = body;
    },
  };
}

function toWebResponse(capture) {
  return new Response(capture.body, {
    status: capture.statusCode,
    headers: capture.headers,
  });
}

export async function handleSecApi(request) {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith("/api/sec/")) return null;
  const response = createResponseCapture();

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Only GET requests are supported." });
    return toWebResponse(response);
  }

  try {
    if (url.pathname === "/api/sec/search") {
      const query = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
      if (!query) {
        sendJson(response, 200, { companies: [] });
        return toWebResponse(response);
      }

      const tickerIndex = await fetchSecJson(
        SEC_TICKERS_URL,
        "company-tickers",
        24 * 60 * 60 * 1000,
      );
      const rows = Array.isArray(tickerIndex.data) && Array.isArray(tickerIndex.fields)
        ? tickerIndex.data.map((values) =>
            Object.fromEntries(tickerIndex.fields.map((field, index) => [field, values[index]])),
          )
        : Array.isArray(tickerIndex)
          ? tickerIndex
          : Object.values(tickerIndex);
      const normalized = query.toLowerCase();
      const companies = rows
        .filter((row) => {
          const ticker = String(row.ticker ?? "").toLowerCase();
          const name = String(row.name ?? "").toLowerCase();
          const cik = String(row.cik ?? "");
          return (
            ticker === normalized ||
            name === normalized ||
            ticker.startsWith(normalized) ||
            name.includes(normalized) ||
            (normalized.length >= 4 && normalizeCik(cik) === normalizeCik(normalized))
          );
        })
        .sort((a, b) => {
          const aExact = String(a.ticker ?? "").toLowerCase() === normalized;
          const bExact = String(b.ticker ?? "").toLowerCase() === normalized;
          return Number(bExact) - Number(aExact) ||
            String(a.name ?? "").localeCompare(String(b.name ?? ""));
        })
        .slice(0, 12)
        .map((row) => ({
          cik: normalizeCik(row.cik),
          name: row.name,
          ticker: row.ticker,
          exchange: row.exchange || "US market",
        }));

      sendJson(response, 200, { companies });
      return toWebResponse(response);
    }

    if (url.pathname === "/api/sec/company") {
      const cik = normalizeCik(url.searchParams.get("cik"));
      if (!cik) {
        sendJson(response, 400, { error: "Provide a valid SEC CIK." });
        return toWebResponse(response);
      }

      const [submissions, companyFacts] = await Promise.all([
        fetchSecJson(
          `${SEC_DATA_URL}/submissions/CIK${cik}.json`,
          `submissions-${cik}`,
          15 * 60 * 1000,
        ),
        fetchSecJson(
          `${SEC_DATA_URL}/api/xbrl/companyfacts/CIK${cik}.json`,
          `facts-${cik}`,
          60 * 60 * 1000,
        ),
      ]);

      const usGaap = companyFacts.facts?.["us-gaap"] ?? {};
      const addresses = submissions.addresses ?? submissions.address ?? {};
      const company = {
        cik,
        name: submissions.name || companyFacts.entityName,
        tickers: submissions.tickers ?? [],
        exchanges: submissions.exchanges ?? [],
        sic: submissions.sic,
        sicDescription: submissions.sicDescription,
        fiscalYearEnd: submissions.fiscalYearEnd,
        stateOfIncorporation: submissions.stateOfIncorporation,
        mailingAddress: addresses.mailing ?? null,
        businessAddress: addresses.business ?? null,
        recentFilings: recentFilings(submissions),
        metrics: METRICS.map((metric) => makeMetric(usGaap, metric)),
      };

      sendJson(response, 200, company);
      return toWebResponse(response);
    }

    sendJson(response, 404, { error: "SEC EDGAR endpoint not found." });
    return toWebResponse(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load SEC EDGAR data.";
    sendJson(response, 502, { error: message });
    return toWebResponse(response);
  }
}
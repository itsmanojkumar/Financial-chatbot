import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ExternalLink,
  FileSearch,
  Landmark,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getSecCompany,
  searchSecCompanies,
  type SecCompany,
  type SecCompanyMatch,
  type SecMetric,
} from "../api/sec";

const QUICK_TICKERS = ["AAPL", "MSFT", "NVDA", "AMZN", "JPM", "TSLA"];

function formatMetric(value: number, unit: string) {
  if (unit === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (unit.toLowerCase().includes("usd") && unit.includes("/")) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  }
  return `${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)} ${unit}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatFiscalYearEnd(value?: string) {
  if (!value || !/^\d{4}$/.test(value)) return "not listed";
  const month = Number(value.slice(0, 2));
  const day = Number(value.slice(2));
  if (month < 1 || month > 12 || day < 1 || day > 31) return value;
  return new Date(Date.UTC(2024, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function addressLabel(address?: Record<string, string> | null) {
  if (!address) return "—";
  return [
    address.street1,
    address.street2,
    [address.city, address.stateOrCountry, address.zipCode].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");
}

function MetricCard({ metric }: { metric: SecMetric }) {
  const latest = metric.values[0];
  const prior = metric.values[1];
  const change =
    latest && prior && prior.value !== 0
      ? ((latest.value - prior.value) / Math.abs(prior.value)) * 100
      : null;

  return (
    <article className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm theme-text-muted">{metric.label}</p>
        {change != null && Number.isFinite(change) && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-medium ${
              change >= 0
                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)}% YoY
          </span>
        )}
      </div>
      {latest ? (
        <>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight theme-text sm:text-3xl">
            {formatMetric(latest.value, metric.unit)}
          </p>
          <p className="mt-1 text-xs theme-text-muted">
            FY {latest.year} · filed {formatDate(latest.filed)}
          </p>
          <div className="mt-4 flex h-8 items-end gap-1.5" aria-label={`${metric.label} annual history`}>
            {metric.values.slice(0, 5).reverse().map((item) => {
              const max = Math.max(...metric.values.slice(0, 5).map((entry) => Math.abs(entry.value)), 1);
              const height = Math.max(12, (Math.abs(item.value) / max) * 100);
              return (
                <div key={`${item.year}-${item.end}`} className="flex h-full flex-1 flex-col justify-end gap-1">
                  <div
                    className={`min-h-[3px] rounded-t-sm ${item === latest ? "bg-gold-500" : "bg-gold-500/30"}`}
                    style={{ height: `${height}%` }}
                    title={`${item.year}: ${formatMetric(item.value, metric.unit)}`}
                  />
                  <span className="text-center text-[9px] theme-text-muted">{String(item.year).slice(-2)}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm theme-text-muted">No annual XBRL fact reported</p>
      )}
    </article>
  );
}

export function SecExplorer({
  onAskQuestion,
}: {
  onAskQuestion: (question: string) => void;
}) {
  const [query, setQuery] = useState("AAPL");
  const [matches, setMatches] = useState<SecCompanyMatch[]>([]);
  const [company, setCompany] = useState<SecCompany | null>(null);
  const [selected, setSelected] = useState<SecCompanyMatch | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [error, setError] = useState("");
  const searchAbort = useRef<AbortController | null>(null);
  const companyAbort = useRef<AbortController | null>(null);

  const selectCompany = async (match: SecCompanyMatch) => {
    companyAbort.current?.abort();
    const controller = new AbortController();
    companyAbort.current = controller;
    setSelected(match);
    setMatches([]);
    setCompany(null);
    setError("");
    setLoadingCompany(true);
    try {
      const data = await getSecCompany(match.cik, controller.signal);
      setCompany({ ...match, ...data });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Could not load this company.");
      }
    } finally {
      if (!controller.signal.aborted) setLoadingCompany(false);
    }
  };

  const handleSearch = async (searchTerm = query) => {
    const term = searchTerm.trim();
    if (!term) return;
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setQuery(term);
    setSearching(true);
    setError("");
    setMatches([]);
    try {
      const companies = await searchSecCompanies(term, controller.signal);
      const normalized = term.toLowerCase();
      const exact = companies.find(
        (item) =>
          item.ticker.toLowerCase() === normalized ||
          item.name.toLowerCase() === normalized ||
          item.cik === normalized.padStart(10, "0"),
      );
      if (exact) {
        await selectCompany(exact);
      } else {
        setMatches(companies);
        if (!companies.length) setError("No SEC registrants matched that search.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Could not search EDGAR.");
      }
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  };

  useEffect(() => {
    void handleSearch("AAPL");
    return () => {
      searchAbort.current?.abort();
      companyAbort.current?.abort();
    };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearch();
  };

  const financialMetrics = company?.metrics ?? [];
  const businessAddress = addressLabel(company?.businessAddress);

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-9">
      <div className="mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border theme-border bg-gradient-to-br from-teal-500/[0.13] via-gold-500/[0.08] to-transparent p-5 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-10 -top-20 h-60 w-60 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Official SEC filings
              </span>
              <span className="rounded-full theme-surface-2 px-3 py-1 text-[11px] theme-text-muted">
                US public companies
              </span>
            </div>
            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
                  SEC EDGAR Explorer
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed theme-text-muted sm:text-base">
                  Company profiles, filing history, and reported XBRL financials—direct from the SEC’s public data APIs.
                </p>
              </div>
              <a
                href="https://www.sec.gov/edgar/search/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl theme-btn-secondary px-3.5 py-2.5 text-sm lg:self-auto"
              >
                Search all EDGAR <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <form onSubmit={submitSearch} className="mt-6 flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search US company by name, ticker or CIK</span>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Company name, ticker or CIK (e.g. Apple or AAPL)"
                  className="h-12 w-full rounded-xl border theme-border theme-input-bg pl-11 pr-4 text-sm theme-text outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/15"
                />
              </label>
              <button
                type="submit"
                disabled={searching || !query.trim()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:cursor-wait disabled:opacity-60"
              >
                {searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search EDGAR
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs theme-text-muted">Popular:</span>
              {QUICK_TICKERS.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => void handleSearch(ticker)}
                  className="rounded-lg theme-surface-2 px-2.5 py-1 text-xs font-medium theme-text-muted transition hover:text-gold-500"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {matches.length > 0 && (
          <section className="mt-4 rounded-2xl border theme-border theme-surface p-3">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider theme-text-muted">
              Select a SEC registrant
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {matches.map((match) => (
                <button
                  key={match.cik}
                  type="button"
                  onClick={() => void selectCompany(match)}
                  className="flex min-w-0 items-center gap-3 rounded-xl theme-surface-2 p-3 text-left transition hover:ring-1 hover:ring-gold-500/30"
                >
                  <Building2 className="h-4 w-4 shrink-0 text-gold-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium theme-text">{match.name}</span>
                    <span className="block text-xs theme-text-muted">{match.ticker} · {match.exchange} · CIK {match.cik}</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 theme-text-muted" />
                </button>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            {error}
            {error.includes("fetch") && (
              <span className="mt-1 block text-xs opacity-80">SEC data is fetched server-side because EDGAR does not permit direct browser CORS access.</span>
            )}
          </div>
        )}

        {loadingCompany && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border theme-border theme-surface p-5 text-sm theme-text-muted">
            <LoaderCircle className="h-5 w-5 animate-spin text-gold-500" />
            Loading SEC submissions and company facts for {selected?.name ?? "company"}…
          </div>
        )}

        {!company && !loadingCompany && !error && (
          <div className="mt-5 rounded-2xl border theme-border theme-surface p-5 text-sm theme-text-muted">
            Search a public-company name, ticker symbol or CIK to open its EDGAR profile.
          </div>
        )}

        {company && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-5">
            <section className="glass-panel rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-2xl font-semibold theme-text">{company.name}</h3>
                      {company.tickers.map((ticker) => (
                        <span key={ticker} className="rounded-md bg-gold-500/15 px-2 py-1 text-xs font-semibold text-gold-700 dark:text-gold-300">{ticker}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-sm theme-text-muted">
                      {company.exchanges.join(", ") || selected?.exchange || "US registrant"}
                      {company.sicDescription && ` · ${company.sicDescription}`}
                    </p>
                    <p className="mt-2 text-xs theme-text-muted">CIK {company.cik} · Fiscal year-end {formatFiscalYearEnd(company.fiscalYearEnd)}{company.stateOfIncorporation ? ` · Incorporated in ${company.stateOfIncorporation}` : ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onAskQuestion(`Summarize ${company.name}'s latest annual report. Cover revenue, net income, operating cash flow, balance sheet trends, and key risks.`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500/10 px-3.5 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-500/15 dark:text-teal-300"
                  >
                    <Sparkles className="h-4 w-4" /> Ask about this company
                  </button>
                  <a
                    href={`https://www.sec.gov/edgar/browse/?CIK=${company.cik}&owner=exclude`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl theme-btn-secondary px-3.5 py-2.5 text-sm"
                  >
                    SEC company page <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="mt-5 grid gap-3 border-t theme-border pt-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
                <div><p className="theme-text-muted">Industry / SIC</p><p className="mt-1 font-medium theme-text">{company.sicDescription || "Not reported"}{company.sic && ` · ${company.sic}`}</p></div>
                <div><p className="theme-text-muted">Business address</p><p className="mt-1 font-medium leading-relaxed theme-text">{businessAddress}</p></div>
                <div><p className="theme-text-muted">Mailing address</p><p className="mt-1 font-medium leading-relaxed theme-text">{addressLabel(company.mailingAddress)}</p></div>
                <div><p className="theme-text-muted">Data source</p><p className="mt-1 inline-flex items-center gap-1.5 font-medium theme-text"><ShieldCheck className="h-3.5 w-3.5 text-teal-500" /> SEC submissions + XBRL Company Facts</p></div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-semibold theme-text">Reported financials</h3>
                  <p className="mt-1 text-xs theme-text-muted">Latest annual facts from filed 10-K, 20-F or 40-F reports; values are as submitted.</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs theme-text-muted"><CalendarDays className="h-3.5 w-3.5" /> Annual periods · USD unless noted</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {financialMetrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
              </div>
            </section>

            <section className="glass-panel overflow-hidden rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b theme-border px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-gold-500" />
                  <div>
                    <h3 className="font-display text-lg font-semibold theme-text">Recent SEC filings</h3>
                    <p className="text-xs theme-text-muted">Annual, quarterly, current and proxy filings</p>
                  </div>
                </div>
                <a
                  href={`https://www.sec.gov/edgar/browse/?CIK=${company.cik}&owner=exclude`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
                >
                  All filings <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              {company.recentFilings.length ? (
                <div className="divide-y theme-border">
                  {company.recentFilings.map((filing, index) => (
                    <a
                      key={`${filing.accessionNumber ?? filing.filingDate}-${index}`}
                      href={filing.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col gap-2 px-4 py-3.5 transition hover:theme-list-item sm:flex-row sm:items-center sm:px-5"
                    >
                      <span className={`w-fit min-w-16 rounded-lg px-2.5 py-1 text-center text-xs font-bold ${filing.form.includes("K") ? "bg-gold-500/15 text-gold-700 dark:text-gold-300" : filing.form.includes("Q") ? "bg-teal-500/10 text-teal-700 dark:text-teal-300" : "theme-surface-2 theme-text-muted"}`}>
                        {filing.form}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium theme-text">{filing.description}</span>
                        <span className="mt-0.5 block text-xs theme-text-muted">Filed {formatDate(filing.filingDate)}{filing.reportDate ? ` · Period ended ${formatDate(filing.reportDate)}` : ""}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 self-end text-xs theme-text-muted sm:self-auto">Open filing <ExternalLink className="h-3.5 w-3.5" /></span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm theme-text-muted">No recent filing history was returned by EDGAR.</p>
              )}
            </section>

            <p className="px-1 pb-2 text-[11px] leading-relaxed theme-text-muted">
              Source: U.S. Securities and Exchange Commission EDGAR submissions and XBRL Company Facts APIs. Financial values are reported facts, not estimates; company-specific tagging, restatements and accounting policies can affect comparability. Verify important figures in the linked original filing. This display is informational and is not investment advice.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
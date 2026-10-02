"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpRightFromSquare,
  CalendarDays,
  Clock3,
  LoaderCircle,
  Radio,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

type MarketIndex = {
  symbol: string;
  name: string;
  providerName?: string;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  currency: string;
  marketTime?: number;
  quoteTime?: number;
  timeZone?: string;
  marketState?: string;
  advances?: number;
  declines?: number;
  unchanged?: number;
  yearHigh?: number;
  yearLow?: number;
};

type ResultsEvent = {
  symbol: string;
  company: string;
  purpose: string;
  description: string;
  date: string;
};

type IndiaOverview = {
  indices: MarketIndex[];
  upcomingResults: ResultsEvent[];
  retrievedAt: string;
  exchange: string;
  indicesError?: string;
  calendarError?: string;
  error?: string;
};

type UsOverview = {
  indices: MarketIndex[];
  retrievedAt: string;
  provider: string;
  note: string;
  error?: string;
};

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatClock(value?: string | number, timeZone?: string) {
  if (!value) return "—";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return new Intl.DateTimeFormat(timeZone === "Asia/Kolkata" ? "en-IN" : "en-US", {
    timeZone: timeZone || "UTC",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
}

function formatResultDate(value: string) {
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return value;
  return `${match[1]} ${match[2]} ${match[3]}`;
}

function IndexCard({ index, india, retrievedAt }: { index: MarketIndex; india: boolean; retrievedAt?: string }) {
  const positive = index.changePercent >= 0;
  const format = (value: number) => (india ? Math.abs(value).toFixed(2) : Math.abs(value).toFixed(2));
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_-24px_rgba(15,23,42,.24)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-slate-800">{index.name}</p>
          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400">{index.symbol}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 text-[10px] font-semibold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {format(index.changePercent)}%
        </span>
      </div>
      <p className="mt-4 truncate font-display text-[1.55rem] font-semibold tracking-tight text-slate-950 sm:text-[1.8rem]">{formatPrice(index.price, index.currency)}</p>
      <p className={`mt-1 text-[10px] font-medium ${positive ? "text-emerald-700" : "text-rose-700"}`}>
        {positive ? "+" : "−"}{format(index.change)} <span className="font-normal text-slate-400">vs previous close</span>
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[9px] text-slate-500">
        {india && index.advances !== undefined ? (
          <><span className="text-emerald-700">Adv {index.advances}</span><span className="text-rose-700">Dec {index.declines}</span><span>Unch {index.unchanged}</span></>
        ) : (
          <><span>Previous close</span><span className="font-medium text-slate-700">{formatPrice(index.previousClose, index.currency)}</span></>
        )}
      </div>
      <p className="mt-2 text-[9px] text-slate-400">{india ? `NSE feed retrieved ${formatClock(retrievedAt, "Asia/Kolkata")}` : `Quote ${formatClock(index.marketTime, index.timeZone)}`}</p>
    </article>
  );
}

function UpcomingResults({ events, loading, error }: { events: ResultsEvent[]; loading: boolean; error?: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><CalendarDays className="h-4 w-4" /></span>
          <div><h3 className="text-sm font-semibold text-slate-950">Upcoming company results</h3><p className="mt-0.5 text-[10px] text-slate-500">Future NSE board meetings whose published agenda mentions financial results</p></div>
        </div>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-teal-800">Exchange feed · in workspace</span>
      </div>
      {loading ? (
        <div className="space-y-3 px-4 py-5 sm:px-5">{[1, 2, 3].map((item) => <div key={item} className="flex gap-3"><span className="h-8 w-[68px] animate-pulse rounded-lg bg-slate-100" /><span className="flex-1"><span className="block h-3 w-2/5 animate-pulse rounded bg-slate-100" /><span className="mt-2 block h-3 w-4/5 animate-pulse rounded bg-slate-100" /></span></div>)}</div>
      ) : events.length > 0 ? (
        <div className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto">
          {events.map((event, index) => (
            <div key={`${event.symbol}-${event.date}-${index}`} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
              <span className="min-w-[68px] rounded-lg bg-slate-100 px-2 py-1.5 text-center text-[10px] font-semibold text-slate-700">{formatResultDate(event.date)}</span>
              <span className="min-w-0 flex-1"><span className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-xs font-semibold text-slate-900">{event.company}</span><span className="text-[9px] font-bold tracking-wide text-teal-800">{event.symbol}</span></span><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{event.description}</span></span>
              <span className="mt-1 shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-semibold uppercase tracking-wide text-amber-800">Details in progress</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-7 text-center"><p className="text-xs font-medium text-slate-700">{error ? "Upcoming result dates are currently unavailable." : "No future results meetings currently available from the NSE calendar feed."}</p><p className="mt-1 text-[10px] text-slate-500">{error || "The exchange calendar may update as issuers notify the market."}</p></div>
      )}
    </section>
  );
}

export function MarketOverviewPanel({ market }: { market: "india" | "us" }) {
  const [indiaData, setIndiaData] = useState<IndiaOverview | null>(null);
  const [usData, setUsData] = useState<UsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (manual = false) => {
    setError("");
    if (manual) setRefreshing(true);
    try {
      const response = await fetch(`/api/markets/${market}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Market data is not available right now.");
      if (market === "india") setIndiaData(payload as IndiaOverview);
      else setUsData(payload as UsOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Market data is not available right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [market]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const indices = market === "india" ? indiaData?.indices ?? [] : usData?.indices ?? [];
  const retrievedAt = market === "india" ? indiaData?.retrievedAt : usData?.retrievedAt;
  const isIndia = market === "india";
  const title = isIndia ? "Indian market indices" : "United States market indices";
  const clockLabel = isIndia ? "Asia/Kolkata" : "America/New_York";

  return (
    <section className="border-b border-slate-200/80 bg-[#f5f7fa] px-4 py-6 sm:px-7 sm:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div><p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.18em] text-teal-800"><Radio className="h-3 w-3" />Market monitor · {isIndia ? "NSE India" : "US benchmarks"}</p><h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-slate-950">{title}</h2><p className="mt-1 text-[10px] text-slate-500">{isIndia ? "Exchange index feed · INR · refreshes every minute" : "Indicative third-party index quotes · USD · refreshes every minute"}</p></div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
            {retrievedAt && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Retrieved {formatClock(retrievedAt, clockLabel)}</span>}
            <button type="button" onClick={() => void refresh(true)} disabled={refreshing} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-600 transition hover:border-slate-300 disabled:opacity-50"><RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-5 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin text-teal-700" />Loading market quotes…</div>
        ) : indices.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{indices.map((index) => <IndexCard key={index.symbol} index={index} india={isIndia} retrievedAt={retrievedAt} />)}</div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-xs text-amber-900"><span className="font-semibold">Quotes are temporarily unavailable.</span> {error || (isIndia ? indiaData?.indicesError : undefined) || "No values returned by the upstream feed."}{isIndia && <span className="ml-1 font-medium">We’ll retry automatically.</span>}{!isIndia && <a href="https://www.nasdaq.com/market-activity/indexes" target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 font-semibold underline">Open US index listings <ArrowUpRightFromSquare className="h-3 w-3" /></a>}</div>
        )}

        {!isIndia && usData?.note && <p className="mt-2 text-[9px] leading-relaxed text-slate-400">{usData.note} <a href="https://finance.yahoo.com/markets/indices/" target="_blank" rel="noreferrer" className="font-medium text-slate-500 underline underline-offset-2">Quote source</a>; compare against <a href="https://www.nasdaq.com/market-activity/indexes" target="_blank" rel="noreferrer" className="font-medium text-slate-500 underline underline-offset-2">Nasdaq index listings</a>.</p>}

        {isIndia && (
          <div className="mt-5"><UpcomingResults events={indiaData?.upcomingResults ?? []} loading={loading} error={indiaData?.calendarError} /><p className="mt-2 text-[9px] leading-relaxed text-slate-400">Result meetings are scheduled board meetings announced to NSE, not guaranteed publication timestamps. Confirm changes in the source calendar. India has no promise of pre-announcement; this panel displays only future exchange-listed agenda entries mentioning financial results.</p></div>
        )}

        {!isIndia && <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-slate-400"><TrendingUp className="mt-0.5 h-3 w-3 shrink-0" />The SEC does not publish a centralized future earnings-results calendar in EDGAR submissions. No unverified US earnings dates are shown.</p>}
      </div>
    </section>
  );
}

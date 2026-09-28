"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRightFromSquare,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  FileChartColumnIncreasing,
  FileText,
  IndianRupee,
  Landmark,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  getNseCompany,
  searchNseCompanies,
  type NseCompany,
  type NseCompanyMatch,
} from "../api/nse";

const QUICK_SYMBOLS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "ITC"];
const INDEX_LINKS = [
  { symbol: "NIFTY 50", description: "Large-cap benchmark", href: "https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%2050" },
  { symbol: "NIFTY BANK", description: "Banking sector", href: "https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20BANK" },
  { symbol: "NIFTY IT", description: "Information technology", href: "https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20IT" },
];

function dateLabel(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.valueOf())) {
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  }
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  return match ? `${match[1]} ${match[2]} ${match[3]}` : value || "—";
}

function CompanyResult({
  company,
  onSelect,
}: {
  company: NseCompanyMatch;
  onSelect: (company: NseCompanyMatch) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(company)}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-teal-300 hover:shadow-md hover:shadow-teal-950/[0.04]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-teal-300">
        <Building2 className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">{company.name}</span>
        <span className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-slate-500">
          <span className="font-semibold text-teal-800">{company.symbol}</span>
          <span>{company.series || "Equity"} series</span>
          <span>ISIN {company.isin}</span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
    </button>
  );
}

export function IndiaExplorer({ onAskQuestion }: { onAskQuestion: (question: string) => void }) {
  const [query, setQuery] = useState("RELIANCE");
  const [matches, setMatches] = useState<NseCompanyMatch[]>([]);
  const [company, setCompany] = useState<NseCompany | null>(null);
  const [listedCount, setListedCount] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [error, setError] = useState("");
  const searchAbort = useRef<AbortController | null>(null);
  const companyAbort = useRef<AbortController | null>(null);

  const selectCompany = useCallback(async (selected: NseCompanyMatch) => {
    companyAbort.current?.abort();
    const controller = new AbortController();
    companyAbort.current = controller;
    setCompany(null);
    setMatches([]);
    setError("");
    setLoadingCompany(true);
    setQuery(selected.symbol);
    try {
      const detail = await getNseCompany(selected.symbol, controller.signal);
      setCompany(detail);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Unable to load NSE company details.");
      }
    } finally {
      if (!controller.signal.aborted) setLoadingCompany(false);
    }
  }, []);

  const search = useCallback(async (text: string) => {
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setSearching(true);
    setError("");
    setMatches([]);
    setCompany(null);
    setQuery(text);
    try {
      const result = await searchNseCompanies(text, controller.signal);
      setListedCount(result.listedCount);
      const normalized = text.trim().toUpperCase();
      const exact = result.companies.find((item) => item.symbol === normalized);
      if (exact) {
        await selectCompany(exact);
      } else if (result.companies.length === 1) {
        await selectCompany(result.companies[0]);
      } else {
        setCompany(null);
        setMatches(result.companies);
        if (text.trim() && result.companies.length === 0) {
          setError("No listed equity matched. Check the symbol or search by company name.");
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Could not reach NSE India.");
      }
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, [selectCompany]);

  useEffect(() => {
    void search("RELIANCE");
    return () => {
      searchAbort.current?.abort();
      companyAbort.current?.abort();
    };
  }, [search]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void search(query);
  };

  const openQuick = (symbol: string) => {
    setQuery(symbol);
    void search(symbol);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f5f7fa]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] bg-[#101c2d] px-5 py-7 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,.52)] sm:px-9 sm:py-9 lg:px-11"
        >
          <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 0)", backgroundSize: "25px 25px" }} />
          <div className="pointer-events-none absolute -right-12 -top-32 h-96 w-96 rounded-full bg-teal-400/15 blur-[90px]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.15fr_.85fr] xl:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-teal-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" /> NSE India · Official exchange records
                </span>
                <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-[10px] uppercase tracking-[.13em] text-slate-300">INR · Asia/Kolkata</span>
              </div>
              <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.23em] text-slate-400">India market workspace</p>
              <h1 className="mt-3 max-w-3xl font-display text-[2.5rem] font-medium leading-[1.04] tracking-[-.04em] sm:text-5xl lg:text-[3.6rem]">
                India markets,<br /><span className="text-teal-300">sourced at the exchange.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Find NSE-listed companies, verify listing identifiers, and open original exchange-filed announcements, annual reports and financial results.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-xl sm:p-5">
              <form onSubmit={submit}>
                <label htmlFor="nse-search" className="mb-2 block text-xs font-medium text-slate-300">Search listed company or NSE symbol</label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="nse-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="e.g. RELIANCE, TCS, Infosys"
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#0a1422]/70 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300/60 focus:ring-4 focus:ring-teal-300/10"
                    />
                  </div>
                  <button type="submit" disabled={searching || !query.trim()} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-teal-300 px-4 text-sm font-semibold text-[#0c1a29] transition hover:bg-teal-200 disabled:opacity-60">
                    {searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] text-slate-400">Quick access</span>
                {QUICK_SYMBOLS.map((symbol) => (
                  <button key={symbol} type="button" onClick={() => openQuick(symbol)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-medium text-slate-200 transition hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-teal-100">{symbol}</button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {INDEX_LINKS.map((item, index) => (
            <a key={item.symbol} href={item.href} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_-14px_rgba(15,23,42,.24)] transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${index === 0 ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-700"}`}><BarIcon index={index} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{item.symbol}</span><span className="mt-0.5 block text-[11px] text-slate-500">{item.description}</span></span>
              <ArrowUpRightFromSquare className="h-4 w-4 text-slate-400 transition group-hover:text-teal-700" />
            </a>
          ))}
        </div>

        {listedCount !== null && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Landmark className="h-4 w-4" /></span>
              <div><p className="text-xs font-semibold text-slate-900">NSE-listed equity directory</p><p className="mt-0.5 text-[11px] text-slate-500">Official exchange company master · EQ and other listed series</p></div>
            </div>
            <p className="text-right"><span className="block font-display text-xl font-semibold text-slate-950">{listedCount.toLocaleString("en-IN")}</span><span className="text-[10px] uppercase tracking-wider text-slate-500">listed symbols</span></p>
          </div>
        )}

        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

        {matches.length > 0 && (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-900">Matching NSE companies</h2><p className="mt-1 text-xs text-slate-500">Select a listing to open its exchange profile.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-500">{matches.length} results</span></div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{matches.map((match) => <CompanyResult key={match.symbol} company={match} onSelect={selectCompany} />)}</div>
          </section>
        )}

        {loadingCompany && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600"><LoaderCircle className="h-5 w-5 animate-spin text-teal-700" />Loading the NSE listing and latest public announcements…</div>
        )}

        {company && !loadingCompany && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,.3)] sm:p-6">
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div className="flex min-w-0 gap-3.5 sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-teal-300"><Building2 className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{company.name}</h2><span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-900">{company.symbol}</span></div>
                    <p className="mt-1.5 text-xs text-slate-500">National Stock Exchange of India · {company.series || "Equity"} series</p>
                    <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-600">Official exchange-directory record for {company.name}. Use the original NSE disclosure links below to review the source filing and its reported accounting period.</p>
                  </div>
                </div>
                <button type="button" onClick={() => onAskQuestion(`Summarize the latest NSE-filed annual report and financial results for ${company.name} (${company.symbol}). Cover revenue, profit, balance sheet, cash flows, shareholding and key disclosures. Cite source documents.`)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#101c2d] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"><Sparkles className="h-4 w-4 text-teal-300" />Ask LedgerMind</button>
              </div>
              <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">
                <DataFact icon={<Landmark className="h-3.5 w-3.5" />} label="NSE symbol" value={company.symbol} />
                <DataFact icon={<ShieldCheck className="h-3.5 w-3.5" />} label="ISIN" value={company.isin || "Not listed"} mono />
                <DataFact icon={<CalendarDays className="h-3.5 w-3.5" />} label="Listing date" value={company.listingDate || "Not listed"} />
                <DataFact icon={<IndianRupee className="h-3.5 w-3.5" />} label="Face value / paid-up" value={`${company.faceValue ?? "—"} / ${company.paidUpValue ?? "—"} INR`} />
              </div>
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-display text-xl font-semibold text-slate-950">Company disclosures</h2><p className="mt-1 text-xs text-slate-500">Direct entry points to company-submitted reports on NSE India.</p></div><span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-900"><ShieldCheck className="h-3.5 w-3.5" />Official exchange source</span></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <OfficialRecord href={company.financialResultsPage} icon={<FileChartColumnIncreasing className="h-4 w-4" />} label="Financial results" detail="Quarterly and annual results" />
                <OfficialRecord href={company.annualReportsPage} icon={<FileText className="h-4 w-4" />} label="Annual reports" detail="Issuer-filed report archive" />
                <OfficialRecord href={company.shareholdingPage} icon={<Star className="h-4 w-4" />} label="Shareholding pattern" detail="Quarter-end ownership filings" />
                <OfficialRecord href={company.announcementsPage} icon={<ArrowUpRightFromSquare className="h-4 w-4" />} label="All announcements" detail="Browse the official filing archive" />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><FileText className="h-4 w-4" /></span><div><h2 className="text-sm font-semibold text-slate-950">Latest exchange announcements</h2><p className="mt-0.5 text-[11px] text-slate-500">Company disclosures from NSE’s official RSS feed</p></div></div>
                <a href={company.announcementsPage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 hover:text-teal-950">NSE archive <ArrowUpRightFromSquare className="h-3.5 w-3.5" /></a>
              </div>
              {company.filings.length > 0 ? (
                <div className="divide-y divide-slate-100">{company.filings.map((filing, index) => {
                  const [subject, category] = filing.description.split("|SUBJECT:").map((part) => part.trim());
                  return (
                    <a key={`${filing.url}-${index}`} href={filing.url} target="_blank" rel="noreferrer" className="group flex flex-col gap-2 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><FileText className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{subject || filing.companyName}</span>{category && <span className="mt-1 block text-[11px] text-slate-500">{category}</span>}<span className="mt-1 block truncate text-xs text-slate-600">{filing.companyName}</span></span>
                      <span className="flex shrink-0 items-center gap-2 self-end text-[11px] text-slate-500 sm:self-auto">{dateLabel(filing.publishedAt)}<ArrowUpRightFromSquare className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-teal-700" /></span>
                    </a>
                  );
                })}</div>
              ) : (
                <div className="px-5 py-8 text-center"><p className="text-sm font-medium text-slate-700">No matching item in the latest RSS snapshot</p><p className="mt-1 text-xs text-slate-500">The NSE archive has additional company disclosures and older filings.</p><a href={company.announcementsPage} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:underline">Filter all NSE announcements <ArrowUpRightFromSquare className="h-3.5 w-3.5" /></a></div>
              )}
            </section>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />Listing metadata is from NSE’s official equity master; disclosures link to issuer documents on NSE’s archive. Filing availability and report formats vary by issuer. This is informational research, not investment advice.</p>
              <a href="https://www.nseindia.com/" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-teal-800">nseindia.com <ArrowUpRightFromSquare className="h-3.5 w-3.5" /></a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function BarIcon({ index }: { index: number }) {
  const bars = [0.48, 0.75, 0.58, 0.93, 0.68];
  return <span aria-hidden="true" className="flex h-5 items-end gap-[2px]">{bars.map((height, bar) => <span key={bar} className={`w-[3px] rounded-sm ${index === 0 ? "bg-teal-700" : "bg-slate-500"}`} style={{ height: `${height * 100}%` }} />)}</span>;
}

function DataFact({ icon, label, value, mono = false }: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl bg-slate-50 px-3.5 py-3"><p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">{icon}{label}</p><p className={`mt-1.5 truncate text-xs font-semibold text-slate-900 ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p></div>;
}

function OfficialRecord({ href, icon, label, detail }: { href: string; icon: ReactNode; label: string; detail: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/[.04]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-teal-50 group-hover:text-teal-800">{icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{label}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{detail}</span></span><ArrowUpRightFromSquare className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-teal-700" /></a>;
}

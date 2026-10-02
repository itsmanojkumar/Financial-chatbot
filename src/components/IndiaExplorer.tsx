"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Download,
  FileChartColumnIncreasing,
  FileText,
  IndianRupee,
  Landmark,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  getNseCompany,
  searchNseCompanies,
  type NseCompany,
  type NseCompanyMatch,
} from "../api/nse";

const QUICK_SYMBOLS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "ITC"];
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
  const [activeReport, setActiveReport] = useState<NseCompany["annualReports"][number] | null>(null);
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
                Find listed companies, verify their identifiers, and read available annual-report PDFs without leaving this workspace.
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
                    <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-600">Official exchange-directory record for {company.name}. Read available annual-report PDFs here; additional filing readers are marked in progress until they can also be viewed in-app.</p>
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
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-display text-xl font-semibold text-slate-950">Company disclosures</h2><p className="mt-1 text-xs text-slate-500">Other filing readers are being added to this workspace.</p></div><span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-900"><ShieldCheck className="h-3.5 w-3.5" />Source-verified data</span></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <PendingRecord icon={<FileChartColumnIncreasing className="h-4 w-4" />} label="Financial results" detail="In-app filing reader in progress" />
                <PendingRecord icon={<Star className="h-4 w-4" />} label="Shareholding pattern" detail="In-app filing reader in progress" />
                <PendingRecord icon={<FileText className="h-4 w-4" />} label="Full disclosure archive" detail="In-app filing reader in progress" />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><FileText className="h-4 w-4" /></span>
                  <div><h2 className="text-sm font-semibold text-slate-950">Annual reports · read here</h2><p className="mt-0.5 text-[11px] text-slate-500">Latest issuer-submitted PDF reports from NSE’s annual-report feed</p></div>
                </div>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-teal-800">Embedded PDF viewer</span>
              </div>
              {company.annualReports.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {company.annualReports.map((report) => (
                    <div key={report.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><FileText className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-900">{report.year} annual report</p><p className="mt-1 truncate text-[10px] text-slate-500">{report.description || "Official NSE issuer submission"}</p></div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => setActiveReport(report)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#101c2d] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-slate-800"><FileText className="h-3.5 w-3.5 text-teal-300" />Read PDF here</button>
                        <a href={pdfProxyUrl(company.symbol, report.id)} download className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-slate-300"><Download className="h-3.5 w-3.5" />Download</a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs font-medium text-slate-700">Annual report reader pending for {company.symbol}</p><p className="mt-1 text-[10px] text-slate-500">No PDF for this company is in the latest report feed yet. The report will appear here when the source document is available in the feed.</p>{company.annualReportsError && <p className="mt-1 text-[10px] text-amber-700">{company.annualReportsError}</p>}</div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-amber-800"><LoaderCircle className="h-3 w-3" />In progress</span>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><FileText className="h-4 w-4" /></span><div><h2 className="text-sm font-semibold text-slate-950">Latest exchange announcements</h2><p className="mt-0.5 text-[11px] text-slate-500">Company disclosures from NSE’s official RSS feed</p></div></div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium text-slate-500">In-app attachments in progress</span>
              </div>
              {company.filings.length > 0 ? (
                <div className="divide-y divide-slate-100">{company.filings.map((filing, index) => {
                  const [subject, category] = filing.description.split("|SUBJECT:").map((part) => part.trim());
                  return (
                    <div key={`${filing.companyName}-${filing.publishedAt}-${index}`} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><FileText className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{subject || filing.companyName}</span>{category && <span className="mt-1 block text-[11px] text-slate-500">{category}</span>}<span className="mt-1 block truncate text-xs text-slate-600">{filing.companyName}</span></span>
                      <span className="flex shrink-0 items-center gap-2 self-end text-[11px] text-slate-500 sm:self-auto">{dateLabel(filing.publishedAt)}<span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-semibold uppercase text-amber-800">Viewer in progress</span></span>
                    </div>
                  );
                })}</div>
              ) : (
                <div className="px-5 py-8 text-center"><p className="text-sm font-medium text-slate-700">No recent announcement is available in the in-app feed.</p><p className="mt-1 text-xs text-slate-500">Older announcements and attachment previews are in progress.</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-amber-800"><LoaderCircle className="h-3 w-3" />In progress</span></div>
              )}
            </section>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />Listing and disclosure data are sourced from official exchange submissions and presented in LedgerMind. Reports outside the current in-app feed remain pending. Filing formats vary by issuer. This is informational research, not investment advice.</p>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-teal-800"><ShieldCheck className="h-3.5 w-3.5" />Source-verified</span>
            </div>
          </motion.div>
        )}
      </div>
      {company && activeReport && (
        <AnnualReportDialog
          symbol={company.symbol}
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
}

function pdfProxyUrl(symbol: string, reportId: string) {
  return `/api/nse/annual-report?symbol=${encodeURIComponent(symbol)}&reportId=${encodeURIComponent(reportId)}`;
}

function AnnualReportDialog({
  symbol,
  report,
  onClose,
}: {
  symbol: string;
  report: NseCompany["annualReports"][number];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="annual-report-title" className="flex h-[min(94vh,1100px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><FileText className="h-4 w-4" /></span><div className="min-w-0"><h2 id="annual-report-title" className="truncate text-sm font-semibold text-slate-950">{symbol} · {report.year} Annual Report</h2><p className="text-[10px] text-slate-500">NSE India issuer-submitted PDF · displayed in LedgerMind</p></div></div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={pdfProxyUrl(symbol, report.id)} download className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700 hover:border-slate-300"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download PDF</span></a>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Close annual report"><X className="h-4 w-4" /></button>
          </div>
        </header>
        <iframe title={`${symbol} ${report.year} annual report PDF`} src={pdfProxyUrl(symbol, report.id)} className="min-h-0 flex-1 bg-slate-100" />
        <footer className="border-t border-slate-200 px-4 py-2 text-[9px] text-slate-500 sm:px-5">PDF is streamed into LedgerMind from the exchange-submitted document. If the embedded viewer is unavailable, use Download PDF.</footer>
      </section>
    </div>
  );
}

function DataFact({ icon, label, value, mono = false }: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl bg-slate-50 px-3.5 py-3"><p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">{icon}{label}</p><p className={`mt-1.5 truncate text-xs font-semibold text-slate-900 ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p></div>;
}

function PendingRecord({ icon, label, detail }: { icon: ReactNode; label: string; detail: string }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">{icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{label}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{detail}</span></span><span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-semibold uppercase tracking-wide text-amber-800">In progress</span></div>;
}

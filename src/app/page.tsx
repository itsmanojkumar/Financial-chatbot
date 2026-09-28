import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Database,
  FileCheck2,
  Check,
  Globe2,
  Landmark,
  Layers3,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { MarketSiteHeader } from "../components/MarketSiteHeader";

const markets = [
  {
    href: "/us",
    region: "01 / NORTH AMERICA",
    code: "US",
    name: "United States",
    exchange: "SEC · EDGAR",
    description:
      "Search public registrants, follow annual facts across years, and review filing history at the source.",
    capabilities: ["10-K · 10-Q · 8-K", "XBRL company facts", "CIK & ticker search"],
    accent: "text-sky-700 bg-sky-50 ring-sky-100",
    monogram: "bg-[#0c2340] text-sky-200",
  },
  {
    href: "/india",
    region: "02 / SOUTH ASIA",
    code: "IN",
    name: "India",
    exchange: "NSE · CORPORATE FILINGS",
    description:
      "Find listed issuers, verify their exchange identifiers, and open filed results and announcements.",
    capabilities: ["NSE-listed equities", "Results · annual reports", "Exchange announcements"],
    accent: "text-teal-800 bg-teal-50 ring-teal-100",
    monogram: "bg-[#103329] text-teal-200",
  },
];

const comparison = [
  { label: "Authoritative source", us: "SEC EDGAR", india: "NSE India" },
  { label: "Company identifier", us: "Ticker · CIK", india: "Trading symbol · ISIN" },
  { label: "Filing discovery", us: "Submissions & XBRL facts", india: "Issuer filings & announcements" },
  { label: "Reporting currency", us: "USD · as filed", india: "INR · as filed" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-950">
      <MarketSiteHeader active="overview" />
      <main>
        <section className="px-4 pb-12 pt-8 sm:px-7 sm:pb-16 sm:pt-12 lg:pt-16">
          <div className="mx-auto grid max-w-[1440px] gap-9 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-600 shadow-sm">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" /></span>
                Institutional research · source-first
              </div>
              <h1 className="mt-6 max-w-3xl font-display text-[2.7rem] font-medium leading-[1.03] tracking-[-.048em] text-[#101c2d] sm:text-6xl lg:text-[4.35rem]">
                Public markets,<br /><span className="text-teal-800">read from the record.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 sm:text-[17px] sm:leading-8">
                A disciplined research workspace for public-company filings across the United States and India. Explore each market independently; return to one place to ask, compare and organize your research.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#markets" className="inline-flex items-center gap-2 rounded-xl bg-[#101c2d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
                  Explore the markets <ArrowDown className="h-4 w-4 text-teal-300" />
                </a>
                <Link href="/workspace" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  Open research workspace <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-700" />Primary-source links</span>
                <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-teal-700" />Public exchange data</span>
                <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-teal-700" />No brokerage execution</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[580px] lg:ml-auto">
              <div className="absolute -inset-3 rounded-[34px] bg-gradient-to-br from-teal-200/55 via-transparent to-sky-200/50 blur-2xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_28px_90px_-48px_rgba(15,23,42,.36)] sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-100 px-1 pb-4">
                  <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-teal-300"><Globe2 className="h-4 w-4" /></span><span><span className="block text-xs font-semibold text-slate-900">Cross-market coverage</span><span className="mt-0.5 block text-[10px] text-slate-500">Two jurisdictions · distinct source standards</span></span></div>
                  <span className="rounded-lg bg-teal-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-teal-800">Research-ready</span>
                </div>
                <div className="grid grid-cols-2 gap-3 py-4">
                  {markets.map((market) => (
                    <Link key={market.code} href={market.href} className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-1 hover:border-teal-200 hover:bg-white hover:shadow-lg hover:shadow-slate-900/[.05]">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ring-1 ${market.monogram}`}>{market.code}</span>
                      <span className="mt-4 block text-sm font-semibold text-slate-900">{market.name}</span>
                      <span className="mt-1 block text-[9px] font-semibold tracking-[.13em] text-slate-500">{market.exchange}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800">Open market <ArrowUpRight className="h-3 w-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
                    </Link>
                  ))}
                </div>
                <div className="rounded-xl bg-[#101c2d] px-4 py-3.5 text-white">
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-[11px] font-medium text-slate-200"><FileCheck2 className="h-4 w-4 text-teal-300" />Keep the source in view</span><Layers3 className="h-4 w-4 text-slate-500" /></div>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-400">Every market has its own issuer identifiers, reporting rules and filing archive. LedgerMind keeps those contexts separate and links back to the original records.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="markets" className="scroll-mt-24 border-y border-slate-200/80 bg-white px-4 py-12 sm:px-7 sm:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-teal-800">Choose a jurisdiction</p><h2 className="mt-2 font-display text-3xl font-medium tracking-[-.035em] text-[#101c2d] sm:text-[2.6rem]">Purpose-built country workspaces</h2></div>
              <p className="max-w-lg text-sm leading-6 text-slate-500">Open the market landing that matches the issuer. Company lookup, identifiers and filings are sourced from that market’s official exchange or regulator.</p>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {markets.map((market) => (
                <article key={market.code} className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-[#f9fafc] p-5 transition hover:border-slate-300 hover:shadow-[0_20px_50px_-36px_rgba(15,23,42,.35)] sm:p-7">
                  <div className={`pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full blur-[80px] ${market.code === "US" ? "bg-sky-200/45" : "bg-teal-200/55"}`} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ring-1 ${market.monogram}`}>{market.code}</span><div><p className="text-[9px] font-semibold uppercase tracking-[.17em] text-slate-500">{market.region}</p><p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{market.name}</p></div></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ring-1 ${market.accent}`}>{market.exchange}</span></div>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">{market.description}</p>
                    <ul className="mt-5 grid gap-2 sm:grid-cols-3">{market.capabilities.map((capability) => <li key={capability} className="flex items-center gap-2 text-[11px] font-medium text-slate-600"><Check className="h-3.5 w-3.5 shrink-0 text-teal-700" />{capability}</li>)}</ul>
                    <Link href={market.href} className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-[#101c2d] px-4 py-3 text-xs font-semibold text-white transition hover:bg-slate-800">Enter {market.name} workspace <ArrowRight className="h-4 w-4 text-teal-300 transition group-hover:translate-x-0.5" /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="coverage" className="px-4 py-12 sm:px-7 sm:py-16">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-14">
            <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-teal-800">Built for careful comparison</p><h2 className="mt-2 font-display text-3xl font-medium tracking-[-.035em] text-[#101c2d] sm:text-[2.5rem]">One view across markets.<br />No mixed-up standards.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">Review reporting periods side by side while preserving each filing’s local identity, currency, accounting presentation and official source.</p><Link href="/workspace" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-teal-900 hover:text-teal-700">Continue to research workspace <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.08fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-[.15em] text-slate-500 sm:px-5"><span>Research context</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-600" />United States</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />India</span></div>
              {comparison.map((row) => <div key={row.label} className="grid grid-cols-[1.08fr_1fr_1fr] border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5"><span className="text-[11px] font-medium text-slate-500">{row.label}</span><span className="text-[11px] font-semibold text-slate-800">{row.us}</span><span className="text-[11px] font-semibold text-slate-800">{row.india}</span></div>)}
              <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[10px] text-slate-500 sm:px-5"><Landmark className="h-3.5 w-3.5 text-teal-700" />Local disclosures remain linked to their original regulator or exchange.</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-7"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 text-[10px] text-slate-500 sm:flex-row sm:items-center"><span className="font-semibold tracking-wide text-slate-700">LEDGERMIND · GLOBAL FILINGS INTELLIGENCE</span><span>Public-record research only · Not investment advice · Verify material information in the original filing.</span></div></footer>
    </div>
  );
}
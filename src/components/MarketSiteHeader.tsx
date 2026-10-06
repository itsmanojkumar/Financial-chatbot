"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ArrowUpRight, BarChart3, BookOpen, LogIn, LogOut } from "lucide-react";

type MarketSiteHeaderProps = {
  active?: "overview" | "us" | "india";
};

const items = [
  { href: "/", id: "overview", label: "Overview", compact: "Home" },
  { href: "/us", id: "us", label: "United States", compact: "US" },
  { href: "/india", id: "india", label: "India", compact: "India" },
] as const;

export function MarketSiteHeader({ active = "overview" }: MarketSiteHeaderProps) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="LedgerMind market intelligence home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-900/10 transition group-hover:bg-slate-800">
            <BookOpen className="h-[19px] w-[19px] text-teal-300" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block font-display text-[17px] font-semibold leading-5 tracking-[-0.03em] text-slate-950">LedgerMind</span>
            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.19em] text-slate-500 sm:block">Global filings intelligence</span>
          </span>
        </Link>

        <nav aria-label="Markets" className="flex min-w-0 max-w-[38vw] items-center gap-0.5 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 sm:max-w-none sm:gap-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active === item.id ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-[13px] ${
                active === item.id
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/70"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              <span className="sm:hidden">{item.compact}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {status === "authenticated" && user ? (
            <div className="flex items-center gap-1.5">
              <span
                className="grid h-8 w-8 place-items-center rounded-full bg-teal-600 text-xs font-semibold text-white"
                title={user.email ?? undefined}
                aria-hidden="true"
              >
                {initial}
              </span>
              <button
                type="button"
                onClick={() => void signOut({ redirectTo: "/" })}
                className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:px-3"
                aria-label={`Sign out${user.email ? ` ${user.email}` : ""}`}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:px-3"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign in</span>
            </Link>
          ) : null}
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:px-4 sm:text-[13px]"
          >
            <BarChart3 className="h-4 w-4 text-teal-300" />
            <span className="hidden md:inline">Research workspace</span>
            <span className="hidden sm:inline md:hidden">Workspace</span>
            <span className="sm:hidden">App</span>
            <ArrowUpRight className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}

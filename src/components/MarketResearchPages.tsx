"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { IndiaExplorer } from "./IndiaExplorer";
import { MarketOverviewPanel } from "./MarketOverviewPanel";
import { MarketSiteHeader } from "./MarketSiteHeader";
import { SecExplorer } from "./SecExplorer";

function useWorkspaceQuestion() {
  const router = useRouter();
  return useCallback(
    (question: string) => {
      window.sessionStorage.setItem("ledgermind_next_prompt", question);
      router.push("/workspace");
    },
    [router],
  );
}

export function UnitedStatesMarketPage() {
  const askQuestion = useWorkspaceQuestion();
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <MarketSiteHeader active="us" />
      <div className="border-b border-slate-200 bg-white px-4 py-2.5 sm:px-7">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-medium text-slate-600"><ShieldCheck className="h-3.5 w-3.5 text-teal-700" />United States coverage · SEC EDGAR</p>
          <a href="https://www.sec.gov/edgar/search/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800">Official SEC search <ArrowUpRight className="h-3 w-3" /></a>
        </div>
      </div>
      <MarketOverviewPanel market="us" />
      <main><SecExplorer onAskQuestion={askQuestion} /></main>
    </div>
  );
}

export function IndiaMarketPage() {
  const askQuestion = useWorkspaceQuestion();
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <MarketSiteHeader active="india" />
      <MarketOverviewPanel market="india" />
      <main><IndiaExplorer onAskQuestion={askQuestion} /></main>
    </div>
  );
}

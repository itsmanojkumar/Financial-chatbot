"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "../context/ThemeContext";

const InteractiveApp = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <main className="grid min-h-screen place-items-center theme-bg">
      <div className="flex items-center gap-3 rounded-2xl border theme-border theme-surface px-5 py-4 text-sm theme-text-muted shadow-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold-500" />
        Opening LedgerMind…
      </div>
    </main>
  ),
});

export default function ClientApp() {
  return (
    <ThemeProvider>
      <InteractiveApp />
    </ThemeProvider>
  );
}
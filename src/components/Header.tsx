import {
  BarChart3,
  BookOpen,
  CreditCard,
  Download,
  Landmark,
  Menu,
  Moon,
  MessageSquare,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import type { AppView } from "../types/app";

type HeaderProps = {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onExport?: () => void;
  canExport: boolean;
  onToggleTheme: () => void;
  resolvedTheme: "dark" | "light";
  onOpenMobileNav: () => void;
  planLabel: string;
};

const NAV_ITEMS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "edgar", label: "SEC EDGAR", icon: Landmark },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "pricing", label: "Pricing", icon: CreditCard },
] as const;

export function Header({
  view,
  onNavigate,
  onNewChat,
  onOpenSettings,
  onExport,
  canExport,
  onToggleTheme,
  resolvedTheme,
  onOpenMobileNav,
  planLabel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b theme-border bg-white/85 px-3 py-3 shadow-sm backdrop-blur-2xl dark:bg-ink-950/85 md:px-5">
      <div className="mx-auto flex min-w-0 max-w-[1600px] flex-wrap items-center justify-between gap-2 lg:flex-nowrap lg:gap-5">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="rounded-xl p-2 theme-text-muted transition hover:theme-list-item"
            aria-label="Open workspace drawer"
            title="Reports, recent chats and saved prompts"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/25 to-teal-500/10 ring-1 theme-border">
            <BookOpen className="h-5 w-5 text-gold-500" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg font-semibold tracking-tight theme-text md:text-xl">
                LedgerMind
              </h1>
              <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-600 dark:text-gold-400">
                {planLabel}
              </span>
            </div>
            <p className="hidden truncate text-xs theme-text-muted md:block md:text-sm">
              Financial intelligence workspace
            </p>
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="order-last flex basis-full min-w-0 max-w-full items-center justify-center gap-1 overflow-x-auto rounded-2xl border theme-border bg-slate-950/[0.025] p-1 dark:bg-white/[0.035] lg:order-none lg:mx-auto lg:basis-auto"
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={view === id ? "page" : undefined}
              onClick={() => onNavigate(id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition sm:px-3.5 sm:text-sm ${
                view === id
                  ? "bg-white text-ink-900 shadow-sm ring-1 ring-slate-900/5 dark:bg-ink-700 dark:text-mist-100 dark:ring-white/10"
                  : "theme-text-muted hover:theme-text hover:theme-list-item"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${view === id ? "text-gold-600 dark:text-gold-400" : ""}`}
              />
              <span className="hidden lg:inline">{label}</span>
              {view === id && <span className="sr-only"> current page</span>}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {canExport && onExport && (
            <button
              type="button"
              onClick={onExport}
              className="hidden rounded-full p-2 theme-text-muted transition hover:theme-list-item sm:inline-flex"
              title="Export chat"
              aria-label="Export chat"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-full p-2 theme-text-muted transition hover:theme-list-item"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-full p-2 theme-text-muted transition hover:theme-list-item"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNewChat}
            className="inline-flex items-center gap-2 rounded-full border theme-border bg-black/[0.03] px-3 py-2 text-sm theme-text transition hover:border-gold-500/30 dark:bg-white/[0.04]"
          >
            <Sparkles className="h-4 w-4 text-gold-500" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
import {
  BookOpen,
  Download,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
type HeaderProps = {
  onNewChat: () => void;
  onOpenSettings: () => void;
  onExport?: () => void;
  canExport: boolean;
  onToggleTheme: () => void;
  resolvedTheme: "dark" | "light";
  onOpenMobileNav: () => void;
  planLabel: string;
};

export function Header({
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
    <header className="flex shrink-0 items-center justify-between gap-3 border-b theme-border px-3 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 theme-text-muted hover:theme-list-item lg:hidden"
          aria-label="Open menu"
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
          <p className="truncate text-xs theme-text-muted md:text-sm">
            Annual report intelligence · RAG-powered
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {canExport && onExport && (
          <button
            type="button"
            onClick={onExport}
            className="hidden rounded-full p-2 theme-text-muted transition hover:theme-list-item sm:inline-flex"
            title="Export chat"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full p-2 theme-text-muted transition hover:theme-list-item"
          aria-label="Toggle theme"
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
    </header>
  );
}

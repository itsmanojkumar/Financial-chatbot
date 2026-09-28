import {
  BarChart3,
  Bookmark,
  CreditCard,
  FolderOpen,
  Layers,
  MessageSquare,
  Trash2,
} from "lucide-react";
import type { AppView, ConversationSummary, SavedPrompt } from "../types/app";

const REPORTS = [
  { id: "fy24", label: "Annual Report 2024", active: true },
  { id: "fy23", label: "Annual Report 2023", active: false },
  { id: "fy22", label: "Annual Report 2022", active: false },
] as const;

type SidebarProps = {
  view: AppView;
  onNavigate: (view: AppView) => void;
  conversations: ConversationSummary[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  savedPrompts: SavedPrompt[];
  onUsePrompt: (text: string) => void;
  onRemovePrompt: (id: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const navItems: { id: AppView; label: string; icon: typeof MessageSquare }[] =
  [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "pricing", label: "Pricing", icon: CreditCard },
  ];

export function Sidebar({
  view,
  onNavigate,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  savedPrompts,
  onUsePrompt,
  onRemovePrompt,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const panel = (
    <>
      <div className="border-b theme-border px-4 py-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider theme-text-muted">
          <Layers className="h-3.5 w-3.5" />
          Workspace
        </div>
        <nav className="mt-3 flex flex-col gap-1 lg:flex-col">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onNavigate(id);
                onCloseMobile?.();
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                view === id
                  ? "bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/25 dark:text-gold-400"
                  : "theme-text-muted hover:theme-list-item hover:theme-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-b theme-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider theme-text-muted">
          Reports
        </p>
        <nav className="mt-2 space-y-1">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                r.active
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "theme-text-muted hover:theme-list-item"
              }`}
            >
              <FolderOpen className="h-4 w-4 shrink-0 opacity-70" />
              <span className="truncate">{r.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wider theme-text-muted">
          Recent chats
        </p>
        {conversations.length === 0 ? (
          <p className="mt-2 px-1 text-xs theme-text-muted">
            Your threads appear here automatically.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {conversations.map((c) => (
              <li key={c.id} className="group flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(c.id);
                    onCloseMobile?.();
                  }}
                  className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeConversationId === c.id
                      ? "theme-list-item theme-text ring-1 theme-border"
                      : "theme-text-muted hover:theme-list-item"
                  }`}
                >
                  <span className="block truncate font-medium">{c.title}</span>
                  <span className="block truncate text-xs opacity-80">
                    {c.preview}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteConversation(c.id)}
                  className="rounded-lg p-2 opacity-0 transition group-hover:opacity-100 theme-text-muted hover:text-red-400"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {savedPrompts.length > 0 && (
          <>
            <p className="mt-6 px-1 text-xs font-medium uppercase tracking-wider theme-text-muted">
              Saved prompts
            </p>
            <ul className="mt-2 space-y-1">
              {savedPrompts.map((p) => (
                <li key={p.id} className="group flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onUsePrompt(p.text);
                      onCloseMobile?.();
                    }}
                    className="flex min-w-0 flex-1 items-start gap-2 rounded-lg px-3 py-2 text-left text-xs theme-text-muted hover:theme-list-item hover:theme-text"
                  >
                    <Bookmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" />
                    <span className="line-clamp-2">{p.text}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemovePrompt(p.id)}
                    className="rounded p-1.5 opacity-0 group-hover:opacity-100 theme-text-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r theme-border theme-surface/40 lg:flex">
        {panel}
      </aside>
      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-[min(100%,18rem)] flex-col border-r theme-border glass-panel shadow-panel lg:hidden">
          {panel}
        </aside>
      )}
    </>
  );
}

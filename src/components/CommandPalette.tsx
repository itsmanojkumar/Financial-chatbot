import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AppView } from "../types/app";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onNewChat: () => void;
  onSendPrompt: (text: string) => void;
  prompts: readonly string[];
};

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  onNewChat,
  onSendPrompt,
  prompts,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const actions = useMemo(() => {
    const base = [
      { id: "new", label: "New conversation", run: onNewChat },
      { id: "chat", label: "Go to Chat", run: () => onNavigate("chat") },
      { id: "edgar", label: "Open SEC EDGAR Explorer", run: () => onNavigate("edgar") },
      { id: "insights", label: "Go to Insights", run: () => onNavigate("insights") },
      { id: "pricing", label: "Go to Pricing", run: () => onNavigate("pricing") },
      ...prompts.map((p, i) => ({
        id: `p-${i}`,
        label: p,
        run: () => onSendPrompt(p),
      })),
    ];
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((a) => a.label.toLowerCase().includes(q));
  }, [query, onNewChat, onNavigate, onSendPrompt, prompts]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-2xl glass-panel shadow-panel"
        >
          <div className="flex items-center gap-3 border-b theme-border px-4 py-3">
            <Search className="h-5 w-5 theme-text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actions and prompts…"
              className="flex-1 bg-transparent text-sm theme-text outline-none placeholder:theme-text-muted"
            />
          </div>
          <ul className="scrollbar-thin max-h-72 overflow-y-auto py-2">
            {actions.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm theme-text hover:theme-list-item"
                  onClick={() => {
                    a.run();
                    onClose();
                  }}
                >
                  {a.label}
                </button>
              </li>
            ))}
            {actions.length === 0 && (
              <li className="px-4 py-6 text-center text-sm theme-text-muted">
                No matches
              </li>
            )}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

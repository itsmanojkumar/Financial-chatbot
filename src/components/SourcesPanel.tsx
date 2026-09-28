import { AnimatePresence, motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import type { SourceCitation } from "../types/chat";

type SourcesPanelProps = {
  sources: SourceCitation[] | null;
  onClose: () => void;
};

export function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  return (
    <AnimatePresence>
      {sources && sources.length > 0 && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-label="Close sources"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l theme-border glass-panel shadow-panel backdrop-blur-xl md:static md:z-0 md:max-w-xs md:shrink-0"
          >
            <div className="flex items-center justify-between border-b theme-border px-4 py-3">
              <h2 className="font-display text-sm font-semibold theme-text">
                Sources
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 theme-text-muted hover:theme-list-item"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
              {sources.map((src) => (
                <li
                  key={src.id}
                  className="rounded-xl border theme-border theme-surface-2 p-3"
                >
                  <div className="flex gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    <div>
                      <p className="text-sm font-medium theme-text">
                        {src.title}
                      </p>
                      <p className="mt-0.5 text-xs theme-text-muted">
                        {src.reportYear && `FY ${src.reportYear}`}
                        {src.reportYear && src.page != null && " · "}
                        {src.page != null && `p. ${src.page}`}
                      </p>
                      {src.snippet && (
                        <p className="mt-2 text-xs leading-relaxed theme-text-muted">
                          “{src.snippet}”
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

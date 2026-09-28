import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { AppSettings, ThemeMode } from "../types/app";

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onPatch: (partial: Partial<AppSettings>) => void;
  resolvedTheme: "dark" | "light";
  onSetTheme: (mode: ThemeMode) => void;
};

export function SettingsDrawer({
  open,
  onClose,
  settings,
  onPatch,
  resolvedTheme,
  onSetTheme,
}: SettingsDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close settings"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col glass-panel shadow-panel"
          >
            <div className="flex items-center justify-between border-b theme-border px-5 py-4">
              <h2 className="font-display text-lg font-semibold theme-text">
                Settings
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 theme-text-muted hover:theme-list-item"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 space-y-8 overflow-y-auto p-5">
              <section>
                <h3 className="text-xs font-medium uppercase tracking-wider theme-text-muted">
                  Appearance
                </h3>
                <p className="mt-1 text-sm theme-text-muted">
                  Currently {resolvedTheme} mode
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["dark", "light", "system"] as ThemeMode[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        onSetTheme(t);
                        onPatch({ theme: t });
                      }}
                      className={`rounded-xl py-2 text-sm capitalize transition ${
                        settings.theme === t
                          ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 ring-1 ring-gold-500/30"
                          : "theme-btn-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium uppercase tracking-wider theme-text-muted">
                  Chat experience
                </h3>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
                  <span className="text-sm theme-text">Compact message spacing</span>
                  <input
                    type="checkbox"
                    checked={settings.compactChat}
                    onChange={(e) =>
                      onPatch({ compactChat: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-400 accent-gold-500"
                  />
                </label>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
                  <span className="text-sm theme-text">Show insights strip in chat</span>
                  <input
                    type="checkbox"
                    checked={settings.showInsightsStrip}
                    onChange={(e) =>
                      onPatch({ showInsightsStrip: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-gold-500"
                  />
                </label>
              </section>

              <section>
                <h3 className="text-xs font-medium uppercase tracking-wider theme-text-muted">
                  Keyboard
                </h3>
                <ul className="mt-3 space-y-2 text-sm theme-text-muted">
                  <li>
                    <kbd className="theme-kbd">Ctrl</kbd> +{" "}
                    <kbd className="theme-kbd">K</kbd> — Command palette
                  </li>
                  <li>
                    <kbd className="theme-kbd">Ctrl</kbd> +{" "}
                    <kbd className="theme-kbd">N</kbd> — New chat
                  </li>
                  <li>
                    <kbd className="theme-kbd">Ctrl</kbd> +{" "}
                    <kbd className="theme-kbd">/</kbd> — Focus input
                  </li>
                </ul>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "framer-motion";

type UpgradeToastProps = {
  show: boolean;
  onDismiss: () => void;
  onUpgrade: () => void;
};

export function UpgradeToast({ show, onDismiss, onUpgrade }: UpgradeToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 z-50 w-[min(100%,24rem)] -translate-x-1/2 rounded-2xl glass-panel p-4 shadow-panel"
        >
          <p className="text-sm font-medium theme-text">Monthly limit reached</p>
          <p className="mt-1 text-xs theme-text-muted">
            Upgrade to Pro for unlimited questions, exports, and multi-year
            compare.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onUpgrade}
              className="flex-1 rounded-lg bg-gold-500 py-2 text-sm font-medium text-ink-950"
            >
              View pricing
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-3 py-2 text-sm theme-text-muted hover:theme-list-item"
            >
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

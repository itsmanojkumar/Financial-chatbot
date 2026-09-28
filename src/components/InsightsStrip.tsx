import { Flame, Sparkles, Zap } from "lucide-react";

type InsightsStripProps = {
  remaining: number | null;
  streakDays: number;
  onUpgrade: () => void;
};

export function InsightsStrip({
  remaining,
  streakDays,
  onUpgrade,
}: InsightsStripProps) {
  return (
    <div className="shrink-0 border-b theme-border theme-surface-2/80 px-4 py-2 md:px-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs theme-text-muted">
        {remaining != null && (
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-gold-500" />
            {remaining} free questions left this month
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          {streakDays}-day research streak
        </span>
        {remaining != null && remaining < 15 && (
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex items-center gap-1 font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade for unlimited
          </button>
        )}
      </div>
    </div>
  );
}

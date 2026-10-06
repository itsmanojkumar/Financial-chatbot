import { motion } from "framer-motion";
import {
  Activity,
  BarChart2,
  Clock,
  Flame,
  MessageSquare,
  Target,
} from "lucide-react";

type InsightsDashboardProps = {
  questionsThisMonth: number;
  limit: number | null;
  streakDays: number;
  conversationsCount: number;
  onAskSample: (q: string) => void;
};

const TRENDING = [
  { label: "Revenue mix", change: "+12% YoY", hot: true },
  { label: "Operating margin", change: "Stable", hot: false },
  { label: "ESG commitments", change: "New disclosure", hot: true },
  { label: "Debt covenants", change: "Footnote 14", hot: false },
];

const DEEP_DIVES = [
  "Build a 3-year revenue bridge from segment footnotes.",
  "List all material related-party transactions disclosed.",
  "Summarize auditor emphasis-of-matter paragraphs.",
];

const WEEKLY_ACTIVITY = [32, 46, 58, 63, 71, 88, 74];
const LATENCY_BREAKDOWN = [
  { label: "Search", value: 82 },
  { label: "Rerank", value: 64 },
  { label: "Source fetch", value: 49 },
];

export function InsightsDashboard({
  questionsThisMonth,
  limit,
  streakDays,
  conversationsCount,
  onAskSample,
}: InsightsDashboardProps) {
  const usagePct =
    limit != null ? Math.min(100, (questionsThisMonth / limit) * 100) : 12;
  const p95LatencyMs = 2140;
  const insightCoverage = 87;

  return (
    <div className="scrollbar-thin mx-auto max-w-5xl flex-1 overflow-y-auto px-4 py-10 md:px-8">
      <h2 className="font-display text-2xl font-semibold theme-text md:text-3xl">
        Research pulse
      </h2>
      <p className="mt-2 theme-text-muted">
        Your activity, trending topics in indexed filings, and prompts worth
        revisiting.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: MessageSquare,
            label: "Questions this month",
            value: limit != null ? `${questionsThisMonth} / ${limit}` : questionsThisMonth,
          },
          {
            icon: Flame,
            label: "Day streak",
            value: `${streakDays} day${streakDays === 1 ? "" : "s"}`,
          },
          {
            icon: Clock,
            label: "Saved threads",
            value: String(conversationsCount),
          },
          {
            icon: Target,
            label: "Avg. source depth",
            value: "3.2 pages",
          },
        ].map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-2xl p-4"
          >
            <Icon className="h-5 w-5 text-gold-500" strokeWidth={1.75} />
            <p className="mt-3 text-2xl font-semibold theme-text">{value}</p>
            <p className="text-xs theme-text-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      {limit != null && (
        <div className="mt-6 glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="theme-text-muted">Free plan usage</span>
            <span className="font-medium theme-text">{Math.round(usagePct)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-gold-500 transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-500" />
              <h3 className="font-medium theme-text">Weekly research activity</h3>
            </div>
            <span className="text-xs theme-text-muted">Last 7 days</span>
          </div>
          <div className="mt-5 flex h-36 items-end gap-3">
            {WEEKLY_ACTIVITY.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-teal-500 via-teal-400 to-gold-400"
                  style={{ height: `${value}%` }}
                  title={`${value} queries`}
                />
                <span className="text-[10px] theme-text-muted">
                  {"MTWTFSS"[index]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gold-500" />
            <h3 className="font-medium theme-text">Insight speed</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-3xl font-semibold theme-text">{p95LatencyMs}ms</p>
              <p className="text-xs theme-text-muted">p95 retrieval + rerank latency</p>
            </div>
            <div className="space-y-3">
              {LATENCY_BREAKDOWN.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs theme-text-muted">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-500 to-teal-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-500" />
            <h3 className="font-medium theme-text">Trending in your corpus</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {TRENDING.map((t) => (
              <li
                key={t.label}
                className="flex items-center justify-between rounded-lg theme-list-item px-3 py-2 text-sm"
              >
                <span className="theme-text">{t.label}</span>
                <span
                  className={
                    t.hot ? "text-gold-500" : "theme-text-muted"
                  }
                >
                  {t.change}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gold-500" />
            <h3 className="font-medium theme-text">Deep-dive starters</h3>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {DEEP_DIVES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onAskSample(q)}
                className="rounded-xl theme-prompt-btn px-4 py-3 text-left text-sm transition"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="theme-text-muted">Insight coverage</span>
              <span className="font-medium theme-text">{insightCoverage}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                style={{ width: `${insightCoverage}%` }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

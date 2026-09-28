import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type WelcomeHeroProps = {
  onSelectPrompt: (prompt: string) => void;
  prompts: readonly string[];
  onViewPricing: () => void;
  onViewInsights: () => void;
};

const highlights = [
  {
    icon: FileText,
    title: "Filings, decoded",
    desc: "Ask in plain language — get answers grounded in your indexed reports.",
  },
  {
    icon: TrendingUp,
    title: "Numbers with context",
    desc: "Revenue, margins, cash flow, and segment trends with narrative insight.",
  },
  {
    icon: Shield,
    title: "Risk & governance",
    desc: "Surface disclosures, footnotes, and board statements instantly.",
  },
  {
    icon: BarChart3,
    title: "Cited sources",
    desc: "Every answer links back to page-level excerpts from your RAG pipeline.",
  },
] as const;

export function WelcomeHero({
  onSelectPrompt,
  prompts,
  onViewPricing,
  onViewInsights,
}: WelcomeHeroProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center md:py-14">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gold-500"
      >
        Clarity from complexity
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="font-display text-3xl font-semibold leading-tight theme-text md:text-4xl lg:text-[2.75rem]"
      >
        Your annual reports,
        <span className="text-gradient-gold"> conversationally.</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 max-w-xl text-base leading-relaxed theme-text-muted md:text-lg"
      >
        Explore MD&A, financial statements, and risk disclosures like you would
        with a trusted analyst — fast, precise, and source-backed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-6 flex flex-wrap justify-center gap-3"
      >
        <button
          type="button"
          onClick={onViewInsights}
          className="inline-flex items-center gap-2 rounded-full theme-btn-secondary px-4 py-2 text-sm"
        >
          <BarChart3 className="h-4 w-4 text-teal-500" />
          Open insights
        </button>
        <button
          type="button"
          onClick={onViewPricing}
          className="inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-4 py-2 text-sm font-medium text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300"
        >
          <Sparkles className="h-4 w-4" />
          See pricing
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-10 grid w-full gap-3 sm:grid-cols-2"
      >
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="glass-panel rounded-2xl p-4 text-left shadow-panel transition hover:border-gold-500/20"
          >
            <Icon className="mb-2 h-5 w-5 text-teal-500" strokeWidth={1.75} />
            <h3 className="text-sm font-medium theme-text">{title}</h3>
            <p className="mt-1 text-sm leading-snug theme-text-muted">{desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-10 w-full"
      >
        <p className="mb-3 text-left text-xs font-medium uppercase tracking-wider theme-text-muted">
          Try asking
        </p>
        <div className="flex flex-col gap-2">
          {prompts.slice(0, 5).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="theme-prompt-btn rounded-xl px-4 py-3 text-left text-sm transition"
            >
              <span className="line-clamp-2">{prompt}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

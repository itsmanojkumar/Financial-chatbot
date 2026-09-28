import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { PRICING_TIERS } from "../data/pricing";
import type { UserPlan } from "../types/app";

type PricingPageProps = {
  currentPlan: UserPlan;
  onSelectPlan: (plan: UserPlan) => void;
  onStartChat: () => void;
};

export function PricingPage({
  currentPlan,
  onSelectPlan,
  onStartChat,
}: PricingPageProps) {
  return (
    <div className="scrollbar-thin mx-auto max-w-6xl flex-1 overflow-y-auto px-4 py-10 md:px-8 md:py-14">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-500">
          Simple, transparent pricing
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold theme-text md:text-4xl">
          Invest in clarity on every filing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base theme-text-muted">
          Start free, upgrade when you need deeper history, exports, and
          multi-year compare — built for people who stay in the terminal all
          day.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {PRICING_TIERS.map((tier, i) => {
          const isCurrent =
            tier.id !== "enterprise" && tier.id === currentPlan;
          const isPro = tier.highlighted;

          return (
            <motion.article
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative flex flex-col rounded-2xl p-6 ${
                isPro
                  ? "glass-panel shadow-glow ring-2 ring-gold-500/40"
                  : "glass-panel"
              }`}
            >
              {isPro && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-medium text-ink-950">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-semibold theme-text">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm theme-text-muted">{tier.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold theme-text">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm theme-text-muted">{tier.period}</span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex gap-2 text-sm theme-text-muted"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent}
                onClick={() => {
                  if (tier.id === "enterprise") return;
                  if (tier.id === "free" || tier.id === "pro" || tier.id === "team") {
                    onSelectPlan(tier.id);
                  }
                  if (tier.id === "pro") onStartChat();
                }}
                className={`mt-6 w-full rounded-xl py-2.5 text-sm font-medium transition ${
                  isCurrent
                    ? "cursor-default bg-white/5 theme-text-muted"
                    : isPro
                      ? "bg-gradient-to-r from-gold-500 to-gold-600 text-ink-950 hover:from-gold-400 hover:to-gold-500"
                      : "theme-btn-secondary"
                }`}
              >
                {isCurrent ? "Current plan" : tier.cta}
              </button>
            </motion.article>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs theme-text-muted">
        All plans include encrypted transit, citation-backed answers, and
        read-only access to your indexed reports. Cancel anytime.
      </p>
    </div>
  );
}

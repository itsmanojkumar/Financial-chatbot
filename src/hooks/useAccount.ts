import { useCallback, useEffect, useState } from "react";
import type { UserPlan } from "../types/app";

export type Account = {
  plan: Extract<UserPlan, "free" | "pro">;
  /** Milliseconds since the epoch; null on the free plan. */
  paidUntil: number | null;
  questionsUsed: number;
  /** Null when the plan has no monthly limit. */
  questionLimit: number | null;
};

/**
 * The signed-in user's plan and monthly usage, as the backend records them.
 * Null when signed out or when the backend has no account storage, in which
 * case the app falls back to counting questions in the browser.
 */
export function useAccount(userId: string | undefined) {
  const [account, setAccount] = useState<Account | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setAccount(null);
      return null;
    }
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      const next = response.ok ? ((await response.json()) as Account) : null;
      setAccount(next);
      return next;
    } catch {
      setAccount(null);
      return null;
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const countQuestion = useCallback(() => {
    setAccount((current) =>
      current ? { ...current, questionsUsed: current.questionsUsed + 1 } : current,
    );
  }, []);

  return { account, setAccount, refresh, countQuestion };
}

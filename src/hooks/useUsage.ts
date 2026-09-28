import { useCallback, useMemo, useState } from "react";
import { loadJson, saveJson } from "../lib/storage";
import type { UserPlan } from "../types/app";

const KEY = "ledgermind_usage";

type UsageState = {
  month: string;
  questions: number;
  streakDays: number;
  lastActiveDate: string;
};

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function dateKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultUsage(): UsageState {
  return {
    month: monthKey(),
    questions: 0,
    streakDays: 1,
    lastActiveDate: dateKey(),
  };
}

const LIMITS: Record<UserPlan, number | null> = {
  free: 50,
  pro: null,
  team: null,
};

export function useUsage(plan: UserPlan) {
  const [usage, setUsage] = useState<UsageState>(() => {
    const u = loadJson(KEY, defaultUsage());
    if (u.month !== monthKey()) {
      return { ...u, month: monthKey(), questions: 0 };
    }
    return u;
  });

  const limit = LIMITS[plan];

  const remaining = useMemo(() => {
    if (limit == null) return null;
    return Math.max(0, limit - usage.questions);
  }, [limit, usage.questions]);

  const recordQuestion = useCallback(() => {
    setUsage((prev) => {
      const today = dateKey();
      let streak = prev.streakDays;
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        streak = prev.lastActiveDate === yKey ? prev.streakDays + 1 : 1;
      }
      const next: UsageState = {
        month: monthKey(),
        questions:
          prev.month === monthKey() ? prev.questions + 1 : 1,
        streakDays: streak,
        lastActiveDate: today,
      };
      saveJson(KEY, next);
      return next;
    });
  }, []);

  const canAsk = limit == null || usage.questions < limit;

  return {
    usage,
    limit,
    remaining,
    canAsk,
    recordQuestion,
  };
}

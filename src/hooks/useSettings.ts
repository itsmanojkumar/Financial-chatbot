import { useCallback, useState } from "react";
import { loadJson, saveJson } from "../lib/storage";
import type { AppSettings, UserPlan } from "../types/app";

const STORAGE_KEY = "ledgermind_settings";

const DEFAULT: AppSettings = {
  theme: "light",
  compactChat: false,
  showInsightsStrip: true,
  plan: "free",
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadJson(STORAGE_KEY, DEFAULT),
  );

  const patch = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveJson(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setPlan = useCallback(
    (plan: UserPlan) => patch({ plan }),
    [patch],
  );

  return { settings, patch, setPlan };
}

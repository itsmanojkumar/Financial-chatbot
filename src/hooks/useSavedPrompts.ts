import { useCallback, useState } from "react";
import { createId } from "../lib/id";
import { loadJson, saveJson } from "../lib/storage";
import type { SavedPrompt } from "../types/app";

const KEY = "ledgermind_saved_prompts";

export function useSavedPrompts() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(() =>
    loadJson(KEY, []),
  );

  const save = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPrompts((prev) => {
      if (prev.some((p) => p.text === trimmed)) return prev;
      const next = [
        { id: createId("prompt"), text: trimmed, createdAt: Date.now() },
        ...prev,
      ].slice(0, 12);
      saveJson(KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveJson(KEY, next);
      return next;
    });
  }, []);

  return { prompts, save, remove };
}

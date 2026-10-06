import { useCallback, useEffect, useState } from "react";
import { createId } from "../lib/id";
import { loadJson, saveJson } from "../lib/storage";
import type { ConversationSummary } from "../types/app";
import type { ChatMessage } from "../types/chat";

const LIST_KEY = "ledgermind_conversations";
const MSG_PREFIX = "ledgermind_msgs_";

function titleFromMessages(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  return first.content.slice(0, 48) + (first.content.length > 48 ? "…" : "");
}

export function useConversations(userId?: string) {
  const listKey = userId ? `${LIST_KEY}_${encodeURIComponent(userId)}` : LIST_KEY;
  const messagePrefix = userId
    ? `${MSG_PREFIX}${encodeURIComponent(userId)}_`
    : MSG_PREFIX;
  const [list, setList] = useState<ConversationSummary[]>(() => loadJson(listKey, []));
  const [activeId, setActiveId] = useState<string | undefined>();

  useEffect(() => {
    setList(loadJson<ConversationSummary[]>(listKey, []));
    setActiveId(undefined);
    if (!userId) return;

    let cancelled = false;
    void fetch("/api/conversations", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as {
          conversations?: ConversationSummary[];
        };
        if (cancelled || !data.conversations) return;
        setList((current) => {
          const remoteIds = new Set(data.conversations?.map((item) => item.id));
          const merged = [
            ...data.conversations!,
            ...current.filter((item) => !remoteIds.has(item.id)),
          ].sort((a, b) => b.updatedAt - a.updatedAt);
          saveJson(listKey, merged);
          return merged;
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [listKey, userId]);

  const loadMessages = useCallback(async (id: string): Promise<ChatMessage[]> => {
    if (userId) {
      try {
        const response = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = (await response.json()) as { messages?: ChatMessage[] };
          if (data.messages) {
            saveJson(messagePrefix + id, data.messages);
            return data.messages;
          }
        }
      } catch {
        return loadJson<ChatMessage[]>(messagePrefix + id, []);
      }
    }
    return loadJson<ChatMessage[]>(messagePrefix + id, []);
  }, [messagePrefix, userId]);

  const saveSession = useCallback(
    (messages: ChatMessage[], sessionId?: string) => {
      if (messages.length === 0) return sessionId;
      const id = sessionId ?? createId("conv");

      const preview =
        messages.find((m) => m.role === "assistant" && m.content)?.content ??
        messages[messages.length - 1]?.content ??
        "";

      const summary: ConversationSummary = {
        id,
        title: titleFromMessages(messages),
        updatedAt: Date.now(),
        messageCount: messages.length,
        preview: preview.slice(0, 120),
      };

      saveJson(messagePrefix + id, messages);
      setList((prev) => {
        const next = [summary, ...prev.filter((c) => c.id !== id)].slice(0, 20);
        saveJson(listKey, next);
        return next;
      });

      return id;
    },
    [listKey, messagePrefix],
  );

  const deleteConversation = useCallback((id: string) => {
    localStorage.removeItem(messagePrefix + id);
    setList((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveJson(listKey, next);
      return next;
    });
    setActiveId((cur) => (cur === id ? undefined : cur));
    if (userId) {
      void fetch(`/api/conversations/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
  }, [listKey, messagePrefix, userId]);

  return {
    conversations: list,
    activeId,
    setActiveId,
    loadMessages,
    saveSession,
    deleteConversation,
  };
}

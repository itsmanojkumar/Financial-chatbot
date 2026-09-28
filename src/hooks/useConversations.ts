import { useCallback, useState } from "react";
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

export function useConversations() {
  const [list, setList] = useState<ConversationSummary[]>(() =>
    loadJson(LIST_KEY, []),
  );
  const [activeId, setActiveId] = useState<string | undefined>();

  const loadMessages = useCallback((id: string): ChatMessage[] => {
    return loadJson<ChatMessage[]>(MSG_PREFIX + id, []);
  }, []);

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

      saveJson(MSG_PREFIX + id, messages);
      setList((prev) => {
        const next = [summary, ...prev.filter((c) => c.id !== id)].slice(0, 20);
        saveJson(LIST_KEY, next);
        return next;
      });

      return id;
    },
    [],
  );

  const deleteConversation = useCallback((id: string) => {
    localStorage.removeItem(MSG_PREFIX + id);
    setList((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveJson(LIST_KEY, next);
      return next;
    });
    setActiveId((cur) => (cur === id ? undefined : cur));
  }, []);

  return {
    conversations: list,
    activeId,
    setActiveId,
    loadMessages,
    saveSession,
    deleteConversation,
  };
}

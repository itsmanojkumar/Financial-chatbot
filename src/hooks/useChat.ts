import { useCallback, useEffect, useRef, useState } from "react";
import { streamChatMessage } from "../api/chat";
import { createId } from "../lib/id";
import type { ChatMessage, SourceCitation } from "../types/chat";

const SUGGESTED_PROMPTS = [
  "Summarize revenue and margin trends from the latest annual report.",
  "What are the top three risk factors disclosed this year?",
  "How did operating cash flow change versus last year?",
  "Explain the dividend policy and payout rationale.",
  "Compare segment performance and geographic mix.",
  "What governance or ESG commitments did the board highlight?",
] as const;

type UseChatOptions = {
  onAfterReply?: (messages: ChatMessage[], sessionId?: string) => string | void;
  onBeforeSend?: () => boolean;
  sessionId?: string;
};

export function useChat(options: UseChatOptions = {}) {
  const { onAfterReply, onBeforeSend, sessionId } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    sessionId,
  );
  const [activeSources, setActiveSources] = useState<SourceCitation[] | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef(sessionId);

  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      if (onBeforeSend && !onBeforeSend()) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = {
        id: createId("user"),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        status: "done",
      };

      const assistantId = createId("assistant");
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        status: "streaming",
      };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setIsLoading(true);

      try {
        const result = await streamChatMessage(
          { message: trimmed, conversationId },
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk }
                  : m,
              ),
            );
          },
          controller.signal,
        );

        if (result.conversationId) {
          setConversationId(result.conversationId);
        }

        const finalMessages: ChatMessage[] = [
          ...messages,
          userMsg,
          {
            ...assistantPlaceholder,
            content: result.reply,
            sources: result.sources,
            status: "done",
          },
        ];
        setMessages(finalMessages);

        if (result.sources?.length) {
          setActiveSources(result.sources);
        }

        if (onAfterReply) {
          const newId = onAfterReply(finalMessages, sessionRef.current);
          if (typeof newId === "string") sessionRef.current = newId;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `I couldn't reach the analysis service.\n\n${message}`,
                  status: "error",
                }
              : m,
          ),
        );
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
          abortRef.current = null;
        }
      }
    },
    [conversationId, isLoading, messages, onAfterReply, onBeforeSend],
  );

  const stopGenerating = useCallback(() => {
    const controller = abortRef.current;
    if (!controller) return;

    controller.abort();
    abortRef.current = null;
    setMessages((prev) =>
      prev.map((message) =>
        message.status === "streaming"
          ? { ...message, status: "done" }
          : message,
      ),
    );
    setIsLoading(false);
  }, []);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(undefined);
    sessionRef.current = undefined;
    setActiveSources(null);
    setIsLoading(false);
  }, []);

  const loadSession = useCallback(
    (id: string, loaded: ChatMessage[]) => {
      abortRef.current?.abort();
      setMessages(loaded);
      setConversationId(id);
      sessionRef.current = id;
      setActiveSources(null);
      setIsLoading(false);
    },
    [],
  );

  const showSources = useCallback((sources: SourceCitation[]) => {
    setActiveSources(sources);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    stopGenerating,
    clearChat,
    loadSession,
    suggestedPrompts: SUGGESTED_PROMPTS,
    activeSources,
    setActiveSources,
    showSources,
    sessionId: sessionRef.current,
  };
}

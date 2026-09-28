import { useEffect, useRef } from "react";
import type { ChatMessage, SourceCitation } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

type MessageListProps = {
  messages: ChatMessage[];
  compact?: boolean;
  onShowSources: (sources: SourceCitation[]) => void;
  onSavePrompt: (text: string) => void;
};

export function MessageList({
  messages,
  compact,
  onShowSources,
  onSavePrompt,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <div
        className={`mx-auto flex max-w-3xl flex-col ${compact ? "gap-4" : "gap-6"}`}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            compact={compact}
            onShowSources={
              msg.sources?.length
                ? () => onShowSources(msg.sources!)
                : undefined
            }
            onSavePrompt={msg.role === "user" ? onSavePrompt : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

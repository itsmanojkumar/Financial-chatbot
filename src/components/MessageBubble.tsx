import { motion } from "framer-motion";
import { Bot, User, Link2, Copy, Bookmark } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
  compact?: boolean;
  onShowSources?: () => void;
  onSavePrompt?: (text: string) => void;
};

export function MessageBubble({
  message,
  compact,
  onShowSources,
  onSavePrompt,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const hasSources = (message.sources?.length ?? 0) > 0;

  const copyContent = async () => {
    await navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${compact ? "gap-2" : ""} ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl ring-1 theme-border ${
          compact ? "h-8 w-8" : "h-9 w-9"
        } ${
          isUser
            ? "bg-gold-500/15 text-gold-500"
            : "bg-teal-500/10 text-teal-500"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Bot className="h-4 w-4" strokeWidth={2} />
        )}
      </div>
      <div
        className={`max-w-[min(100%,42rem)] ${isUser ? "text-right" : "text-left"}`}
      >
        <div
          className={`inline-block rounded-2xl px-4 text-left leading-relaxed theme-text ${
            compact ? "py-2 text-sm" : "py-3 text-[15px]"
          } ${
            isUser
              ? "rounded-tr-md bg-gold-500/15 ring-1 ring-gold-500/20"
              : "rounded-tl-md glass-panel shadow-panel"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-theme">
              {isStreaming && !message.content && (
                <div className="flex items-center gap-2.5 py-0.5 text-sm theme-text-muted" role="status">
                  <span className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" />
                  </span>
                  {message.progress ?? "Thinking…"}
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Financial statements are wider than the bubble; scroll them sideways.
                  table: ({ node: _node, ...props }) => (
                    <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
                      <table {...props} />
                    </div>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && message.content && (
                <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-full bg-teal-400/80 align-middle" />
              )}
            </div>
          )}
        </div>
        <div
          className={`mt-1.5 flex flex-wrap items-center gap-3 ${isUser ? "justify-end" : ""}`}
        >
          {!isUser && hasSources && onShowSources && (
            <button
              type="button"
              onClick={onShowSources}
              className="inline-flex items-center gap-1.5 text-xs theme-text-muted transition hover:text-gold-500"
            >
              <Link2 className="h-3.5 w-3.5" />
              {message.sources!.length} source
              {message.sources!.length === 1 ? "" : "s"}
            </button>
          )}
          {message.content && !isStreaming && (
            <button
              type="button"
              onClick={copyContent}
              className="inline-flex items-center gap-1 text-xs theme-text-muted hover:theme-text"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          )}
          {isUser && onSavePrompt && (
            <button
              type="button"
              onClick={() => onSavePrompt(message.content)}
              className="inline-flex items-center gap-1 text-xs theme-text-muted hover:text-gold-500"
            >
              <Bookmark className="h-3 w-3" />
              Save
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

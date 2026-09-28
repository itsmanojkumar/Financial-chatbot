import { motion } from "framer-motion";
import { ArrowUp, Loader2, Mic } from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
};

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask about revenue, risks, cash flow, governance…",
  inputRef: externalRef,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend, textareaRef]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="shrink-0 border-t theme-border theme-footer-bg px-4 py-4 backdrop-blur-md md:px-6">
      <motion.div
        layout
        className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-b from-black/[0.04] to-transparent p-[1px] shadow-glow dark:from-white/[0.08] dark:to-white/[0.02]"
      >
        <div className="flex items-end gap-2 rounded-2xl theme-input-bg p-2 pl-4 ring-1 theme-border">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onInput={onInput}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[15px] theme-text outline-none placeholder:theme-text-muted disabled:opacity-50"
          />
          <button
            type="button"
            disabled
            title="Voice input (coming soon)"
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-text-muted opacity-40 sm:flex"
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 text-ink-950 transition hover:from-gold-400 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </motion.div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] theme-text-muted">
        Answers are generated from your indexed filings. Verify material decisions
        against original documents.
      </p>
    </div>
  );
}

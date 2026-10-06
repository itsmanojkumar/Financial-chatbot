import type { ChatRequest, ChatResponse } from "../types/chat";

const ALLOW_DIRECT_CHAT_API =
  process.env.NEXT_PUBLIC_ALLOW_DIRECT_CHAT_API === "true";
const API_BASE = ALLOW_DIRECT_CHAT_API
  ? (process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_RAG_API_BASE_URL ??
      "")
  : "";
const USE_DEMO =
  process.env.NEXT_PUBLIC_USE_DEMO === "true" ||
  process.env.NEXT_PUBLIC_USE_DEMO === "1";

function demoReply(message: string): ChatResponse {
  const lower = message.toLowerCase();
  let reply =
    "I searched your indexed annual reports. Connect your RAG backend with `RAG_API_BASE_URL` on the server, or enable direct browser access only if your upstream service supports CORS.";

  if (lower.includes("revenue") || lower.includes("sales")) {
    reply =
      "Based on the latest filing, **total revenue** grew year-over-year, with the strongest contribution from core operations. Segment mix shifted slightly toward recurring income streams — see the Management Discussion section for narrative context.\n\n*Demo mode — wire your pipeline for exact figures and page references.*";
  } else if (lower.includes("risk") || lower.includes("debt")) {
    reply =
      "The **Risk Factors** section highlights macro exposure, currency volatility, and supply-chain concentration. Liquidity remains supported by operating cash flow; covenant headroom is discussed in the notes to the financial statements.\n\n*Demo mode — your RAG backend will return sourced excerpts.*";
  } else if (lower.includes("dividend") || lower.includes("payout")) {
    reply =
      "**Dividend policy** is framed around sustainable payout ratios and reinvestment in growth initiatives. The board’s statement ties distributions to free cash flow and balance-sheet strength.\n\n*Demo mode.*";
  }

  return {
    reply,
    conversationId: "demo",
    sources: [
      {
        id: "demo-1",
        title: "Annual Report — Management Discussion",
        page: 12,
        reportYear: 2024,
        snippet: "Revenue and operating performance overview…",
      },
      {
        id: "demo-2",
        title: "Annual Report — Notes to Financial Statements",
        page: 87,
        reportYear: 2024,
        snippet: "Liquidity, capital resources, and commitments…",
      },
    ],
  };
}

/** Error from the chat API, keeping the HTTP status (402 means the free limit is used up). */
export class ChatRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ChatRequestError";
  }
}

async function chatRequestError(res: Response): Promise<ChatRequestError> {
  const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
  const message =
    typeof body?.error === "string"
      ? body.error
      : `Request failed (${res.status}). Is your RAG API running?`;
  return new ChatRequestError(message, res.status);
}

export async function sendChatMessage(
  payload: ChatRequest,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  if (USE_DEMO) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return demoReply(payload.message);
  }

  const url = API_BASE ? new URL("/api/chat", API_BASE).toString() : "/api/chat";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) throw await chatRequestError(res);

  const data = (await res.json()) as ChatResponse & { answer?: string };
  return {
    reply: data.reply ?? data.answer ?? "",
    conversationId: data.conversationId,
    sources: data.sources,
  };
}

/** Optional: streaming endpoint — POST /api/chat/stream, SSE or NDJSON */
export async function streamChatMessage(
  payload: ChatRequest,
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  if (USE_DEMO) {
    const full = demoReply(payload.message);
    const words = full.reply.split(/(\s+)/);
    let streamedReply = "";
    for (const w of words) {
      if (signal?.aborted) break;
      streamedReply += w;
      onToken(w);
      await new Promise((r) => setTimeout(r, 18));
    }
    return { ...full, reply: streamedReply };
  }

  const url = API_BASE
    ? new URL("/api/chat/stream", API_BASE).toString()
    : "/api/chat/stream";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  // A refused request (limit reached, bad input) fails the same way without
  // streaming, so only fall back for server-side failures.
  if (res.status >= 400 && res.status < 500) throw await chatRequestError(res);
  if (!res.ok) {
    return sendChatMessage(payload, signal);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return sendChatMessage(payload, signal);
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let responseConversationId = payload.conversationId;
  let sources: ChatResponse["sources"];
  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  const isEventStream = contentType.includes("text/event-stream");
  const isJsonLines =
    contentType.includes("ndjson") || contentType.includes("jsonl");

  const consumeData = (data: string) => {
    if (!data || data === "[DONE]") return;
    try {
      const parsed = JSON.parse(data) as {
        token?: string;
        delta?: string;
        reply?: string;
        answer?: string;
        conversationId?: string;
        sources?: ChatResponse["sources"];
      };
      const chunk = parsed.token ?? parsed.delta ?? parsed.reply ?? parsed.answer;
      if (chunk) {
        fullText += chunk;
        onToken(chunk);
      }
      responseConversationId = parsed.conversationId ?? responseConversationId;
      sources = parsed.sources ?? sources;
    } catch {
      fullText += data;
      onToken(data);
    }
  };

  const consumeEvent = (event: string) => {
    const data = event
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    consumeData(data);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      break;
    }

    const decoded = decoder.decode(value, { stream: true });
    if (!isEventStream && !isJsonLines && !contentType.includes("application/json")) {
      fullText += decoded;
      onToken(decoded);
      continue;
    }

    buffer += decoded;
    if (isEventStream) {
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) consumeEvent(event);
    } else {
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) consumeData(line);
      }
    }
  }

  if (buffer.trim()) {
    if (isEventStream) {
      consumeEvent(buffer);
    } else if (isJsonLines) {
      consumeData(buffer);
    } else {
      try {
        const parsed = JSON.parse(buffer) as ChatResponse & { answer?: string };
        fullText = parsed.reply ?? parsed.answer ?? fullText;
        responseConversationId = parsed.conversationId ?? responseConversationId;
        sources = parsed.sources ?? sources;
      } catch {
        fullText += buffer;
        onToken(buffer);
      }
    }
  }

  return {
    reply: fullText,
    conversationId: responseConversationId,
    sources,
  };
}

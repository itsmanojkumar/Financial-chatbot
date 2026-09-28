import type { ChatRequest, ChatResponse } from "../types/chat";

const API_BASE = process.env.NEXT_PUBLIC_RAG_API_BASE_URL ?? "";
const USE_DEMO =
  process.env.NEXT_PUBLIC_USE_DEMO !== "false" &&
  process.env.NEXT_PUBLIC_USE_DEMO !== "0";

function demoReply(message: string): ChatResponse {
  const lower = message.toLowerCase();
  let reply =
    "I searched your indexed annual reports. Connect your RAG backend at `/api/chat` (or set `NEXT_PUBLIC_RAG_API_BASE_URL`) to get live answers with citations.";

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

export async function sendChatMessage(
  payload: ChatRequest,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  if (USE_DEMO) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return demoReply(payload.message);
  }

  const url = `${API_BASE}/api/chat`.replace(/([^:]\/)\/+/g, "$1");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text || `Request failed (${res.status}). Is your RAG API running?`,
    );
  }

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
    for (const w of words) {
      if (signal?.aborted) break;
      onToken(w);
      await new Promise((r) => setTimeout(r, 18));
    }
    return full;
  }

  const url = `${API_BASE}/api/chat/stream`.replace(/([^:]\/)\/+/g, "$1");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as {
          token?: string;
          delta?: string;
          done?: boolean;
          sources?: ChatResponse["sources"];
        };
        const chunk = parsed.token ?? parsed.delta ?? "";
        if (chunk) {
          fullText += chunk;
          onToken(chunk);
        }
      } catch {
        fullText += line;
        onToken(line);
      }
    }
  }

  return { reply: fullText, conversationId: payload.conversationId };
}

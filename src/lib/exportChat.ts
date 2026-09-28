import type { ChatMessage } from "../types/chat";

export function messagesToMarkdown(messages: ChatMessage[]): string {
  const lines = ["# LedgerMind conversation", ""];
  for (const m of messages) {
    if (m.role === "system") continue;
    const label = m.role === "user" ? "**You**" : "**LedgerMind**";
    lines.push(`${label}`, "", m.content, "");
    if (m.sources?.length) {
      lines.push("_Sources:_");
      for (const s of m.sources) {
        lines.push(
          `- ${s.title}${s.page != null ? ` (p. ${s.page})` : ""}`,
        );
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

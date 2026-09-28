export type SourceCitation = {
  id: string;
  title: string;
  page?: number;
  snippet?: string;
  reportYear?: number;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: SourceCitation[];
  createdAt: number;
  status?: "streaming" | "done" | "error";
};

export type ChatRequest = {
  message: string;
  conversationId?: string;
  reportIds?: string[];
};

export type ChatResponse = {
  reply: string;
  conversationId?: string;
  sources?: SourceCitation[];
};

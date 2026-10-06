export type AppView = "chat" | "pricing" | "insights" | "edgar";

export type ThemeMode = "dark" | "light" | "system";

export type UserPlan = "free" | "pro" | "team";

export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: number;
  messageCount: number;
  preview: string;
};

export type AppSettings = {
  theme: ThemeMode;
  compactChat: boolean;
  showInsightsStrip: boolean;
};

export type SavedPrompt = {
  id: string;
  text: string;
  createdAt: number;
};

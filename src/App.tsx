"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Background } from "./components/Background";
import BatchUpload from "./components/BatchUpload";
import { ChatInput } from "./components/ChatInput";
import { CommandPalette } from "./components/CommandPalette";
import { Header } from "./components/Header";
import { InsightsDashboard } from "./components/InsightsDashboard";
import { InsightsStrip } from "./components/InsightsStrip";
import { MessageList } from "./components/MessageList";
import { PricingPage } from "./components/PricingPage";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { SecExplorer } from "./components/SecExplorer";
import { Sidebar } from "./components/Sidebar";
import { SourcesPanel } from "./components/SourcesPanel";
import { UpgradeToast } from "./components/UpgradeToast";
import { WelcomeHero } from "./components/WelcomeHero";
import { useTheme } from "./context/ThemeContext";
import { useChat } from "./hooks/useChat";
import { useConversations } from "./hooks/useConversations";
import { useSavedPrompts } from "./hooks/useSavedPrompts";
import { useSettings } from "./hooks/useSettings";
import { useAccount } from "./hooks/useAccount";
import { useUsage } from "./hooks/useUsage";
import { buyProPlan } from "./lib/checkout";
import { downloadText, messagesToMarkdown } from "./lib/exportChat";
import type { AppView, UserPlan } from "./types/app";

const PLAN_LABELS = { free: "Free", pro: "Pro", team: "Team" } as const;

export default function App() {
  const { data: session, status: sessionStatus } = useSession();
  const { resolved, setMode, toggle } = useTheme();
  const { settings, patch } = useSettings();
  const { account, setAccount, refresh: refreshAccount, countQuestion } = useAccount(
    session?.user?.id,
  );
  // The plan comes from the backend; nobody becomes Pro without paying.
  const plan: UserPlan = account?.plan ?? "free";
  const localUsage = useUsage("free");
  const usage = localUsage.usage;
  const recordQuestion = localUsage.recordQuestion;
  // Signed-in users with an account are counted by the backend; everyone
  // else falls back to the count kept in this browser.
  const limit = account ? account.questionLimit : localUsage.limit;
  const questionsThisMonth = account ? account.questionsUsed : usage.questions;
  const remaining = limit == null ? null : Math.max(0, limit - questionsThisMonth);
  const canAsk = limit == null || questionsThisMonth < limit;
  const conversations = useConversations(session?.user?.id);
  const savedPrompts = useSavedPrompts();

  const [view, setView] = useState<AppView>("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [limitToast, setLimitToast] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onAfterReply = useCallback(
    (messages: Parameters<typeof conversations.saveSession>[0], sid?: string) => {
      const id = conversations.saveSession(messages, sid);
      conversations.setActiveId(id);
      return id;
    },
    [conversations],
  );

  const onBeforeSend = useCallback(() => {
    if (!canAsk) {
      setLimitToast(true);
      setView("pricing");
      return false;
    }
    recordQuestion();
    countQuestion();
    return true;
  }, [canAsk, recordQuestion, countQuestion]);

  const onLimitReached = useCallback(() => {
    setLimitToast(true);
    setView("pricing");
    void refreshAccount();
  }, [refreshAccount]);

  const upgradeToPro = useCallback(async () => {
    const upgraded = await buyProPlan(session?.user ?? {});
    if (!upgraded) return false;
    setAccount(upgraded);
    return true;
  }, [session?.user, setAccount]);

  const {
    messages,
    isLoading,
    sendMessage,
    stopGenerating,
    clearChat,
    loadSession,
    suggestedPrompts,
    activeSources,
    setActiveSources,
    showSources,
  } = useChat({
    sessionId: conversations.activeId,
    onAfterReply,
    onBeforeSend,
    onLimitReached,
  });

  useEffect(() => {
    const pendingQuestion = window.sessionStorage.getItem("ledgermind_next_prompt");
    if (!pendingQuestion) return;
    window.sessionStorage.removeItem("ledgermind_next_prompt");
    void sendMessage(pendingQuestion);
  }, [sendMessage]);

  const hasMessages = messages.length > 0;

  const goChat = useCallback(
    (text?: string) => {
      setView("chat");
      if (text) sendMessage(text);
    },
    [sendMessage],
  );

  const handleNewChat = useCallback(() => {
    conversations.setActiveId(undefined);
    clearChat();
    setView("chat");
    setMobileNav(false);
  }, [clearChat, conversations]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      const loaded = await conversations.loadMessages(id);
      conversations.setActiveId(id);
      loadSession(id, loaded);
      setView("chat");
    },
    [conversations, loadSession],
  );

  const handleExport = useCallback(() => {
    if (messages.length === 0) return;
    downloadText(
      `ledgermind-${new Date().toISOString().slice(0, 10)}.md`,
      messagesToMarkdown(messages),
    );
  }, [messages]);

  useEffect(() => {
    if (settings.theme !== resolved) patch({ theme: resolved });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewChat();
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        setView("chat");
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNewChat]);

  return (
    <div className="relative flex min-h-screen flex-col theme-bg">
      <Background />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Sidebar
          conversations={conversations.conversations}
          activeConversationId={conversations.activeId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={conversations.deleteConversation}
          savedPrompts={savedPrompts.prompts}
          onUsePrompt={(t) => goChat(t)}
          onRemovePrompt={savedPrompts.remove}
          mobileOpen={mobileNav}
          onCloseMobile={() => setMobileNav(false)}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <Header
            view={view}
            onNavigate={setView}
            onNewChat={handleNewChat}
            onOpenSettings={() => setSettingsOpen(true)}
            onExport={handleExport}
            canExport={hasMessages}
            onToggleTheme={() => {
              const nextTheme = resolved === "dark" ? "light" : "dark";
              toggle();
              patch({ theme: nextTheme });
            }}
            resolvedTheme={resolved}
            onOpenMobileNav={() => setMobileNav(true)}
            planLabel={PLAN_LABELS[plan]}
            user={session?.user}
            authLoading={sessionStatus === "loading"}
            onSignIn={() => void signIn("google", { redirectTo: "/workspace" })}
            onSignOut={() => void signOut({ redirectTo: "/signin" })}
          />
          {view === "chat" && settings.showInsightsStrip && (
            <InsightsStrip
              remaining={remaining}
              streakDays={usage.streakDays}
              onUpgrade={() => setView("pricing")}
            />
          )}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {view === "chat" && (
              <>
                {!hasMessages ? (
                  <div className="scrollbar-thin flex-1 overflow-y-auto">
                    <WelcomeHero
                      prompts={suggestedPrompts}
                      onSelectPrompt={(p) => sendMessage(p)}
                      onViewPricing={() => setView("pricing")}
                      onViewInsights={() => setView("insights")}
                    />
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    compact={settings.compactChat}
                    onShowSources={showSources}
                    onSavePrompt={savedPrompts.save}
                  />
                )}
                <ChatInput
                  onSend={sendMessage}
                  onStop={stopGenerating}
                  disabled={isLoading}
                  inputRef={inputRef}
                />
              </>
            )}
            {view === "pricing" && (
              <PricingPage
                currentPlan={plan}
                paidUntil={account?.paidUntil}
                signedIn={Boolean(session?.user)}
                onUpgrade={upgradeToPro}
                onSignIn={() => void signIn("google", { redirectTo: "/workspace" })}
                onStartChat={() => setView("chat")}
              />
            )}
            {view === "insights" && (
              <InsightsDashboard
                questionsThisMonth={questionsThisMonth}
                limit={limit}
                streakDays={usage.streakDays}
                conversationsCount={conversations.conversations.length}
                onAskSample={(q) => goChat(q)}
              />
            )}
            {view === "edgar" && (
              <SecExplorer onAskQuestion={(question) => goChat(question)} />
            )}
          </main>
        </div>
        {view === "chat" && (
          <SourcesPanel
            sources={activeSources}
            onClose={() => setActiveSources(null)}
          />
        )}
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onPatch={patch}
        resolvedTheme={resolved}
        onSetTheme={setMode}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={setView}
        onNewChat={handleNewChat}
        onSendPrompt={(p) => goChat(p)}
        prompts={suggestedPrompts}
      />
      <UpgradeToast
        show={limitToast}
        onDismiss={() => setLimitToast(false)}
        onUpgrade={() => {
          setLimitToast(false);
          setView("pricing");
        }}
      />
      {session?.user && <BatchUpload />}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Background } from "./components/Background";
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
import { useUsage } from "./hooks/useUsage";
import { downloadText, messagesToMarkdown } from "./lib/exportChat";
import type { AppView } from "./types/app";

const PLAN_LABELS = { free: "Free", pro: "Pro", team: "Team" } as const;

export default function App() {
  const { resolved, setMode, toggle } = useTheme();
  const { settings, patch, setPlan } = useSettings();
  const { usage, remaining, canAsk, recordQuestion, limit } = useUsage(
    settings.plan,
  );
  const conversations = useConversations();
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
    return true;
  }, [canAsk, recordQuestion]);

  const {
    messages,
    isLoading,
    sendMessage,
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
  });

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
    (id: string) => {
      const loaded = conversations.loadMessages(id);
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
            planLabel={PLAN_LABELS[settings.plan]}
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
                  disabled={isLoading}
                  inputRef={inputRef}
                />
              </>
            )}
            {view === "pricing" && (
              <PricingPage
                currentPlan={settings.plan}
                onSelectPlan={setPlan}
                onStartChat={() => setView("chat")}
              />
            )}
            {view === "insights" && (
              <InsightsDashboard
                questionsThisMonth={usage.questions}
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
    </div>
  );
}

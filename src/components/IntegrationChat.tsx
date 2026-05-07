"use client";

import { useState, useRef, useEffect } from "react";
import { CompanyProfile, IntegrationPreferences, ChatMessage } from "@/lib/types";
import { Send, Bot, User, Loader2, RotateCcw, Zap } from "lucide-react";

interface ProviderInfo {
  id: string;
  name: string;
  model: string;
  configured: boolean;
  free: boolean;
}

interface Props {
  company: CompanyProfile;
  preferences: IntegrationPreferences;
  onBack: () => void;
}

export default function IntegrationChat({
  company,
  preferences,
  onBack,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((data) => {
        setProviders(data.providers);
        const configured = data.providers.find((p: ProviderInfo) => p.configured);
        if (configured) setProvider(configured.id);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (
    userMessage: string,
    allMessages: ChatMessage[]
  ) => {
    setIsStreaming(true);

    const newMessages: ChatMessage[] = [
      ...allMessages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          preferences,
          messages: newMessages,
          provider,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              assistantContent += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: **${msg}**\n\nPlease check that your API key is configured in \`.env.local\` and try again.`,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const startIntegration = () => {
    setHasStarted(true);
    const initialMessage = `I need a complete integration plan for my company. Please start by recommending the best LLM(s) for our needs, then give me a detailed step-by-step integration plan. Include specific tools, APIs, and configurations we'll need.`;
    sendMessage(initialMessage, []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    sendMessage(msg, messages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setHasStarted(false);
  };

  const renderMarkdown = (text: string) => {
    return { __html: simpleMarkdown(text) };
  };

  const currentProvider = providers.find((p) => p.id === provider);

  if (!hasStarted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-16">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 pulse-glow">
          <Bot size={40} className="text-primary" />
        </div>
        <h2 className="mb-3 text-2xl font-bold">
          Your AI Integration Advisor
        </h2>
        <p className="mb-2 max-w-lg text-center text-muted">
          Based on your company profile and preferences, I&apos;ll create a
          personalized integration plan and guide you through every step.
        </p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {company.name}
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {company.industry}
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {company.size}
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {preferences.useCases.length} use cases
          </span>
        </div>

        {/* Provider selector */}
        <div className="mb-8 w-full max-w-md">
          <label className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-muted">
            <Zap size={14} className="text-primary" />
            Choose your AI provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => p.configured && setProvider(p.id)}
                className={`relative rounded-lg border p-3 text-center transition-all ${
                  provider === p.id
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : p.configured
                      ? "border-border bg-card hover:border-primary/40"
                      : "cursor-not-allowed border-border/50 bg-card/50 opacity-50"
                }`}
              >
                {p.free && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-success px-1.5 py-0.5 text-[10px] font-bold text-black">
                    FREE
                  </span>
                )}
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{p.model}</p>
                {!p.configured && (
                  <p className="mt-1 text-[10px] text-danger">No API key</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-border px-6 py-3 font-medium transition-all hover:bg-card"
          >
            Edit Preferences
          </button>
          <button
            onClick={startIntegration}
            disabled={!currentProvider?.configured}
            className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate My Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Bot size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Integration Advisor</h3>
            <p className="text-xs text-muted">
              {currentProvider?.name} ({currentProvider?.model}) · Guiding{" "}
              {company.name}
            </p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-card hover:text-foreground"
        >
          <RotateCcw size={12} />
          Start Over
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                msg.role === "user" ? "bg-accent/20" : "bg-primary/20"
              }`}
            >
              {msg.role === "user" ? (
                <User size={16} className="text-accent" />
              ) : (
                <Bot size={16} className="text-primary" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "border border-accent/20 bg-accent/10"
                  : "border border-border bg-card"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className="markdown-content text-sm"
                  dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                />
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              {isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant" && (
                  <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-primary" />
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex gap-3 border-t border-border pt-4"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask follow-up questions, request changes, or ask for more details..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isStreaming ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}

function simpleMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>'
  );
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br/>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>(<h[1-3]>)/g, "$1");
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");
  html = html.replace(/<p>(<pre>)/g, "$1");
  html = html.replace(/(<\/pre>)<\/p>/g, "$1");
  html = html.replace(/<p>(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");

  return html;
}

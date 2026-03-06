"use client";

import { useState, useRef, useEffect } from "react";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";

type Message = { role: "user" | "model"; content: string };

/** Always return a display-safe string; never pass objects to setError. */
function toErrorString(x: unknown): string {
  if (x == null) return "Something went wrong.";
  if (typeof x === "string") {
    if (x === "[object Object]") return "Something went wrong. Check HUGGINGFACE_TOKEN in backend .env and restart the backend.";
    return x;
  }
  if (x instanceof Error) return x.message;
  if (typeof x === "object") return JSON.stringify(x);
  return String(x);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenConfigured, setTokenConfigured] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const token = accessToken ?? useAuthStore.getState().accessToken;
    fetch(config.apiUrl("/api/ai/chat/status"), {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data: { configured?: boolean }) => setTokenConfigured(data.configured ?? false))
      .catch(() => setTokenConfigured(null));
  }, [accessToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const token = accessToken ?? useAuthStore.getState().accessToken;
      const res = await fetch(config.apiUrl("/api/ai/chat"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      let data: { reply?: string; error?: unknown; details?: unknown };
      try {
        data = (await res.json()) as { reply?: string; error?: unknown; details?: unknown };
      } catch {
        setError("Invalid response from server. Try again.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (!res.ok) {
        const raw = data.details ?? data.error ?? "Request failed";
        setError(toErrorString(raw));
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setMessages((prev) => [...prev, { role: "model", content: typeof data.reply === "string" ? data.reply : "" }]);
    } catch (err) {
      setError(toErrorString(err));
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Ask AI
        </h1>

        <div className="flex-1 min-h-0 flex flex-col rounded border border-border bg-card overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && tokenConfigured === false && (
              <div className="rounded border border-border bg-muted/30 p-4 text-sm text-foreground">
                <p className="font-medium mb-2">Ask AI is optional — set up a token to enable it</p>
                <p className="text-muted text-xs mb-3">
                  Get a free token at{" "}
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                    Hugging Face → Settings → Access Tokens
                  </a>
                  {" "}(fine-grained, &quot;Make calls to Inference Providers&quot;). Then set <code className="bg-card border border-border px-1 rounded">HUGGINGFACE_TOKEN</code> in your backend and restart.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted text-xs">
                  <li>Create a <strong>fine-grained</strong> token with permission &quot;Make calls to Inference Providers&quot;. Copy the token.</li>
                  <li>Optional: enable free tier at <a href="https://huggingface.co/settings/inference-providers" target="_blank" rel="noopener noreferrer" className="underline">Inference Providers</a>.</li>
                  <li><strong>Local:</strong> In the <code className="bg-card border border-border px-1 rounded">backend</code> folder, edit <code className="bg-card border border-border px-1 rounded">.env</code> and set <code className="bg-card border border-border px-1 rounded">HUGGINGFACE_TOKEN=your_token</code>. Then run <code className="bg-card border border-border px-1 rounded">npm run dev</code>.</li>
                  <li><strong>Production (Render):</strong> In Render dashboard → your backend service → <strong>Environment</strong>, add <code className="bg-card border border-border px-1 rounded">HUGGINGFACE_TOKEN</code> = your token. Save (Render will redeploy).</li>
                </ol>
              </div>
            )}
            {messages.length === 0 && tokenConfigured !== false && (
              <p className="text-sm text-muted text-center py-8">
                Ask anything — study help, concepts, or general questions. Replies appear here.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-background border border-border text-foreground"
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words">{m.content}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded px-3 py-2 bg-background border border-border text-muted text-sm">
                  …
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error != null && (() => {
            const errorText = toErrorString(error);
            const isTokenSetup =
              errorText.includes("not configured") ||
              errorText.includes("token invalid") ||
              errorText.includes("Invalid username or password") ||
              errorText.includes("HUGGINGFACE_TOKEN");
            const isModelLoading = errorText.includes("Model is loading");
            const tokenSetButRejected = isTokenSetup && tokenConfigured === true;
            return (
            <div className="px-4 py-3 text-sm border-t border-border bg-background">
              <p className="font-medium mb-2 text-foreground">
                {tokenSetButRejected
                  ? "Hugging Face rejected your token"
                  : isTokenSetup
                    ? "Ask AI isn't set up yet"
                    : isModelLoading
                      ? "Model is starting"
                      : "Something went wrong"}
              </p>
              <p className={`mb-2 ${isTokenSetup ? "text-sky-700 dark:text-sky-300" : "text-amber-700 dark:text-amber-300"}`}>
                {tokenSetButRejected
                  ? "Your token is set but Hugging Face is rejecting it (expired or revoked). Create a new token, then update HUGGINGFACE_TOKEN in backend .env (local) or Render Environment (production) and restart or redeploy."
                  : errorText}
              </p>
              {isTokenSetup && (
                <ol className="list-decimal list-inside space-y-1 text-muted text-xs mt-2">
                  <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-accent underline">Hugging Face → Settings → Access Tokens</a>.</li>
                  <li>Create a <strong>fine-grained</strong> token with permission <strong>“Make calls to Inference Providers”</strong>. Copy the token.</li>
                  <li>Optional: enable free tier at <a href="https://huggingface.co/settings/inference-providers" target="_blank" rel="noopener noreferrer" className="underline">Inference Providers</a>.</li>
                  <li><strong>Local:</strong> In <code className="bg-card border border-border px-1 rounded">backend/.env</code> set <code className="bg-card border border-border px-1 rounded">HUGGINGFACE_TOKEN=your_token</code>, then <code className="bg-card border border-border px-1 rounded">npm run dev</code>.</li>
                  <li><strong>Production (Render):</strong> Render dashboard → backend service → Environment → add <code className="bg-card border border-border px-1 rounded">HUGGINGFACE_TOKEN</code>. Save to redeploy.</li>
                </ol>
              )}
              {isModelLoading && (
                <p className="text-xs text-muted mt-2">Wait about a minute and click Send again.</p>
              )}
            </div>
            );
          })()}

          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded border border-border bg-background text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-medium border border-accent disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}

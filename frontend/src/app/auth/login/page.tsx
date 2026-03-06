"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { config } from "@/lib/config";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(trimmedEmail, password);
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      if (msg === "Failed to fetch") setError("Cannot reach the server. Set NEXT_PUBLIC_API_BASE_URL in Vercel to https://learning-management-system-rg7m.onrender.com and redeploy. Set CORS_ORIGIN on Render to this site's URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Log in
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600" role="alert">
              <p>{error}</p>
              {error.includes("Cannot reach the server") && (
                <p className="mt-2 text-xs text-muted break-all">
                  API URL: {config.apiBaseUrl}
                </p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-accent-foreground font-medium rounded border border-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-accent font-medium underline hover:no-underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

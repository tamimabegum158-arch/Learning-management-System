"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in name, email, and password.");
      return;
    }
    setLoading(true);
    try {
      await register(trimmedEmail, password, trimmedName);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Create account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
            />
            <p className="mt-1 text-xs text-muted">At least 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-accent-foreground font-medium rounded border border-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent font-medium underline hover:no-underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

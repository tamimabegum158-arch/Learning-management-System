"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg text-foreground hover:text-accent transition-colors">
            Learning Management System
          </Link>
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/compiler"
                  className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors font-medium"
                >
                  Compiler
                </Link>
                <Link
                  href="/chat"
                  className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors font-medium"
                >
                  Ask AI
                </Link>
                <Link
                  href="/profile"
                  className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                >
                  Profile
                </Link>
                <span className="rounded border border-border bg-background px-3 py-2 text-sm text-muted">
                  {user?.name ?? user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

"use client";

import { AuthGuard } from "@/components/Auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Profile
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {user?.name ?? "—"}
        </p>
        <p className="text-neutral-500 text-sm mt-1">
          {user?.email ?? "—"}
        </p>
      </div>
    </AuthGuard>
  );
}

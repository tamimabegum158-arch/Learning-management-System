"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { SubjectSidebar } from "@/components/Sidebar/SubjectSidebar";
import { useSidebarStore } from "@/store/sidebarStore";

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const pathname = usePathname();
  const { tree, loading, error, fetchTree } = useSidebarStore();

  useEffect(() => {
    if (!subjectId) return;
    fetchTree(subjectId);
  }, [subjectId, fetchTree]);

  const isVideoPage = pathname?.includes("/video/");

  return (
    <AuthGuard>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <SubjectSidebarWrapper
          subjectId={subjectId}
          tree={tree}
          loading={loading}
          error={error}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {!isVideoPage && (
            <div className="border-b border-border px-4 py-2">
              <Link
                href={`/subjects/${subjectId}`}
                className="text-sm text-muted hover:text-accent"
              >
                ← Back to subject
              </Link>
            </div>
          )}
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}

function SubjectSidebarWrapper({
  subjectId,
  tree,
  loading,
  error,
}: {
  subjectId: string;
  tree: ReturnType<typeof useSidebarStore.getState>["tree"];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <aside className="w-64 shrink-0 border-r border-border p-4">
        <p className="text-sm text-muted">Loading...</p>
      </aside>
    );
  }
  if (error || !tree) {
    return (
      <aside className="w-64 shrink-0 border-r border-border p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Failed to load"}</p>
      </aside>
    );
  }
  return <SubjectSidebar tree={tree} subjectId={subjectId} />;
}

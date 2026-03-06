"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { config } from "@/lib/config";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/common/Button";

interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  enrolled?: boolean;
  thumbnailYoutubeId?: string | null;
}

interface SubjectsResponse {
  items: Subject[];
  total: number;
  page: number;
  pageSize: number;
}

interface EnrollmentsResponse {
  total_enrolled: number;
  completed_count: number;
  not_completed_count: number;
  enrollments: unknown[];
}

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [data, setData] = useState<SubjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [enrollmentsStats, setEnrollmentsStats] = useState<EnrollmentsResponse | null>(null);
  const [togglingEnrollId, setTogglingEnrollId] = useState<number | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setEnrollmentsStats({ total_enrolled: 0, completed_count: 0, not_completed_count: 0, enrollments: [] });
      return;
    }
    try {
      const stats = await apiGet<EnrollmentsResponse>("/api/me/enrollments");
      setEnrollmentsStats(stats);
    } catch {
      setEnrollmentsStats((prev) => prev ?? { total_enrolled: 0, completed_count: 0, not_completed_count: 0, enrollments: [] });
    }
  }, [isAuthenticated]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (isAuthenticated) {
      apiGet<SubjectsResponse>("/api/subjects?pageSize=50")
        .then(setData)
        .catch((err) => setError(err instanceof Error ? err.message : typeof err === "object" && err !== null ? JSON.stringify(err) : String(err)))
        .finally(() => setLoading(false));
    } else {
      fetch(config.apiUrl("/api/subjects?pageSize=50"), { credentials: "include" })
        .then(async (res) => {
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
          }
          return json as SubjectsResponse;
        })
        .then(setData)
        .catch((err) => {
          const msg = err instanceof Error ? err.message : (typeof err === "object" && err !== null ? JSON.stringify(err) : String(err));
          const msgStr = typeof msg === "string" ? msg : String(msg);
          const isNetworkError = msgStr === "Failed to fetch" || msgStr.includes("NetworkError") || msgStr.includes("Load failed");
          setError(
            isNetworkError
              ? "Cannot reach the API. For deployed apps: set NEXT_PUBLIC_API_BASE_URL (Vercel) to your Render backend URL, and set CORS_ORIGIN (Render) to your Vercel URL."
              : msgStr
          );
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    const onFocus = () => { fetchSubjects(); fetchEnrollments(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchSubjects, fetchEnrollments]);

  const items = data?.items ?? [];

  const handleEnroll = async (e: React.MouseEvent, subjectId: number, enrolled: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingEnrollId !== null) return;
    setTogglingEnrollId(subjectId);
    try {
      if (enrolled) {
        await apiDelete(`/api/subjects/${subjectId}/enroll`);
      } else {
        await apiPost(`/api/subjects/${subjectId}/enroll`);
      }
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.map((s) => (s.id === subjectId ? { ...s, enrolled: !enrolled } : s)) }
          : null
      );
      setEnrollmentsStats((prev) => {
        if (!prev) return prev;
        if (enrolled) {
          return {
            ...prev,
            total_enrolled: Math.max(0, prev.total_enrolled - 1),
            not_completed_count: Math.max(0, prev.not_completed_count - 1),
          };
        }
        return {
          ...prev,
          total_enrolled: prev.total_enrolled + 1,
          not_completed_count: prev.not_completed_count + 1,
        };
      });
      await fetchEnrollments();
    } catch {
      setError("Failed to update enrollment.");
    } finally {
      setTogglingEnrollId(null);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      setAddError("Title is required.");
      return;
    }
    setAddError(null);
    setAddLoading(true);
    try {
      await apiPost("/api/subjects", { title, description: newDescription.trim() || undefined });
      setNewTitle("");
      setNewDescription("");
      setShowAddForm(false);
      await fetchSubjects();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add course.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, subjectId: number, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (deletingId !== null) return;
    if (!confirm(`Delete "${title}"? This will remove the course and all its sections and videos.`)) return;
    setDeletingId(subjectId);
    try {
      await apiDelete(`/api/subjects/${subjectId}`);
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((s) => s.id !== subjectId) } : null
      );
    } catch {
      setError("Failed to delete course.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted">Loading courses...</p>
      </div>
    );
  }
  if (error) {
    const errorStr = typeof error === "string" ? error : (error && typeof error === "object" ? JSON.stringify(error) : String(error));
    const isCorsOrApi = errorStr.includes("Cannot reach the API");
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600 font-medium">{errorStr}</p>
        {isCorsOrApi && (
          <>
            <p className="mt-3 text-sm text-muted">
              API URL: <code className="bg-card border border-border px-1.5 py-0.5 rounded break-all">{config.apiBaseUrl}</code>
            </p>
            {(() => {
              try {
                const u = new URL(config.apiBaseUrl);
                const isLocal = u.hostname === "localhost" || u.hostname === "127.0.0.1";
                return isLocal;
              } catch {
                return config.apiBaseUrl.startsWith("http://localhost") || config.apiBaseUrl.startsWith("http://127.0.0.1");
              }
            })() ? (
              <div className="mt-4 p-4 bg-card border border-border rounded text-sm">
                <p className="font-semibold text-foreground">Running locally? Start the backend first.</p>
                <p className="mt-2 text-muted">
                  API at <code className="bg-background px-1 rounded border border-border">localhost:4000</code>. If the backend is not running, the request fails.
                </p>
                <p className="mt-2 text-foreground font-medium">In a new terminal:</p>
                <ol className="mt-1 list-decimal list-inside text-muted space-y-1">
                  <li>Go to the project folder, then the <code className="bg-background px-1 rounded border border-border">backend</code> folder.</li>
                  <li>Run: <code className="font-mono bg-background px-2 py-0.5 rounded border border-border">npm run dev</code></li>
                  <li>Wait until the server is listening on port 4000.</li>
                </ol>
                <p className="mt-2 text-muted text-xs">If the backend is already running, check the terminal for errors.</p>
                <Button type="button" onClick={() => { setError(null); setLoading(true); fetchSubjects(); }} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-foreground font-medium">Set NEXT_PUBLIC_API_BASE_URL in Vercel and redeploy (env is set at build time).</p>
                <div className="mt-4 p-4 bg-card border border-border rounded text-sm space-y-2">
                  <p className="font-semibold text-foreground">Do these in order:</p>
                  <p><strong>1. Vercel</strong> — Settings → Environment Variables. Add <code className="bg-background px-1 rounded border border-border">NEXT_PUBLIC_API_BASE_URL</code> = your Render backend URL (no trailing slash).</p>
                  <p><strong>2. Vercel</strong> — Deployments → Redeploy.</p>
                  <p><strong>3. Render</strong> — Environment. Set <code className="bg-background px-1 rounded border border-border">CORS_ORIGIN</code> and <code className="bg-background px-1 rounded border border-border">COOKIE_DOMAIN</code> to your frontend URL.</p>
                  <p className="text-muted">If your app uses a different URL, set CORS_ORIGIN and COOKIE_DOMAIN to match.</p>
                </div>
                <p className="mt-3 text-xs text-muted">Render free tier may take 30–60s to wake — click Retry after saving.</p>
                <Button type="button" onClick={() => { setError(null); setLoading(true); fetchSubjects(); }} className="mt-4">
                  Retry
                </Button>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Courses
        </h1>
        {isAuthenticated && !showAddForm && (
          <Button type="button" onClick={() => { setShowAddForm(true); setAddError(null); }}>
            Add course
          </Button>
        )}
      </div>

      {isAuthenticated && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-foreground mb-3">My learning</h2>
          <div className="flex flex-wrap gap-3">
            <div className="rounded border border-border bg-card px-4 py-3 min-w-[140px]">
              <p className="text-2xl font-semibold text-accent">{enrollmentsStats !== null ? enrollmentsStats.total_enrolled : 0}</p>
              <p className="text-sm text-muted">Enrolled</p>
            </div>
            <div className="rounded border border-border bg-card px-4 py-3 min-w-[140px]">
              <p className="text-2xl font-semibold text-foreground">{enrollmentsStats !== null ? enrollmentsStats.not_completed_count : 0}</p>
              <p className="text-sm text-muted">Pending</p>
            </div>
            <div className="rounded border border-border bg-card px-4 py-3 min-w-[140px]">
              <p className="text-2xl font-semibold text-foreground">{enrollmentsStats !== null ? enrollmentsStats.completed_count : 0}</p>
              <p className="text-sm text-muted">Completed</p>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && showAddForm && (
        <form
          onSubmit={handleAddSubject}
          className="mb-6 p-4 border border-border rounded bg-card"
        >
          <h2 className="text-sm font-medium text-foreground mb-3">
            Add a new course
          </h2>
          {addError && (
            <p className="text-sm text-red-600 mb-2" role="alert">
              {addError}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <label htmlFor="new-subject-title" className="block text-sm text-muted mb-1">
                Course title
              </label>
              <input
                id="new-subject-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Introduction to Python"
                required
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
              />
            </div>
            <div>
              <label htmlFor="new-subject-desc" className="block text-sm text-muted mb-1">
                Description (optional)
              </label>
              <input
                id="new-subject-desc"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description"
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addLoading}>
                {addLoading ? "Adding…" : "Add"}
              </Button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDescription(""); setAddError(null); }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!items.length ? (
        <p className="text-muted">No courses yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((s) => {
            const thumbUrl =
              s.thumbnailYoutubeId && s.thumbnailYoutubeId.trim()
                ? `https://img.youtube.com/vi/${s.thumbnailYoutubeId.trim()}/mqdefault.jpg`
                : null;
            const hue = (s.id * 137) % 360;
            const thumbBg = `linear-gradient(135deg, hsl(${hue}, 45%, 35%), hsl(${hue}, 55%, 25%))`;
            const initial = (s.title.trim() || "C").charAt(0).toUpperCase();
            return (
              <li key={s.id} className="flex flex-col">
                <Link
                  href={`/subjects/${s.id}`}
                  className="group flex flex-col rounded border border-border bg-card overflow-hidden hover:border-accent transition-colors"
                >
                  <div className="aspect-video w-full shrink-0 overflow-hidden bg-card">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center text-white text-3xl font-semibold"
                        style={{ background: thumbBg }}
                      >
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col min-w-0">
                    <h2 className="font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {s.title}
                    </h2>
                    {s.description && (
                      <p className="mt-1 text-sm text-muted line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    {isAuthenticated && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap" onClick={(e) => e.preventDefault()}>
                        <Button
                          variant={s.enrolled ? "secondary" : "primary"}
                          className="text-sm"
                          disabled={togglingEnrollId === s.id}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEnroll(e, s.id, !!s.enrolled); }}
                        >
                          {togglingEnrollId === s.id ? "…" : s.enrolled ? "Remove" : "Enroll"}
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSubject(e, s.id, s.title); }}
                          disabled={deletingId === s.id}
                          className="text-sm text-muted hover:text-red-600"
                          title="Delete course"
                        >
                          {deletingId === s.id ? "…" : "Delete"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

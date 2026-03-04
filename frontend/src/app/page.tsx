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
    if (!isAuthenticated) return;
    apiGet<EnrollmentsResponse>("/api/me/enrollments")
      .then(setEnrollmentsStats)
      .catch(() => setEnrollmentsStats({ total_enrolled: 0, completed_count: 0, not_completed_count: 0, enrollments: [] }));
  }, [isAuthenticated]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (isAuthenticated) {
      apiGet<SubjectsResponse>("/api/subjects?pageSize=50")
        .then(setData)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load subjects"))
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
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load subjects"))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

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
      setAddError(err instanceof Error ? err.message : "Failed to add subject.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, subjectId: number, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (deletingId !== null) return;
    if (!confirm(`Delete "${title}"? This will remove the subject and all its sections and videos.`)) return;
    setDeletingId(subjectId);
    try {
      await apiDelete(`/api/subjects/${subjectId}`);
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((s) => s.id !== subjectId) } : null
      );
    } catch {
      setError("Failed to delete subject.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <p className="text-neutral-500">Loading subjects...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Subjects
        </h1>
        {isAuthenticated && !showAddForm && (
          <Button type="button" onClick={() => { setShowAddForm(true); setAddError(null); }}>
            Add subject
          </Button>
        )}
      </div>

      {isAuthenticated && enrollmentsStats !== null && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">My learning</h2>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm px-4 py-3 min-w-[140px]">
              <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{enrollmentsStats.total_enrolled}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Enrolled</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm px-4 py-3 min-w-[140px]">
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{enrollmentsStats.not_completed_count}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm px-4 py-3 min-w-[140px]">
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{enrollmentsStats.completed_count}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && showAddForm && (
        <form
          onSubmit={handleAddSubject}
          className="mb-6 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
        >
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Add a new subject
          </h2>
          {addError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2" role="alert">
              {addError}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <label htmlFor="new-subject-title" className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Subject title
              </label>
              <input
                id="new-subject-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Introduction to Python"
                required
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
              />
            </div>
            <div>
              <label htmlFor="new-subject-desc" className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Description (optional)
              </label>
              <input
                id="new-subject-desc"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addLoading}>
                {addLoading ? "Adding…" : "Add"}
              </Button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDescription(""); setAddError(null); }}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!items.length ? (
        <p className="text-neutral-500">No subjects yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                href={`/subjects/${s.id}`}
                className="block p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-slate-800 dark:text-slate-100">
                      {s.title}
                    </h2>
                    {s.description && (
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                  </div>
                  {isAuthenticated && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={s.enrolled ? "secondary" : "primary"}
                        className="text-sm"
                        disabled={togglingEnrollId === s.id}
                        onClick={(e) => handleEnroll(e, s.id, !!s.enrolled)}
                      >
                        {togglingEnrollId === s.id ? "…" : s.enrolled ? "Remove" : "Enroll"}
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={(e) => handleDeleteSubject(e, s.id, s.title)}
                        disabled={deletingId === s.id}
                        className="text-sm text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
                        title="Delete subject"
                      >
                        {deletingId === s.id ? "…" : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

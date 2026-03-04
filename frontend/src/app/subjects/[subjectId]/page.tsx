"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { apiPost } from "@/lib/apiClient";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/common/Button";

export default function SubjectOverviewPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const { tree, loading: treeLoading, error: treeError, fetchTree } = useSidebarStore();
  const [sectionTitle, setSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [videoBySection, setVideoBySection] = useState<Record<number, { title: string; youtubeUrl: string }>>({});
  const [addingVideoFor, setAddingVideoFor] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const totalVideos = tree?.sections.reduce((n, s) => n + s.videos.length, 0) ?? 0;
  const firstVideoId = tree?.sections.flatMap((s) => s.videos).find((v) => !v.locked)?.id ?? tree?.sections.flatMap((s) => s.videos)[0]?.id;

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = sectionTitle.trim();
    if (!title || addingSection) return;
    setSectionError(null);
    setAddingSection(true);
    try {
      await apiPost(`/api/subjects/${subjectId}/sections`, { title });
      setSectionTitle("");
      await fetchTree(subjectId);
    } catch (err) {
      setSectionError(err instanceof Error ? err.message : "Failed to add section");
    } finally {
      setAddingSection(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent, sectionId: number) => {
    e.preventDefault();
    const state = videoBySection[sectionId];
    const title = state?.title?.trim();
    const youtubeUrl = state?.youtubeUrl?.trim();
    if (!title || addingVideoFor !== null) return;
    setVideoError(null);
    setAddingVideoFor(sectionId);
    try {
      await apiPost("/api/videos", { sectionId, title, youtubeUrl: youtubeUrl || undefined });
      setVideoBySection((prev) => ({ ...prev, [sectionId]: { title: "", youtubeUrl: "" } }));
      await fetchTree(subjectId);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setAddingVideoFor(null);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = aiQuestion.trim();
    if (!q || aiLoading) return;
    setAiError(null);
    setAiAnswer(null);
    setAiLoading(true);
    try {
      const token = accessToken ?? useAuthStore.getState().accessToken;
      const res = await fetch(config.apiUrl("/api/ai/ask"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: q,
          subject_title: tree?.title ?? "",
        }),
      });
      const data = (await res.json()) as { answer?: string; error?: string; details?: string };
      if (!res.ok) {
        setAiError(data.details || data.error || "AI request failed");
        return;
      }
      setAiAnswer(data.answer ?? "");
      setAiQuestion("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to get AI response");
    } finally {
      setAiLoading(false);
    }
  };

  if (treeLoading || !tree) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }
  if (treeError) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">{treeError}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {tree.title}
      </h1>
      <p className="text-neutral-500 text-sm mb-6">
        {tree.sections.length} section{tree.sections.length !== 1 ? "s" : ""}, {totalVideos} video{totalVideos !== 1 ? "s" : ""}
      </p>

      {firstVideoId && (
        <div className="mb-6">
          <Link
            href={`/subjects/${subjectId}/video/${firstVideoId}`}
            className="inline-block px-4 py-2 bg-slate-600 hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400 text-white dark:text-slate-900 font-medium rounded transition-colors"
          >
            Start learning
          </Link>
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
          Sections & videos
        </h2>

        <div className="mb-6 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Add section</h3>
          <form onSubmit={handleAddSection} className="flex flex-wrap items-end gap-2">
            <label className="sr-only" htmlFor="section-title">Section title</label>
            <input
              id="section-title"
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section title"
              className="flex-1 min-w-[160px] px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
            />
            <Button type="submit" disabled={addingSection || !sectionTitle.trim()}>
              {addingSection ? "…" : "Add section"}
            </Button>
          </form>
          {sectionError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{sectionError}</p>}
        </div>
        {videoError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{videoError}</p>}

        {tree.sections.length === 0 ? (
          <p className="text-neutral-500">No sections yet. Add a section above, then add videos (e.g. YouTube links) to it.</p>
        ) : (
          <ul className="space-y-6">
            {tree.sections.map((section) => (
              <li
                key={section.id}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  {section.title}
                </h3>
                {section.videos.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400">
                    {section.videos.map((v) => (
                      <li key={v.id}>
                        <Link
                          href={`/subjects/${subjectId}/video/${v.id}`}
                          className="hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                          {v.title}
                          {v.is_completed && " ✓"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">No videos</p>
                )}
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <h4 className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Add video (YouTube or other link)</h4>
                  <form
                    onSubmit={(e) => handleAddVideo(e, section.id)}
                    className="flex flex-wrap gap-2"
                  >
                    <input
                      type="text"
                      value={videoBySection[section.id]?.title ?? ""}
                      onChange={(e) =>
                        setVideoBySection((prev) => ({
                          ...prev,
                          [section.id]: { ...(prev[section.id] ?? { title: "", youtubeUrl: "" }), title: e.target.value },
                        }))
                      }
                      placeholder="Video title"
                      className="flex-1 min-w-[140px] px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400"
                    />
                    <input
                      type="url"
                      value={videoBySection[section.id]?.youtubeUrl ?? ""}
                      onChange={(e) =>
                        setVideoBySection((prev) => ({
                          ...prev,
                          [section.id]: { ...(prev[section.id] ?? { title: "", youtubeUrl: "" }), youtubeUrl: e.target.value },
                        }))
                      }
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                      className="flex-1 min-w-[200px] px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={addingVideoFor === section.id || !(videoBySection[section.id]?.title?.trim())}
                      className="text-sm"
                    >
                      {addingVideoFor === section.id ? "…" : "Add video"}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Free AI help</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          Ask a question about this subject. Uses free Gemini API — get a key at{" "}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
            Google AI Studio
          </a>{" "}
          and set <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">GEMINI_API_KEY</code> in backend <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">.env</code>.
        </p>
        <form onSubmit={handleAskAi} className="flex flex-col gap-2">
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask something about this subject..."
            rows={2}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm"
            disabled={aiLoading}
          />
          <Button type="submit" disabled={aiLoading || !aiQuestion.trim()}>
            {aiLoading ? "…" : "Ask"}
          </Button>
        </form>
        {aiError && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{aiError}</p>}
        {aiAnswer && <div className="mt-3 p-3 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{aiAnswer}</div>}
      </section>
    </div>
  );
}

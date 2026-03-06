"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { apiPost } from "@/lib/apiClient";
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

  if (treeLoading || !tree) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted">Loading...</p>
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
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        {tree.title}
      </h1>
      <p className="text-muted text-sm mb-6">
        {tree.sections.length} section{tree.sections.length !== 1 ? "s" : ""}, {totalVideos} video{totalVideos !== 1 ? "s" : ""}
      </p>

      {firstVideoId && (
        <div className="mb-6">
          <Link
            href={`/subjects/${subjectId}/video/${firstVideoId}`}
            className="inline-block px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground font-medium rounded transition-colors"
          >
            Start learning
          </Link>
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">
          Sections & videos
        </h2>

        <div className="mb-6 p-4 border border-border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-foreground mb-2">Add section</h3>
          <form onSubmit={handleAddSection} className="flex flex-wrap items-end gap-2">
            <label className="sr-only" htmlFor="section-title">Section title</label>
            <input
              id="section-title"
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section title"
              className="flex-1 min-w-[160px] px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted"
            />
            <Button type="submit" disabled={addingSection || !sectionTitle.trim()}>
              {addingSection ? "…" : "Add section"}
            </Button>
          </form>
          {sectionError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{sectionError}</p>}
        </div>
        {videoError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{videoError}</p>}

        {tree.sections.length === 0 ? (
          <p className="text-muted">No sections yet. Add a section above, then add videos (e.g. YouTube links) to it.</p>
        ) : (
          <ul className="space-y-6">
            {tree.sections.map((section) => (
              <li
                key={section.id}
                className="p-4 border border-border rounded-lg"
              >
                <h3 className="font-medium text-foreground mb-2">
                  {section.title}
                </h3>
                {section.videos.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-muted">
                    {section.videos.map((v) => (
                      <li key={v.id}>
                        <Link
                          href={`/subjects/${subjectId}/video/${v.id}`}
                          className="hover:text-accent"
                        >
                          {v.title}
                          {v.is_completed && " ✓"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No videos</p>
                )}
                <div className="mt-3 pt-3 border-t border-border">
                  <h4 className="text-xs font-medium text-muted mb-2">Add video (YouTube or other link)</h4>
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
                      className="flex-1 min-w-[140px] px-3 py-2 border border-border rounded bg-background text-foreground text-sm placeholder:text-muted"
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
                      className="flex-1 min-w-[200px] px-3 py-2 border border-border rounded bg-background text-foreground text-sm placeholder:text-muted"
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
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/apiClient";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";
import { VideoPlayer } from "@/components/Video/VideoPlayer";
import { VideoMeta } from "@/components/Video/VideoMeta";
import { VideoProgressBar } from "@/components/Video/VideoProgressBar";
import { sendProgress } from "@/lib/progress";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVideoStore } from "@/store/videoStore";
import { Button } from "@/components/common/Button";

interface VideoResponse {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  duration_seconds: number | null;
  section_id: number;
  section_title: string;
  subject_id: number;
  subject_title: string;
  previous_video_id: number | null;
  next_video_id: number | null;
  locked: boolean;
  unlock_reason: string | null;
}

interface ProgressResponse {
  last_position_seconds: number;
  is_completed: boolean;
}

/** Extract 11-char YouTube video ID from any link or plain ID so video always plays in LMS embed. */
function extractYoutubeId(urlOrId: string | null): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const s = urlOrId.trim();
  const m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || s.match(/^([a-zA-Z0-9_-]{11})$/);
  return m ? m[1]! : null;
}

export default function VideoPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const videoIdParam = params.videoId as string;
  const videoId = parseInt(videoIdParam, 10);
  const router = useRouter();
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markVideoCompleted = useSidebarStore((s) => s.markVideoCompleted);
  const setVideoState = useVideoStore((s) => s.setVideo);
  const resetVideoState = useVideoStore((s) => s.reset);
  const tree = useSidebarStore((s) => s.tree);
  const totalVideos = tree ? tree.sections.reduce((n, sec) => n + sec.videos.length, 0) : 0;
  const completedVideos = tree
    ? tree.sections.reduce((n, sec) => n + sec.videos.filter((v) => v.is_completed).length, 0)
    : 0;
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (Number.isNaN(videoId)) {
      setError("Invalid video");
      setLoading(false);
      return;
    }
    Promise.all([
      apiGet<VideoResponse>(`/api/videos/${videoId}`),
      apiGet<ProgressResponse>(`/api/progress/videos/${videoId}`),
    ])
      .then(([v, p]) => {
        setVideo(v);
        setProgress(p);
        setVideoState({
          currentVideoId: v.id,
          subjectId: v.subject_id,
          nextVideoId: v.next_video_id ?? null,
          prevVideoId: v.previous_video_id ?? null,
          duration: v.duration_seconds ?? 0,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
    return () => resetVideoState();
  }, [videoId, setVideoState, resetVideoState]);

  const handleProgress = useCallback(
    (currentTime: number) => {
      sendProgress(videoId, currentTime);
    },
    [videoId]
  );

  const handleCompleted = useCallback(() => {
    sendProgress(videoId, progress?.last_position_seconds ?? 0, true);
    markVideoCompleted(videoId);
    if (video?.next_video_id) {
      router.push(`/subjects/${subjectId}/video/${video.next_video_id}`);
    }
  }, [videoId, video?.next_video_id, subjectId, router, markVideoCompleted, progress?.last_position_seconds]);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = aiQuestion.trim();
    if (!q || aiLoading || !video) return;
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
          subject_title: video.subject_title,
          video_title: video.title,
          video_description: video.description ?? "",
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }
  if (error || !video) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">{error ?? "Video not found"}</p>
        <Link href={`/subjects/${subjectId}`} className="mt-2 inline-block text-sm text-neutral-600 dark:text-neutral-400 underline">
          Back to subject
        </Link>
      </div>
    );
  }
  if (video.locked) {
    return (
      <div className="p-6 max-w-2xl">
        <p className="text-neutral-600 dark:text-neutral-400">
          {video.unlock_reason ?? "Complete previous video to unlock."}
        </p>
        <Link href={`/subjects/${subjectId}`} className="mt-2 inline-block text-sm text-neutral-900 dark:text-neutral-100 underline">
          Back to subject
        </Link>
      </div>
    );
  }

  const ytId = video.youtube_video_id ?? extractYoutubeId(video.youtube_url);
  const startSeconds = progress?.last_position_seconds ?? 0;

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 items-center text-sm text-neutral-500 mb-2">
        {video.previous_video_id ? (
          <Link
            href={`/subjects/${subjectId}/video/${video.previous_video_id}`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← Previous
          </Link>
        ) : (
          <span className="text-neutral-400">← Previous</span>
        )}
        {video.next_video_id ? (
          <Link
            href={`/subjects/${subjectId}/video/${video.next_video_id}`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Next →
          </Link>
        ) : (
          <span className="text-neutral-400">Next →</span>
        )}
      </div>
      {ytId ? (
        <>
          <VideoPlayer
            videoId={ytId}
            startPositionSeconds={startSeconds}
            onProgress={handleProgress}
            onCompleted={handleCompleted}
          />
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            >
              Video not loading? Open on YouTube
            </a>
            <button
              type="button"
              onClick={() => {
                sendProgress(videoId, progress?.last_position_seconds ?? 0, true);
                markVideoCompleted(videoId);
                if (video?.next_video_id) router.push(`/subjects/${subjectId}/video/${video.next_video_id}`);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium"
            >
              Mark as complete and continue
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            If you see &quot;An error occurred&quot; above, that video may have embedding disabled on YouTube. Use &quot;Open on YouTube&quot; to watch it there, then &quot;Mark as complete&quot; to continue in the LMS.
          </p>
        </>
      ) : (
        <div className="aspect-video max-w-4xl flex flex-col items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 p-4">
          <p>Video unavailable (no YouTube link).</p>
          <p className="text-sm">Add a YouTube video ID for this lesson in the subject settings.</p>
        </div>
      )}
      <VideoMeta title={video.title} description={video.description} />

      <section className="mt-6 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Free AI help</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          Ask a question about this lesson. Uses free Gemini API — get a key at{" "}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
            Google AI Studio
          </a>{" "}
          and set <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">GEMINI_API_KEY</code> in backend <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">.env</code>.
        </p>
        <form onSubmit={handleAskAi} className="flex flex-col gap-2">
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask something about this lesson..."
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

      {totalVideos > 0 && (
        <VideoProgressBar
          completedVideos={completedVideos}
          totalVideos={totalVideos}
          className="mt-4"
        />
      )}
      {video.next_video_id && (
        <p className="mt-4 text-sm text-neutral-500">
          Completing this video will auto-advance to the next.
        </p>
      )}
    </div>
  );
}

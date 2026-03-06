"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/apiClient";
import { VideoPlayer } from "@/components/Video/VideoPlayer";
import { VideoMeta } from "@/components/Video/VideoMeta";
import { VideoProgressBar } from "@/components/Video/VideoProgressBar";
import { sendProgress } from "@/lib/progress";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVideoStore } from "@/store/videoStore";

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }
  if (error || !video) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">{error ?? "Video not found"}</p>
        <Link href={`/subjects/${subjectId}`} className="mt-2 inline-block text-sm text-muted underline">
          Back to subject
        </Link>
      </div>
    );
  }
  if (video.locked) {
    return (
      <div className="p-6 max-w-2xl">
        <p className="text-muted">
          {video.unlock_reason ?? "Complete previous video to unlock."}
        </p>
        <Link href={`/subjects/${subjectId}`} className="mt-2 inline-block text-sm text-foreground underline">
          Back to subject
        </Link>
      </div>
    );
  }

  const ytId = video.youtube_video_id ?? extractYoutubeId(video.youtube_url);
  const startSeconds = progress?.last_position_seconds ?? 0;

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 items-center text-sm text-muted mb-2">
        {video.previous_video_id ? (
          <Link
            href={`/subjects/${subjectId}/video/${video.previous_video_id}`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← Previous
          </Link>
        ) : (
          <span className="text-muted">← Previous</span>
        )}
        {video.next_video_id ? (
          <Link
            href={`/subjects/${subjectId}/video/${video.next_video_id}`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Next →
          </Link>
        ) : (
          <span className="text-muted">Next →</span>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-medium"
            >
              Mark as complete and continue
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            If you see &quot;An error occurred&quot; above, that video may have embedding disabled on YouTube. Use &quot;Open on YouTube&quot; to watch it there, then &quot;Mark as complete&quot; to continue in the LMS.
          </p>
        </>
      ) : (
        <div className="aspect-video max-w-4xl flex flex-col items-center justify-center gap-2 bg-card border border-border rounded text-muted p-4">
          <p>Video unavailable (no YouTube link).</p>
          <p className="text-sm">Add a YouTube video ID for this lesson in the subject settings.</p>
        </div>
      )}
      <VideoMeta title={video.title} description={video.description} />

      {totalVideos > 0 && (
        <VideoProgressBar
          completedVideos={completedVideos}
          totalVideos={totalVideos}
          className="mt-4"
        />
      )}
      {video.next_video_id && (
        <p className="mt-4 text-sm text-muted">
          Completing this video will auto-advance to the next.
        </p>
      )}
    </div>
  );
}

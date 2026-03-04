"use client";

import { useMemo } from "react";

interface VideoPlayerProps {
  videoId: string;
  startPositionSeconds: number;
  onProgress: (currentTime: number) => void;
  onCompleted: () => void;
}

/**
 * Embeds YouTube video so it plays inside the LMS portal (not on YouTube).
 * Uses the standard embed URL so the video loads and plays reliably in-page.
 * onProgress and onCompleted are accepted for API compatibility; callers can use
 * the "Mark as complete" button until YouTube IFrame API progress is added.
 */
export function VideoPlayer({
  videoId,
  startPositionSeconds,
  onProgress: _onProgress,
  onCompleted: _onCompleted,
}: VideoPlayerProps) {
  void _onProgress;
  void _onCompleted;
  const embedUrl = useMemo(() => {
    const raw = String(videoId || "").trim();
    if (!raw) return "";
    const id = raw.length === 11 && /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : raw.replace(/^.*(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11}).*$/, "$1");
    if (id.length !== 11 || !/^[a-zA-Z0-9_-]+$/.test(id)) return "";
    const startSec = Math.max(0, Math.floor(startPositionSeconds));
    const params = new URLSearchParams();
    if (startSec > 0) params.set("start", String(startSec));
    params.set("rel", "0");
    params.set("modestbranding", "1");
    const qs = params.toString();
    return `https://www.youtube-nocookie.com/embed/${id}${qs ? `?${qs}` : ""}`;
  }, [videoId, startPositionSeconds]);

  if (!embedUrl) return null;

  return (
    <div className="w-full max-w-4xl">
      <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
        Video plays in LMS portal (below) — not on YouTube
      </p>
      <div className="aspect-video bg-black rounded overflow-hidden">
        <iframe
          key={embedUrl}
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full min-h-[280px]"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        If the video does not load above, the owner may have disabled embedding. Use &quot;Open on YouTube&quot; below only as fallback.
      </p>
    </div>
  );
}

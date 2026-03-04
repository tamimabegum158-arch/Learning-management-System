"use client";

/**
 * Optional: shows subject-level progress (e.g. X of Y videos completed).
 * Can be used on video page or subject overview.
 */
interface VideoProgressBarProps {
  completedVideos: number;
  totalVideos: number;
  className?: string;
}

export function VideoProgressBar({
  completedVideos,
  totalVideos,
  className = "",
}: VideoProgressBarProps) {
  const total = Math.max(0, totalVideos);
  const completed = Math.min(completedVideos, total);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className={className}>
      <div className="flex justify-between text-sm text-neutral-500 mb-1">
        <span>Progress</span>
        <span>
          {completed} / {total} videos ({percent}%)
        </span>
      </div>
      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
        <div
          className="h-full bg-neutral-700 dark:bg-neutral-300 rounded transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

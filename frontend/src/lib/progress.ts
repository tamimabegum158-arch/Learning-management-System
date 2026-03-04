import { apiPost } from "./apiClient";

const DEBOUNCE_MS = 5000;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function sendProgress(
  videoId: number,
  lastPositionSeconds: number,
  isCompleted?: boolean
): void {
  const key = `progress-${videoId}`;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);

  const flush = () => {
    timers.delete(key);
    apiPost(`/api/progress/videos/${videoId}`, {
      last_position_seconds: Math.round(lastPositionSeconds),
      ...(isCompleted !== undefined && { is_completed: isCompleted }),
    }).catch(() => {});
  };

  if (isCompleted) {
    flush();
    return;
  }

  timers.set(
    key,
    setTimeout(flush, DEBOUNCE_MS)
  );
}

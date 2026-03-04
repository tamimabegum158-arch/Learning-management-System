/**
 * Strict ordering: sections by order_index, videos by order_index within section.
 * Flattened sequence defines global prev/next. A video is locked unless
 * prerequisite (previous video in sequence) is completed by the user.
 */

export interface FlatVideo {
  id: number;
  sectionId: number;
  orderIndex: number;
}

export interface VideoProgressRecord {
  videoId: number;
  isCompleted: boolean;
}

/**
 * Build flattened list of videos in global order for a subject.
 * Input: sections (with id, order_index) and videos (id, sectionId, order_index).
 */
export function flattenVideoOrder(
  sections: { id: number; orderIndex: number }[],
  videos: { id: number; sectionId: number; orderIndex: number }[]
): FlatVideo[] {
  const bySection = new Map<number, FlatVideo[]>();
  for (const v of videos) {
    const list = bySection.get(v.sectionId) ?? [];
    list.push({ id: v.id, sectionId: v.sectionId, orderIndex: v.orderIndex });
    bySection.set(v.sectionId, list);
  }
  for (const list of bySection.values()) {
    list.sort((a, b) => a.orderIndex - b.orderIndex);
  }
  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);
  const flat: FlatVideo[] = [];
  for (const sec of sortedSections) {
    const list = bySection.get(sec.id) ?? [];
    flat.push(...list);
  }
  return flat;
}

/**
 * Get previous and next video ids in the flattened sequence.
 */
export function getPrevNextVideoId(
  flatOrder: FlatVideo[],
  videoId: number
): { previousVideoId: number | null; nextVideoId: number | null } {
  const idx = flatOrder.findIndex((v) => v.id === videoId);
  if (idx < 0) {
    return { previousVideoId: null, nextVideoId: null };
  }
  return {
    previousVideoId: idx > 0 ? flatOrder[idx - 1].id : null,
    nextVideoId: idx < flatOrder.length - 1 ? flatOrder[idx + 1].id : null,
  };
}

/**
 * For each video id in flatOrder, determine if it's locked.
 * Locked = prerequisite (previous video) exists and is not completed.
 */
export function computeLockedStates(
  flatOrder: FlatVideo[],
  progressByVideoId: Map<number, VideoProgressRecord>
): Map<number, boolean> {
  const locked = new Map<number, boolean>();
  for (let i = 0; i < flatOrder.length; i++) {
    const video = flatOrder[i];
    const prevVideo = i > 0 ? flatOrder[i - 1] : null;
    const isLocked =
      prevVideo !== null &&
      !(progressByVideoId.get(prevVideo.id)?.isCompleted ?? false);
    locked.set(video.id, isLocked);
  }
  return locked;
}

/**
 * Get first unlocked video id that is not yet completed (for start/resume redirect).
 * If all are completed, returns the first video in order.
 */
export function getFirstUnlockedVideoId(
  flatOrder: FlatVideo[],
  progressByVideoId: Map<number, VideoProgressRecord>
): number | null {
  if (flatOrder.length === 0) return null;
  const locked = computeLockedStates(flatOrder, progressByVideoId);
  for (const v of flatOrder) {
    const completed = progressByVideoId.get(v.id)?.isCompleted ?? false;
    if (!locked.get(v.id) && !completed) return v.id;
  }
  return flatOrder[0].id;
}

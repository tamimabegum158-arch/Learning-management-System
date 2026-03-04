import * as videoRepo from "./video.repository.js";
import { prisma } from "../../config/db.js";
import {
  flattenVideoOrder,
  getPrevNextVideoId,
  computeLockedStates,
  type VideoProgressRecord,
} from "../../utils/ordering.js";

export function extractYoutubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export async function createVideo(
  sectionId: number,
  data: { title: string; description?: string | null; youtubeUrl?: string | null }
) {
  const title = (data.title ?? "").trim() || "Untitled";
  const youtubeUrl = data.youtubeUrl != null ? String(data.youtubeUrl).trim() || null : null;
  const youtubeVideoId = youtubeUrl ? extractYoutubeIdFromUrl(youtubeUrl) : null;
  const video = await videoRepo.createVideo(sectionId, {
    title,
    description: data.description != null ? String(data.description).trim() || null : null,
    youtubeUrl: youtubeUrl || null,
    youtubeVideoId: youtubeVideoId || null,
  });
  return {
    id: video.id,
    title: video.title,
    order_index: video.orderIndex,
    section_id: video.sectionId,
  };
}

export async function getVideoById(videoId: number, userId: number) {
  const video = await videoRepo.getVideoWithSectionAndSubject(videoId);
  if (!video) return null;

  const subject = video.section.subject;
  const subjectWithSections = await videoRepo.getSubjectVideosFlattened(subject.id);
  if (!subjectWithSections) return null;

  const flatVideos = flattenVideoOrder(
    subjectWithSections.sections.map((s) => ({ id: s.id, orderIndex: s.orderIndex })),
    subjectWithSections.sections.flatMap((s) =>
      s.videos.map((v) => ({
        id: v.id,
        sectionId: v.sectionId,
        orderIndex: v.orderIndex,
      }))
    )
  );

  const progressRecords = await prisma.videoProgress.findMany({
    where: { userId },
    select: { videoId: true, isCompleted: true },
  });
  const progressByVideoId = new Map<number, VideoProgressRecord>(
    progressRecords.map((p) => [p.videoId, { videoId: p.videoId, isCompleted: p.isCompleted }])
  );
  const lockedMap = computeLockedStates(flatVideos, progressByVideoId);
  const { previousVideoId, nextVideoId } = getPrevNextVideoId(flatVideos, videoId);
  const locked = lockedMap.get(videoId) ?? false;

  const youtubeUrl = video.youtubeUrl ?? (video.youtubeVideoId ? `https://www.youtube.com/watch?v=${video.youtubeVideoId}` : null);
  const youtubeVideoId = video.youtubeVideoId ?? (youtubeUrl ? extractYoutubeIdFromUrl(youtubeUrl) : null);

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    youtube_url: youtubeUrl,
    youtube_video_id: youtubeVideoId,
    order_index: video.orderIndex,
    duration_seconds: video.durationSeconds,
    section_id: video.sectionId,
    section_title: video.section.title,
    subject_id: subject.id,
    subject_title: subject.title,
    previous_video_id: previousVideoId,
    next_video_id: nextVideoId,
    locked,
    unlock_reason: locked ? "Complete previous video" : null,
  };
}

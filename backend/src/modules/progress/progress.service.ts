import * as progressRepo from "./progress.repository.js";
import { prisma } from "../../config/db.js";

export async function getSubjectProgress(subjectId: number, userId: number) {
  return progressRepo.getSubjectProgress(userId, subjectId);
}

export async function getVideoProgress(videoId: number, userId: number) {
  const row = await progressRepo.getVideoProgress(userId, videoId);
  return {
    last_position_seconds: row?.lastPositionSeconds ?? 0,
    is_completed: row?.isCompleted ?? false,
  };
}

export async function upsertVideoProgress(
  videoId: number,
  userId: number,
  data: { last_position_seconds: number; is_completed?: boolean }
) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { durationSeconds: true },
  });
  let lastPositionSeconds = Math.max(0, data.last_position_seconds);
  if (video?.durationSeconds != null) {
    lastPositionSeconds = Math.min(lastPositionSeconds, video.durationSeconds);
  }
  return progressRepo.upsertVideoProgress(userId, videoId, {
    lastPositionSeconds,
    isCompleted: data.is_completed,
  });
}

import { prisma } from "../../config/db.js";

export async function getVideoProgress(userId: number, videoId: number) {
  return prisma.videoProgress.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });
}

export async function upsertVideoProgress(
  userId: number,
  videoId: number,
  data: {
    lastPositionSeconds: number;
    isCompleted?: boolean;
  }
) {
  const payload: {
    lastPositionSeconds: number;
    isCompleted?: boolean;
    completedAt?: Date | null;
  } = {
    lastPositionSeconds: Math.max(0, data.lastPositionSeconds),
    isCompleted: data.isCompleted,
  };
  if (data.isCompleted === true) {
    payload.completedAt = new Date();
  }
  return prisma.videoProgress.upsert({
    where: { userId_videoId: { userId, videoId } },
    create: {
      userId,
      videoId,
      ...payload,
    },
    update: payload,
  });
}

export async function getSubjectProgress(userId: number, subjectId: number) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: { videos: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!subject) return null;

  const videoIds = subject.sections.flatMap((s) => s.videos.map((v) => v.id));
  const totalVideos = videoIds.length;
  if (totalVideos === 0) {
    return {
      totalVideos: 0,
      completedVideos: 0,
      percentComplete: 0,
      lastVideoId: null,
      lastPositionSeconds: null,
    };
  }

  const progressList = await prisma.videoProgress.findMany({
    where: { userId, videoId: { in: videoIds } },
  });
  const completedVideos = progressList.filter((p) => p.isCompleted).length;
  const percentComplete = Math.round((completedVideos / totalVideos) * 100);

  const lastWatched = await prisma.videoProgress.findFirst({
    where: { userId, videoId: { in: videoIds } },
    orderBy: { updatedAt: "desc" },
  });

  return {
    totalVideos,
    completedVideos,
    percentComplete,
    lastVideoId: lastWatched?.videoId ?? null,
    lastPositionSeconds: lastWatched?.lastPositionSeconds ?? null,
  };
}

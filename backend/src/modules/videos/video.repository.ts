import { prisma } from "../../config/db.js";

export async function getVideoWithSectionAndSubject(videoId: number) {
  return prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: { subject: true },
      },
    },
  });
}

export async function getSubjectVideosFlattened(subjectId: number) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          videos: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });
  return subject;
}

export async function createVideo(
  sectionId: number,
  data: {
    title: string;
    description?: string | null;
    youtubeUrl?: string | null;
    youtubeVideoId?: string | null;
    durationSeconds?: number | null;
  }
) {
  const max = await prisma.video.aggregate({
    where: { sectionId },
    _max: { orderIndex: true },
  });
  const orderIndex = (max._max.orderIndex ?? -1) + 1;
  return prisma.video.create({
    data: {
      sectionId,
      title: (data.title ?? "").trim() || "Untitled",
      description: data.description != null ? String(data.description).trim() || null : null,
      youtubeUrl: data.youtubeUrl != null ? String(data.youtubeUrl).trim() || null : null,
      youtubeVideoId: data.youtubeVideoId != null ? String(data.youtubeVideoId).trim() || null : null,
      durationSeconds: data.durationSeconds ?? null,
      orderIndex,
    },
  });
}

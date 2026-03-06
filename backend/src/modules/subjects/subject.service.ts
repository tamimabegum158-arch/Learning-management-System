import * as subjectRepo from "./subject.repository.js";
import * as sectionRepo from "../sections/section.repository.js";
import * as progressRepo from "../progress/progress.repository.js";
import { getSubjectDescriptionFromPreset } from "./subjectPresets.js";

/** Non-technical or removed subject keys: these are excluded from the courses list. */
const NON_TECHNICAL_KEYS = new Set([
  "communication", "communication-skills",
  "project-management", "pm", "pmp",
  "english", "spoken-english", "english-speaking",
  "resume", "resume-writing", "cv",
  "interview", "interview-skills", "job-interview",
  "time-management", "productivity",
  "leadership", "leadership-skills",
  "soft-skills",
  "public-speaking", "presentation-skills",
  "getting-started",
  // Removed: aws, linux, linux-networking, spring boot, networking
  "aws", "amazon-web-services", "cloud",
  "linux", "ubuntu", "unix",
  "linux-networking",
  "spring-boot", "springboot", "spring",
  "networking", "computer-networks", "networks",
  "data-structures", "data-structure", "datastructures", "dsa", "algorithms",
]);
import { prisma } from "../../config/db.js";
import {
  flattenVideoOrder,
  computeLockedStates,
  getFirstUnlockedVideoId as getFirstUnlockedId,
  type VideoProgressRecord,
} from "../../utils/ordering.js";

export async function listSubjects(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  userId?: number;
}) {
  const result = await subjectRepo.getPublishedSubjects({
    ...params,
    excludeSlugs: Array.from(NON_TECHNICAL_KEYS),
  });
  const items = result.items.map((s) => {
    const base = { ...s, priceCents: s.priceCents ?? null };
    if (!s.description?.trim()) {
      const presetDesc = getSubjectDescriptionFromPreset(s.title);
      if (presetDesc) return { ...base, description: presetDesc };
    }
    return base;
  });
  return { ...result, items };
}

export async function createSubject(data: {
  title: string;
  description?: string | null;
  priceCents?: number | null;
}) {
  const title = data.title?.trim();
  if (!title) throw new Error("Title is required");
  const description = data.description?.trim() || null;
  const priceCents =
    data.priceCents != null && Number.isInteger(data.priceCents) && data.priceCents >= 0
      ? data.priceCents
      : null;
  return subjectRepo.createSubject({ title, description, priceCents });
}

export async function updateSubject(
  subjectId: number,
  data: { priceCents?: number | null }
) {
  return subjectRepo.updateSubject(subjectId, data);
}

export async function deleteSubject(subjectId: number) {
  const subject = await subjectRepo.getSubjectById(subjectId);
  if (!subject) return null;
  await subjectRepo.deleteSubject(subjectId);
  return subjectId;
}

export async function createSection(subjectId: number, title: string) {
  const subject = await subjectRepo.getSubjectById(subjectId);
  if (!subject) return null;
  const section = await sectionRepo.createSection(subjectId, title);
  return { id: section.id, title: section.title, order_index: section.orderIndex };
}

export async function enrollUserInSubject(subjectId: number, userId: number) {
  const subject = await subjectRepo.getSubjectById(subjectId);
  if (!subject || !subject.isPublished) return null;
  // Paid courses require purchase; free enroll only for free courses
  if (subject.priceCents != null && subject.priceCents > 0) return null;
  await subjectRepo.enrollUser(userId, subjectId);
  return subjectId;
}

export async function purchaseCourse(subjectId: number, userId: number) {
  const subject = await subjectRepo.getSubjectById(subjectId);
  if (!subject || !subject.isPublished) return null;
  await subjectRepo.enrollUser(userId, subjectId);
  return subjectId;
}

export async function unenrollUserFromSubject(subjectId: number, userId: number) {
  await subjectRepo.unenrollUser(userId, subjectId);
  return subjectId;
}

export async function getMyEnrollmentsWithStats(userId: number) {
  const enrollments = await subjectRepo.getEnrollmentsWithSubjects(userId);
  const results = await Promise.all(
    enrollments.map(async (e) => {
      const progress = await progressRepo.getSubjectProgress(userId, e.subjectId);
      const totalVideos = progress?.totalVideos ?? 0;
      const completedVideos = progress?.completedVideos ?? 0;
      const isCompleted = totalVideos > 0 && completedVideos === totalVideos;
      return {
        subject_id: e.subjectId,
        subject_title: e.subject.title,
        subject_slug: e.subject.slug,
        enrolled_at: e.createdAt.toISOString(),
        total_videos: totalVideos,
        completed_videos: completedVideos,
        percent_complete: progress?.percentComplete ?? 0,
        is_completed: isCompleted,
      };
    })
  );
  const completedCount = results.filter((r) => r.is_completed).length;
  const notCompletedCount = results.length - completedCount;
  return {
    total_enrolled: results.length,
    completed_count: completedCount,
    not_completed_count: notCompletedCount,
    enrollments: results,
  };
}

export async function getSubjectById(id: number) {
  return subjectRepo.getSubjectById(id);
}

export async function getSubjectTree(subjectId: number, userId: number) {
  const subject = await subjectRepo.getSubjectWithSectionsAndVideos(subjectId);
  if (!subject) return null;

  const progressRecords = await prisma.videoProgress.findMany({
    where: { userId },
    select: { videoId: true, isCompleted: true },
  });
  const progressByVideoId = new Map<number, VideoProgressRecord>(
    progressRecords.map((p) => [p.videoId, { videoId: p.videoId, isCompleted: p.isCompleted }])
  );

  const flatVideos = flattenVideoOrder(
    subject.sections.map((s) => ({ id: s.id, orderIndex: s.orderIndex })),
    subject.sections.flatMap((s) =>
      s.videos.map((v) => ({
        id: v.id,
        sectionId: v.sectionId,
        orderIndex: v.orderIndex,
      }))
    )
  );
  const lockedMap = computeLockedStates(flatVideos, progressByVideoId);

  const enrolled = await subjectRepo.getEnrolledSubjectIds(userId).then((ids) => ids.includes(subjectId));
  return {
    id: subject.id,
    title: subject.title,
    priceCents: subject.priceCents ?? null,
    enrolled,
    sections: subject.sections.map((s) => ({
      id: s.id,
      title: s.title,
      order_index: s.orderIndex,
      videos: s.videos.map((v) => ({
        id: v.id,
        title: v.title,
        order_index: v.orderIndex,
        is_completed: progressByVideoId.get(v.id)?.isCompleted ?? false,
        locked: lockedMap.get(v.id) ?? false,
      })),
    })),
  };
}

export async function getFirstUnlockedVideoId(subjectId: number, userId: number) {
  const subject = await subjectRepo.getSubjectWithSectionsAndVideos(subjectId);
  if (!subject) return null;
  const progressRecords = await prisma.videoProgress.findMany({
    where: { userId },
    select: { videoId: true, isCompleted: true },
  });
  const progressByVideoId = new Map<number, VideoProgressRecord>(
    progressRecords.map((p) => [p.videoId, { videoId: p.videoId, isCompleted: p.isCompleted }])
  );
  const flatVideos = flattenVideoOrder(
    subject.sections.map((s) => ({ id: s.id, orderIndex: s.orderIndex })),
    subject.sections.flatMap((s) =>
      s.videos.map((v) => ({
        id: v.id,
        sectionId: v.sectionId,
        orderIndex: v.orderIndex,
      }))
    )
  );
  return getFirstUnlockedId(flatVideos, progressByVideoId);
}

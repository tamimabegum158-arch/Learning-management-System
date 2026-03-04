import { prisma } from "../../config/db.js";

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "subject";
}

export async function createSubject(data: {
  title: string;
  description?: string | null;
}) {
  let slug = slugify(data.title);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.subject.findUnique({ where: { slug: candidate } });
    if (!existing) {
      return prisma.subject.create({
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          slug: candidate,
          isPublished: true,
        },
      });
    }
    suffix += 1;
  }
}

export async function deleteSubject(id: number) {
  return prisma.subject.delete({
    where: { id },
  });
}

export async function getEnrolledSubjectIds(userId: number): Promise<number[]> {
  const rows = await prisma.enrollment.findMany({
    where: { userId },
    select: { subjectId: true },
  });
  return rows.map((r) => r.subjectId);
}

export async function enrollUser(userId: number, subjectId: number) {
  await prisma.enrollment.upsert({
    where: { userId_subjectId: { userId, subjectId } },
    create: { userId, subjectId },
    update: {},
  });
}

export async function unenrollUser(userId: number, subjectId: number) {
  await prisma.enrollment.deleteMany({
    where: { userId, subjectId },
  });
}

export async function getEnrollmentsWithSubjects(userId: number) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      subject: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedSubjects(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  userId?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where = {
    isPublished: true,
    ...(params.q?.trim()
      ? {
          OR: [
            { title: { contains: params.q.trim() } },
            { description: { contains: params.q.trim() } },
            { slug: { contains: params.q.trim() } },
          ],
        }
      : {}),
  };

  let enrolledIds: number[] = [];
  if (params.userId) {
    try {
      enrolledIds = await getEnrolledSubjectIds(params.userId);
    } catch (e) {
      console.error("getEnrolledSubjectIds error:", e);
    }
  }

  const [items, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.subject.count({ where }),
  ]);

  const enrolledSet = new Set(enrolledIds);
  const itemsWithEnrolled = items.map((s) => ({
    ...s,
    enrolled: enrolledSet.has(s.id),
  }));

  return { items: itemsWithEnrolled, total, page, pageSize };
}

export async function getSubjectById(id: number) {
  return prisma.subject.findUnique({
    where: { id },
  });
}

export async function getSubjectBySlug(slug: string) {
  return prisma.subject.findUnique({
    where: { slug },
  });
}

export async function getSubjectWithSectionsAndVideos(subjectId: number) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          videos: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });
  return subject;
}

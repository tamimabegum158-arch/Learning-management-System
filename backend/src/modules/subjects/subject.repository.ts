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
  priceCents?: number | null;
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
          priceCents: data.priceCents ?? null,
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
  excludeSlugs?: string[];
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where = {
    isPublished: true,
    ...(params.excludeSlugs?.length
      ? { slug: { notIn: params.excludeSlugs } }
      : {}),
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

  const [rows, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
          include: {
            videos: {
              orderBy: { orderIndex: "asc" },
              select: { youtubeVideoId: true },
            },
          },
        },
      },
    }),
    prisma.subject.count({ where }),
  ]);

  const enrolledSet = new Set(enrolledIds);
  const items = rows.map((s) => {
    // Thumbnail from the first (opening) section only
    let thumbnailYoutubeId: string | null = null;
    const firstSection = (s.sections ?? [])[0];
    if (firstSection?.videos) {
      for (const video of firstSection.videos) {
        const id = video?.youtubeVideoId?.trim();
        if (id) {
          thumbnailYoutubeId = id;
          break;
        }
      }
    }
    const { sections: _s, ...rest } = s;
    return {
      ...rest,
      enrolled: enrolledSet.has(s.id),
      thumbnailYoutubeId,
    };
  });

  return { items, total, page, pageSize };
}

export async function updateSubject(
  id: number,
  data: { priceCents?: number | null }
) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) return null;
  const priceCents =
    data.priceCents === undefined
      ? undefined
      : data.priceCents == null || data.priceCents < 0
        ? null
        : data.priceCents;
  if (priceCents === undefined) return subject;
  return prisma.subject.update({
    where: { id },
    data: { priceCents },
  });
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

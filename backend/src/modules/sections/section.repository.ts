import { prisma } from "../../config/db.js";

export async function getSectionsBySubjectId(subjectId: number) {
  return prisma.section.findMany({
    where: { subjectId },
    orderBy: { orderIndex: "asc" },
  });
}

export async function createSection(subjectId: number, title: string) {
  const max = await prisma.section.aggregate({
    where: { subjectId },
    _max: { orderIndex: true },
  });
  const orderIndex = (max._max.orderIndex ?? -1) + 1;
  return prisma.section.create({
    data: { subjectId, title: title.trim(), orderIndex },
  });
}

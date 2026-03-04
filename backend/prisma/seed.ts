import { PrismaClient } from "@prisma/client";
import { SUBJECT_PRESETS, presetKeyToTitle } from "../src/modules/subjects/subjectPresets.js";

const prisma = new PrismaClient();

/**
 * Seed uses SUBJECT_PRESETS so every subject gets topic-specific videos only
 * (e.g. SQL → only SQL videos, Java → only Java), from introduction to end.
 * Iterates in REVERSE so technical subjects (first in array) are created last
 * and appear at the TOP of the list; non-technical (end of array) appear lower.
 */

async function main() {
  await prisma.videoProgress.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.subject.deleteMany({});

  const presetsOrderedForDisplay = [...SUBJECT_PRESETS].reverse();
  for (const preset of presetsOrderedForDisplay) {
    const subjectKey = preset.keys[0];
    const title = presetKeyToTitle(subjectKey);
    const slug = subjectKey;

    await prisma.subject.create({
      data: {
        title,
        slug,
        description: preset.description,
        isPublished: true,
        sections: {
          create: preset.sections.map((sec, secIndex) => ({
            title: sec.title,
            orderIndex: secIndex,
            videos: {
              create: (sec.videos || []).map((v, vIndex) => ({
                title: v.title ?? "Video",
                description: v.description ?? null,
                youtubeVideoId: v.youtube_video_id?.trim() || null,
                youtubeUrl: v.youtube_video_id
                  ? `https://www.youtube.com/watch?v=${v.youtube_video_id.trim()}`
                  : null,
                orderIndex: vIndex,
              })),
            },
          })),
        },
      },
    });
    console.log("Seeded subject:", title);
  }

  console.log("Done. Total subjects:", SUBJECT_PRESETS.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

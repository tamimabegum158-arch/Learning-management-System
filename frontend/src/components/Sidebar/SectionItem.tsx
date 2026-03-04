"use client";

import Link from "next/link";
import type { TreeSection } from "@/store/sidebarStore";

interface SectionItemProps {
  section: TreeSection;
  subjectId: string;
}

export function SectionItem({ section, subjectId }: SectionItemProps) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 px-2 mb-2">
        {section.title}
      </h3>
      <ul className="space-y-0.5">
        {section.videos.map((video) => (
          <li key={video.id}>
            {video.locked ? (
              <span className="block px-3 py-1.5 text-sm text-neutral-400 dark:text-neutral-500 cursor-not-allowed">
                {video.title}
                <span className="ml-1.5 text-xs">(locked)</span>
              </span>
            ) : (
              <Link
                href={`/subjects/${subjectId}/video/${video.id}`}
                className="block px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {video.title}
                {video.is_completed && (
                  <span className="ml-1.5 text-xs text-green-600 dark:text-green-400">✓</span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
      <h3 className="text-sm font-medium text-foreground px-2 mb-2">
        {section.title}
      </h3>
      <ul className="space-y-0.5">
        {section.videos.map((video) => (
          <li key={video.id}>
            {video.locked ? (
              <span className="block px-3 py-1.5 text-sm text-muted cursor-not-allowed">
                {video.title}
                <span className="ml-1.5 text-xs">(locked)</span>
              </span>
            ) : (
              <Link
                href={`/subjects/${subjectId}/video/${video.id}`}
                className="block px-3 py-1.5 text-sm text-foreground rounded hover:bg-background"
              >
                {video.title}
                {video.is_completed && (
                  <span className="ml-1.5 text-xs text-muted">✓</span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

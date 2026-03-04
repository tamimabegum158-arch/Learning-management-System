"use client";

import { SectionItem } from "./SectionItem";
import type { SubjectTree } from "@/store/sidebarStore";

interface SubjectSidebarProps {
  tree: SubjectTree;
  subjectId: string;
}

export function SubjectSidebar({ tree, subjectId }: SubjectSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 overflow-y-auto">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
        {tree.title}
      </h2>
      {tree.sections.map((section) => (
        <SectionItem key={section.id} section={section} subjectId={subjectId} />
      ))}
    </aside>
  );
}

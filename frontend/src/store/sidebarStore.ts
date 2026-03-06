"use client";

import { create } from "zustand";
import { apiGet } from "@/lib/apiClient";

export interface TreeVideo {
  id: number;
  title: string;
  order_index: number;
  is_completed: boolean;
  locked: boolean;
}

export interface TreeSection {
  id: number;
  title: string;
  order_index: number;
  videos: TreeVideo[];
}

export interface SubjectTree {
  id: number;
  title: string;
  priceCents?: number | null;
  enrolled?: boolean;
  sections: TreeSection[];
}

interface SidebarState {
  tree: SubjectTree | null;
  loading: boolean;
  error: string | null;
  setTree: (tree: SubjectTree | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTree: (subjectId: string) => Promise<void>;
  markVideoCompleted: (videoId: number) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  tree: null,
  loading: false,
  error: null,
  setTree: (tree) => set({ tree, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchTree: async (subjectId) => {
    set({ loading: true, error: null });
    try {
      const data = await apiGet<SubjectTree>(`/api/subjects/${subjectId}/tree`);
      set({ tree: data, error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load" });
    } finally {
      set({ loading: false });
    }
  },
  markVideoCompleted: (videoId) =>
    set((s) => {
      if (!s.tree) return s;
      return {
        tree: {
          ...s.tree,
          sections: s.tree.sections.map((sec) => ({
            ...sec,
            videos: sec.videos.map((v) =>
              v.id === videoId ? { ...v, is_completed: true } : v
            ),
          })),
        },
      };
    }),
}));

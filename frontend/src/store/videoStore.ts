"use client";

import { create } from "zustand";

/**
 * Video playback state for the current learning session.
 * Plan: currentVideoId, subjectId, currentTime, duration, isPlaying, isCompleted, nextVideoId, prevVideoId.
 */
interface VideoState {
  currentVideoId: number | null;
  subjectId: number | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isCompleted: boolean;
  nextVideoId: number | null;
  prevVideoId: number | null;
  setVideo: (params: {
    currentVideoId: number;
    subjectId: number;
    nextVideoId?: number | null;
    prevVideoId?: number | null;
    duration?: number;
  }) => void;
  setPlayback: (params: {
    currentTime?: number;
    duration?: number;
    isPlaying?: boolean;
    isCompleted?: boolean;
  }) => void;
  reset: () => void;
}

const initialState = {
  currentVideoId: null as number | null,
  subjectId: null as number | null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isCompleted: false,
  nextVideoId: null as number | null,
  prevVideoId: null as number | null,
};

export const useVideoStore = create<VideoState>((set) => ({
  ...initialState,
  setVideo: (params) =>
    set({
      currentVideoId: params.currentVideoId,
      subjectId: params.subjectId,
      nextVideoId: params.nextVideoId ?? null,
      prevVideoId: params.prevVideoId ?? null,
      duration: params.duration ?? 0,
      currentTime: 0,
      isCompleted: false,
    }),
  setPlayback: (params) =>
    set((s) => ({
      ...s,
      ...(params.currentTime !== undefined && { currentTime: params.currentTime }),
      ...(params.duration !== undefined && { duration: params.duration }),
      ...(params.isPlaying !== undefined && { isPlaying: params.isPlaying }),
      ...(params.isCompleted !== undefined && { isCompleted: params.isCompleted }),
    })),
  reset: () => set(initialState),
}));

import { describe, it, expect } from "vitest";
import {
  flattenVideoOrder,
  getPrevNextVideoId,
  computeLockedStates,
  getFirstUnlockedVideoId,
} from "./ordering.js";

describe("ordering", () => {
  const sections = [
    { id: 1, orderIndex: 0 },
    { id: 2, orderIndex: 1 },
  ];
  const videos = [
    { id: 10, sectionId: 1, orderIndex: 0 },
    { id: 11, sectionId: 1, orderIndex: 1 },
    { id: 20, sectionId: 2, orderIndex: 0 },
  ];

  it("flattens video order by section then order_index", () => {
    const flat = flattenVideoOrder(sections, videos);
    expect(flat.map((v) => v.id)).toEqual([10, 11, 20]);
  });

  it("returns previous and next video id", () => {
    const flat = flattenVideoOrder(sections, videos);
    expect(getPrevNextVideoId(flat, 10)).toEqual({
      previousVideoId: null,
      nextVideoId: 11,
    });
    expect(getPrevNextVideoId(flat, 11)).toEqual({
      previousVideoId: 10,
      nextVideoId: 20,
    });
    expect(getPrevNextVideoId(flat, 20)).toEqual({
      previousVideoId: 11,
      nextVideoId: null,
    });
    expect(getPrevNextVideoId(flat, 99)).toEqual({
      previousVideoId: null,
      nextVideoId: null,
    });
  });

  it("computes locked states from progress", () => {
    const flat = flattenVideoOrder(sections, videos);
    const noProgress = new Map();
    const lockedNone = computeLockedStates(flat, noProgress);
    expect(lockedNone.get(10)).toBe(false);
    expect(lockedNone.get(11)).toBe(true);
    expect(lockedNone.get(20)).toBe(true);

    const completed10 = new Map([[10, { videoId: 10, isCompleted: true }]]);
    const lockedAfter10 = computeLockedStates(flat, completed10);
    expect(lockedAfter10.get(10)).toBe(false);
    expect(lockedAfter10.get(11)).toBe(false);
    expect(lockedAfter10.get(20)).toBe(true);

    const completed10and11 = new Map([
      [10, { videoId: 10, isCompleted: true }],
      [11, { videoId: 11, isCompleted: true }],
    ]);
    const lockedAll = computeLockedStates(flat, completed10and11);
    expect(lockedAll.get(10)).toBe(false);
    expect(lockedAll.get(11)).toBe(false);
    expect(lockedAll.get(20)).toBe(false);
  });

  it("returns first unlocked video id", () => {
    const flat = flattenVideoOrder(sections, videos);
    const noProgress = new Map();
    expect(getFirstUnlockedVideoId(flat, noProgress)).toBe(10);

    const completed10 = new Map([[10, { videoId: 10, isCompleted: true }]]);
    expect(getFirstUnlockedVideoId(flat, completed10)).toBe(11);

    const allCompleted = new Map([
      [10, { videoId: 10, isCompleted: true }],
      [11, { videoId: 11, isCompleted: true }],
      [20, { videoId: 20, isCompleted: true }],
    ]);
    expect(getFirstUnlockedVideoId(flat, allCompleted)).toBe(10);
  });
});

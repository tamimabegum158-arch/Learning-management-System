import type { Request, Response } from "express";
import * as videoService from "./video.service.js";

export async function getVideoById(req: Request, res: Response) {
  const videoId = parseInt(req.params.videoId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(videoId)) {
    res.status(400).json({ error: "Invalid video ID" });
    return;
  }
  const video = await videoService.getVideoById(videoId, userId);
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  res.json(video);
}

export async function createVideo(req: Request, res: Response) {
  const body = (req.body as { sectionId?: number; title?: string; description?: string; youtubeUrl?: string }) ?? {};
  const sectionId = typeof body.sectionId === "number" ? body.sectionId : parseInt(String(body.sectionId ?? ""), 10);
  if (Number.isNaN(sectionId)) {
    res.status(400).json({ error: "sectionId is required" });
    return;
  }
  const title = body.title?.trim();
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  try {
    const video = await videoService.createVideo(sectionId, {
      title,
      description: body.description?.trim() || null,
      youtubeUrl: body.youtubeUrl?.trim() || null,
    });
    res.status(201).json(video);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create video";
    res.status(400).json({ error: msg });
  }
}

import type { Request, Response } from "express";
import * as progressService from "./progress.service.js";

export async function getSubjectProgress(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const progress = await progressService.getSubjectProgress(subjectId, userId);
  if (!progress) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.json({
    total_videos: progress.totalVideos,
    completed_videos: progress.completedVideos,
    percent_complete: progress.percentComplete,
    last_video_id: progress.lastVideoId,
    last_position_seconds: progress.lastPositionSeconds,
  });
}

export async function getVideoProgress(req: Request, res: Response) {
  const videoId = parseInt(req.params.videoId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(videoId)) {
    res.status(400).json({ error: "Invalid video ID" });
    return;
  }
  const progress = await progressService.getVideoProgress(videoId, userId);
  res.json(progress);
}

export async function upsertVideoProgress(req: Request, res: Response) {
  const videoId = parseInt(req.params.videoId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(videoId)) {
    res.status(400).json({ error: "Invalid video ID" });
    return;
  }
  const body = req.body as { last_position_seconds?: number; is_completed?: boolean };
  await progressService.upsertVideoProgress(videoId, userId, {
    last_position_seconds: body.last_position_seconds ?? 0,
    is_completed: body.is_completed,
  });
  res.json({ ok: true });
}

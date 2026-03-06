import type { Request, Response } from "express";
import * as subjectService from "./subject.service.js";

export async function listSubjects(req: Request, res: Response) {
  const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
  const pageSize = req.query.pageSize
    ? parseInt(String(req.query.pageSize), 10)
    : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const userId = req.user?.id;
  const result = await subjectService.listSubjects({ page, pageSize, q, userId });
  res.json(result);
}

export async function enrollInSubject(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const result = await subjectService.enrollUserInSubject(subjectId, userId);
  if (result === null) {
    res.status(404).json({ error: "Subject not found or not published" });
    return;
  }
  res.status(201).json({ enrolled: true, subject_id: subjectId });
}

export async function unenrollFromSubject(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  await subjectService.unenrollUserFromSubject(subjectId, userId);
  res.json({ enrolled: false, subject_id: subjectId });
}

export async function purchaseSubject(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const result = await subjectService.purchaseCourse(subjectId, userId);
  if (result === null) {
    res.status(404).json({ error: "Subject not found or not published" });
    return;
  }
  res.status(201).json({ purchased: true, subject_id: subjectId });
}

export async function createSubject(req: Request, res: Response) {
  const body = (req.body as { title?: string; description?: string; priceCents?: number }) ?? {};
  const title = body.title?.trim();
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  try {
    const subject = await subjectService.createSubject({
      title,
      description: body.description?.trim() || null,
      priceCents: body.priceCents,
    });
    res.status(201).json({
      id: subject.id,
      title: subject.title,
      slug: subject.slug,
      description: subject.description ?? null,
      priceCents: subject.priceCents ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create subject";
    res.status(400).json({ error: msg });
  }
}

export async function patchSubject(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const body = (req.body as { priceCents?: number | null }) ?? {};
  let subject;
  try {
    subject = await subjectService.updateSubject(subjectId, {
      priceCents: body.priceCents,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    res.status(400).json({ error: `Failed to update price: ${msg}` });
    return;
  }
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.json({
    id: subject.id,
    title: subject.title,
    slug: subject.slug,
    description: subject.description ?? null,
    priceCents: subject.priceCents ?? null,
  });
}

export async function deleteSubject(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const result = await subjectService.deleteSubject(subjectId);
  if (result === null) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.status(204).send();
}

export async function getSubjectById(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const subject = await subjectService.getSubjectById(subjectId);
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.json(subject);
}

export async function getSubjectTree(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const tree = await subjectService.getSubjectTree(subjectId, userId);
  if (!tree) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.json(tree);
}

export async function getFirstUnlockedVideo(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  const userId = req.user!.id;
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const videoId = await subjectService.getFirstUnlockedVideoId(subjectId, userId);
  if (videoId === null) {
    res.status(404).json({ error: "No unlocked video found" });
    return;
  }
  res.json({ video_id: videoId });
}

export async function createSection(req: Request, res: Response) {
  const subjectId = parseInt(req.params.subjectId, 10);
  if (Number.isNaN(subjectId)) {
    res.status(400).json({ error: "Invalid subject ID" });
    return;
  }
  const body = (req.body as { title?: string }) ?? {};
  const title = body.title?.trim();
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const section = await subjectService.createSection(subjectId, title);
  if (!section) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.status(201).json(section);
}

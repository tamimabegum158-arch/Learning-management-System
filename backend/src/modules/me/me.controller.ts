import type { Request, Response } from "express";
import * as subjectService from "../subjects/subject.service.js";

export async function getMyEnrollments(req: Request, res: Response) {
  const userId = req.user!.id;
  const data = await subjectService.getMyEnrollmentsWithStats(userId);
  res.json(data);
}

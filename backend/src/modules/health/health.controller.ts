import type { Request, Response } from "express";

/**
 * Health check for platform uptime (e.g. Render).
 * GET /api/health → { status: "ok" }
 */
export function getHealth(_req: Request, res: Response) {
  res.json({ status: "ok" });
}

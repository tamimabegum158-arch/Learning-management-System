import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
}

import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  next();
  const ms = Date.now() - start;
  console.log(`${req.method} ${req.path} ${ms}ms`);
}

import type { Request, Response } from "express";
import {
  cookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../../config/security.js";
import * as authService from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validator.js";

function firstValidationMessage(zError: { flatten: () => { fieldErrors: Record<string, string[]> } }): string {
  const flat = zError.flatten();
  const first = Object.values(flat.fieldErrors).flat()[0];
  return first ?? "Validation failed";
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = firstValidationMessage(parsed.error);
      res.status(400).json({ error: message, details: parsed.error.flatten() });
      return;
    }
    const result = await authService.register(parsed.data);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, cookieOptions);
    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    if (e instanceof Error && e.stack) {
      console.error("Register error:", msg, e.stack);
    }
    if (!res.headersSent) {
      if (msg === "Email already registered") {
        res.status(409).json({ error: msg });
        return;
      }
      res.status(400).json({ error: msg });
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = firstValidationMessage(parsed.error);
      res.status(400).json({ error: message, details: parsed.error.flatten() });
      return;
    }
    const result = await authService.login(parsed.data);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, cookieOptions);
    res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    if (e instanceof Error && e.stack) {
      console.error("Login error:", msg, e.stack);
    }
    if (!res.headersSent) {
      const isAuthError = msg === "Invalid email or password";
      res.status(isAuthError ? 401 : 500).json({ error: isAuthError ? msg : "Login failed. Please try again." });
    }
  }
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  try {
    const result = await authService.refresh(token);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, cookieOptions);
    res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  await authService.logout(token);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    path: cookieOptions.path,
    domain: cookieOptions.domain,
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
  res.json({ ok: true });
}

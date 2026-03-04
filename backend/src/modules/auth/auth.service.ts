import { prisma } from "../../config/db.js";
import {
  cookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../../config/security.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import type { RegisterInput, LoginInput } from "./auth.validator.js";
import crypto from "node:crypto";

const REFRESH_TOKEN_DAYS = 30;

function getRefreshTokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_DAYS);
  return d;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already registered");
  }
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
  });
  return await issueTokens(user.id, user.email, user.name);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new Error("Invalid email or password");
  }
  return await issueTokens(user.id, user.email, user.name);
}


async function issueTokens(userId: number, email: string, name: string) {
  const jti = crypto.randomUUID();
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken(userId, jti);
  const expiresAt = getRefreshTokenExpiry();
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return {
    user: { id: userId, email, name },
    accessToken,
    refreshToken,
    refreshTokenMeta: { tokenHash, expiresAt, userId },
  };
}

export async function refresh(refreshTokenValue: string | undefined) {
  if (!refreshTokenValue) {
    throw new Error("Refresh token required");
  }
  const payload = verifyRefreshToken(refreshTokenValue);
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshTokenValue)
    .digest("hex");

  const row = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.sub },
  });

  const jti = crypto.randomUUID();
  const newAccessToken = signAccessToken({ sub: user.id, email: user.email });
  const newRefreshToken = signRefreshToken(user.id, jti);
  const expiresAt = getRefreshTokenExpiry();
  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    refreshTokenMeta: { tokenHash: newTokenHash, expiresAt, userId: user.id },
  };
}

export async function logout(refreshTokenValue: string | undefined) {
  if (!refreshTokenValue) {
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshTokenValue);
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshTokenValue)
      .digest("hex");
    await prisma.refreshToken.updateMany({
      where: { userId: payload.sub, tokenHash },
      data: { revokedAt: new Date() },
    });
  } catch {
    // ignore invalid token
  }
}

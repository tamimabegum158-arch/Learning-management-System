import jwt, { type SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/security.js";

export interface AccessPayload {
  sub: number;
  email: string;
  type: "access";
}

export interface RefreshPayload {
  sub: number;
  jti: string;
  type: "refresh";
}

export function signAccessToken(payload: Omit<AccessPayload, "type">): string {
  return jwt.sign(
    { ...payload, type: "access" },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn } as SignOptions
  );
}

export function signRefreshToken(userId: number, jti: string): string {
  return jwt.sign(
    { sub: userId, jti, type: "refresh" },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions
  );
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, jwtConfig.accessSecret) as unknown as AccessPayload;
  if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, jwtConfig.refreshSecret) as unknown as RefreshPayload;
  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return decoded;
}

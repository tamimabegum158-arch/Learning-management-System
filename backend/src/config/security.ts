import { env } from "./env.js";

// JWT: 15 min access, 30 days refresh
export const JWT_ACCESS_EXPIRES_IN = "15m";
export const JWT_REFRESH_EXPIRES_IN = "30d";

export const jwtConfig = {
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: JWT_ACCESS_EXPIRES_IN,
  refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
};

const { COOKIE_SECURE: cookieSecure, COOKIE_DOMAIN: cookieDomain } = env;
// Omit domain for localhost to avoid cookie issues in some browsers/servers
const domain = cookieDomain && cookieDomain !== "localhost" ? cookieDomain : undefined;
export const cookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
  ...(domain && { domain }),
};

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

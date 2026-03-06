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

// Normalize: trim and remove trailing slash so CORS matches browser Origin (no trailing slash)
const corsOriginRaw = env.CORS_ORIGIN?.trim().replace(/\/+$/, "") || "";
const corsOriginList = corsOriginRaw
  ? corsOriginRaw.split(",").map((o) => o.trim()).filter(Boolean)
  : [];
// Always allow localhost:3000 for local dev so frontend can reach backend even when .env has production CORS
const localDevOrigin = "http://localhost:3000";
const allowedOrigins = corsOriginList.includes(localDevOrigin)
  ? corsOriginList
  : [localDevOrigin, ...corsOriginList];
function originAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // allow requests with no Origin (e.g. same-origin, Postman)
  const normalized = origin.replace(/\/+$/, "");
  return allowedOrigins.some((o) => o === normalized);
}
export const corsOptions = {
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean | string) => void) => {
    if (originAllowed(origin)) {
      cb(null, origin || true); // reflect origin when present (required for credentials)
      return;
    }
    cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

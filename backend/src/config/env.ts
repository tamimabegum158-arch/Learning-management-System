import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");
/** Path to backend .env (for loading at request time if needed) */
export const backendEnvPath = path.join(backendRoot, ".env");
// Load .env from multiple possible locations so it's always found
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "backend", ".env") });
dotenv.config({ path: backendEnvPath });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

/** Validate DATABASE_URL is an absolute connection string (e.g. mysql://...) so Prisma does not throw "relative URL without a base". */
function requireDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw || typeof raw !== "string") {
    throw new Error(
      "DATABASE_URL is not set. On Render: add DATABASE_URL in Environment with your full MySQL URL (e.g. from Aiven: mysql://user:password@host:port/dbname?ssl-mode=REQUIRED)."
    );
  }
  const value = raw.trim();
  if (!value) {
    throw new Error("DATABASE_URL is empty. Set it in Render → Environment to your full MySQL connection string.");
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) {
    throw new Error(
      "DATABASE_URL must be a full URL starting with mysql:// (e.g. mysql://user:password@host:port/database). Check for typos or missing mysql:// in Render Environment."
    );
  }
  process.env.DATABASE_URL = value;
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  // Database (validated so Prisma does not get "relative URL without a base")
  DATABASE_URL: requireDatabaseUrl(),

  // JWT
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),

  // Cookie
  COOKIE_DOMAIN: optionalEnv("COOKIE_DOMAIN", "localhost"),
  COOKIE_SECURE: process.env.COKIE_SECURE === "true",

  // CORS
  CORS_ORIGIN: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),

  // Server
  PORT: parseInt(optionalEnv("PORT", "4000"), 10),
  NODE_ENV: optionalEnv("NODE_ENV", "development"),

  // AI – optional keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN ?? "",
  HF_CHAT_MODEL: process.env.HF_CHAT_MODEL ?? "",
};

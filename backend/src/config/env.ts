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
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  // Database
  DATABASE_URL: requireEnv("DATABASE_URL"),

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

  // AI (optional – free Gemini key for "Ask AI" on subject/video pages)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
};

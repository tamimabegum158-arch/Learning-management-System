import type { User as PrismaUser } from "@prisma/client";

/**
 * User model - aligns with Prisma schema (users table).
 * Use Prisma client for DB operations; this type is for auth and API responses.
 */
export type User = Pick<PrismaUser, "id" | "email" | "name" | "createdAt" | "updatedAt">;

export type UserPublic = Pick<PrismaUser, "id" | "email" | "name">;

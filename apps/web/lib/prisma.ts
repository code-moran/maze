import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured(): boolean {
  const url =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";
  if (!url) return false;
  // Ignore Prisma init placeholders so the site falls back to JSON cleanly
  if (url.includes("user:password@") || url.includes("johndoe:randompassword")) {
    return false;
  }
  return true;
}

export function getDatabaseUrl(): string | undefined {
  if (!isDatabaseConfigured()) return undefined;
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    undefined
  );
}

function createPrismaClient() {
  const url = getDatabaseUrl();
  if (!url) return null;
  // Ensure Prisma sees DATABASE_URL even when only POSTGRES_URL is set (Vercel/Neon)
  if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

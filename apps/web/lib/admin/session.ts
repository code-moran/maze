import { createHmac, timingSafeEqual } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export const ADMIN_COOKIE = "maze_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function adminSecret(): string | undefined {
  return (
    process.env.ADMIN_DASHBOARD_SECRET?.trim() ||
    process.env.ADMIN_ENQUIRIES_SECRET?.trim() ||
    undefined
  );
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string | null {
  const secret = adminSecret();
  if (!secret) return null;
  const now = Date.now();
  const payload = `maze-admin:${now}:${now + SESSION_TTL_MS}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null
): boolean {
  const secret = adminSecret();
  if (!secret || !token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  if (!safeEqualHex(signature, expected)) return false;

  const parts = payload.split(":");
  const exp = Number(parts[2]);
  if (!Number.isFinite(exp)) {
    // Legacy tokens without expiry — reject so sessions re-issue
    return false;
  }
  return Date.now() <= exp;
}

export function getAdminSecretConfigured(): boolean {
  return Boolean(adminSecret());
}

export function secretsMatch(provided: string, expected: string): boolean {
  return safeEqualHex(provided, expected);
}

export async function isAdminRequestAuthorized(
  request: Request
): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (session?.user) return true;

  const secret = adminSecret();
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice("Bearer ".length).trim();
      if (secretsMatch(token, secret)) return true;
    }
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`)
  );
  if (match && verifyAdminSessionToken(decodeURIComponent(match[1]))) {
    return true;
  }
  return false;
}

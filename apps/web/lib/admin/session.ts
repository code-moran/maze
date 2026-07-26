import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "maze_admin_session";

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

export function createAdminSessionToken(): string | null {
  const secret = adminSecret();
  if (!secret) return null;
  const payload = `maze-admin:${Date.now()}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null
): boolean {
  const secret = adminSecret();
  if (!secret || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function getAdminSecretConfigured(): boolean {
  return Boolean(adminSecret());
}

export function isAdminRequestAuthorized(request: Request): boolean {
  const secret = adminSecret();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`)
  );
  if (match && verifyAdminSessionToken(decodeURIComponent(match[1]))) {
    return true;
  }
  return false;
}

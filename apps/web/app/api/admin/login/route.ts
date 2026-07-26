import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSecretConfigured,
  isAdminRequestAuthorized,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!getAdminSecretConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin secret is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const secret = String(body?.secret || "").trim();
  const expected =
    process.env.ADMIN_DASHBOARD_SECRET?.trim() ||
    process.env.ADMIN_ENQUIRIES_SECRET?.trim() ||
    "";

  if (!secret || secret !== expected) {
    return NextResponse.json(
      { ok: false, error: "Invalid secret" },
      { status: 401 }
    );
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Unable to create session" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: Request) {
  return NextResponse.json({
    ok: isAdminRequestAuthorized(request),
    configured: getAdminSecretConfigured(),
  });
}

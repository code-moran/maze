import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { expires: new Date(0), path: "/" });
  response.cookies.set("maze_admin", "", { expires: new Date(0), path: "/" });
  response.cookies.set("next-auth.session-token", "", { expires: new Date(0), path: "/" });
  response.cookies.set("__Secure-next-auth.session-token", "", { expires: new Date(0), path: "/" });
  return response;
}

export async function GET() {
  return POST();
}

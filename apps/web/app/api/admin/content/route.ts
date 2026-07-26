import { NextResponse } from "next/server";
import { requireAdmin, jsonOk, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const data = await loadSiteContent();
  return jsonOk({
    data,
    database: isDatabaseConfigured() && Boolean(prisma),
  });
}

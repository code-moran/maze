import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation for Sanity webhooks.
 * Point a Sanity webhook (dataset: production, trigger: create/update/delete)
 * at POST /api/revalidate-sanity with header:
 *   Authorization: Bearer <SANITY_REVALIDATE_SECRET>
 * or query ?secret=<SANITY_REVALIDATE_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const bearerOk = auth === `Bearer ${secret}`;
  const queryOk = querySecret === secret;

  if (!bearerOk && !queryOk) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("sanity", "max");
  revalidatePath("/", "layout");

  return NextResponse.json({
    ok: true,
    revalidated: true,
    now: Date.now(),
  });
}

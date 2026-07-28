import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const folder = String(body.folder || "maze").trim();
    const timestamp = Math.round(new Date().getTime() / 1000);

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dupnafrdv";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "public";

    // If API key or secret are present, compute signed signature; otherwise provide unsigned upload metadata
    let signature = "";
    if (apiKey && apiSecret) {
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${uploadPreset}`;
      signature = crypto
        .createHash("sha1")
        .update(paramsToSign + apiSecret)
        .digest("hex");
    }

    return NextResponse.json({
      ok: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadPreset,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate signature";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

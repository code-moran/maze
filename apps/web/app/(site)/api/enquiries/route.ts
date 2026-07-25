import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { Resend } from "resend";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

async function ensureTable() {
  if (!process.env.POSTGRES_URL) return;
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (body?.company) {
      return NextResponse.json({ ok: true });
    }

    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !phone || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (process.env.POSTGRES_URL) {
      await ensureTable();
      await sql`
        INSERT INTO enquiries (name, phone, email, subject, message, status)
        VALUES (${name}, ${phone}, ${email || null}, ${subject}, ${message}, 'New')
      `;
    } else {
      console.info("[enquiries] No POSTGRES_URL — logged only:", {
        name,
        phone,
        email,
        subject,
      });
    }

    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Maze <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL,
        subject: `New enquiry: ${subject}`,
        text: [
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email || "(none)"}`,
          `Subject: ${subject}`,
          "",
          message,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[enquiries]", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save enquiry" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.ADMIN_ENQUIRIES_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ enquiries: [] });
  }

  await ensureTable();
  const { rows } = await sql`
    SELECT id, name, phone, email, subject, message, status, created_at
    FROM enquiries
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return NextResponse.json({ enquiries: rows });
}

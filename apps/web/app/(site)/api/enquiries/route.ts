import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { isAdminRequestAuthorized } from "@/lib/admin/auth";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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
    const type = String(body?.type || "GENERAL").trim().toUpperCase();
    const productName = body?.productName ? String(body.productName).trim() : null;
    const serviceType = body?.serviceType ? String(body.serviceType).trim() : null;
    const preferredDate = body?.preferredDate ? String(body.preferredDate).trim() : null;
    const location = body?.location ? String(body.location).trim() : null;

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Name and Phone number are required." },
        { status: 400 }
      );
    }

    const enquiryType =
      type === "QUOTE" ? "QUOTE" : type === "INSTALLATION" ? "INSTALLATION" : "GENERAL";

    const finalSubject =
      subject ||
      (enquiryType === "QUOTE"
        ? `Quote Request: ${productName || "Product"}`
        : enquiryType === "INSTALLATION"
        ? `Installation Request: ${serviceType || productName || "Service"}`
        : "General Enquiry");

    if (isDatabaseConfigured() && prisma) {
      await prisma.enquiry.create({
        data: {
          name,
          phone,
          email: email || null,
          subject: finalSubject,
          message,
          type: enquiryType,
          productName,
          serviceType,
          preferredDate,
          location,
          status: "New",
        },
      });
    }

    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Maze <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL,
        subject: `New ${enquiryType} request: ${finalSubject}`,
        text: [
          `Type: ${enquiryType}`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email || "(none)"}`,
          `Product: ${productName || "(none)"}`,
          `Service: ${serviceType || "(none)"}`,
          `Location: ${location || "(none)"}`,
          `Preferred Date: ${preferredDate || "(none)"}`,
          `Subject: ${finalSubject}`,
          "",
          message,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[enquiries]", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !prisma) {
    return NextResponse.json({ enquiries: [] });
  }

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    enquiries: enquiries.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      subject: row.subject,
      message: row.message,
      type: row.type || "GENERAL",
      productName: row.productName,
      serviceType: row.serviceType,
      preferredDate: row.preferredDate,
      location: row.location,
      status: row.status,
      created_at: row.createdAt,
    })),
  });
}

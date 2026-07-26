import { requireAdmin, jsonOk, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid body");
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      phone: String(body.phone ?? ""),
      email: String(body.email ?? ""),
      whatsapp: String(body.whatsapp ?? ""),
      location: String(body.location ?? ""),
      mapEmbed: String(body.mapEmbed ?? ""),
      socialLinks: body.socialLinks ?? [],
      footerBlurb: String(body.footerBlurb ?? body.blurb ?? ""),
      hours: String(body.hours ?? ""),
      businessHoursDetail: String(body.businessHoursDetail ?? ""),
      copyright: String(body.copyright ?? ""),
      logoIconUrl: String(body.logoIconUrl ?? ""),
      logoWordmarkUrl: String(body.logoWordmarkUrl ?? ""),
    },
    update: {
      phone: String(body.phone ?? ""),
      email: String(body.email ?? ""),
      whatsapp: String(body.whatsapp ?? ""),
      location: String(body.location ?? ""),
      mapEmbed: String(body.mapEmbed ?? ""),
      socialLinks: body.socialLinks ?? [],
      footerBlurb: String(body.footerBlurb ?? body.blurb ?? ""),
      hours: String(body.hours ?? ""),
      businessHoursDetail: String(body.businessHoursDetail ?? ""),
      copyright: String(body.copyright ?? ""),
      logoIconUrl: String(body.logoIconUrl ?? ""),
      logoWordmarkUrl: String(body.logoWordmarkUrl ?? ""),
    },
  });

  return jsonOk({ settings });
}

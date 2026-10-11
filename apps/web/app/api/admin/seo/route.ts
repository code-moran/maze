import { requireAdmin, jsonSaved, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Invalid body");

  if (body.siteMeta) {
    const m = body.siteMeta;
    await prisma.siteMeta.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        title: String(m.title ?? ""),
        description: String(m.description ?? ""),
        keywords: String(m.keywords ?? ""),
        ogTitle: String(m.ogTitle ?? ""),
        ogDescription: String(m.ogDescription ?? ""),
      },
      update: {
        title: String(m.title ?? ""),
        description: String(m.description ?? ""),
        keywords: String(m.keywords ?? ""),
        ogTitle: String(m.ogTitle ?? ""),
        ogDescription: String(m.ogDescription ?? ""),
      },
    });
  }

  if (body.sectionSeo && typeof body.sectionSeo === "object") {
    for (const [section, value] of Object.entries(
      body.sectionSeo as Record<string, { title?: string; description?: string }>
    )) {
      await prisma.sectionSeo.upsert({
        where: { section },
        create: {
          section,
          title: String(value?.title ?? ""),
          description: String(value?.description ?? ""),
        },
        update: {
          title: String(value?.title ?? ""),
          description: String(value?.description ?? ""),
        },
      });
    }
  }

  if (body.categorySeo && typeof body.categorySeo === "object") {
    for (const [key, value] of Object.entries(
      body.categorySeo as Record<
        string,
        {
          title?: string;
          description?: string;
          metaTitle?: string;
          metaDescription?: string;
        }
      >
    )) {
      if (key === "all") continue;
      await prisma.category.upsert({
        where: { key },
        create: {
          key,
          title: String(value?.title || key),
          description: String(value?.description ?? ""),
          metaTitle: String(value?.metaTitle ?? ""),
          metaDescription: String(value?.metaDescription ?? ""),
        },
        update: {
          title: String(value?.title ?? key),
          description: String(value?.description ?? ""),
          metaTitle: String(value?.metaTitle ?? ""),
          metaDescription: String(value?.metaDescription ?? ""),
        },
      });
    }
  }

  return jsonSaved({});
}

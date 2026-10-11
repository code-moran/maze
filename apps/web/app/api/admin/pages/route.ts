import { requireAdmin, jsonSaved, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid body");
  }

  const section = String(body.section || "");

  switch (section) {
    case "home": {
      const home = await prisma.homeContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          heroSlides: body.heroSlides ?? [],
          stats: body.stats ?? [],
          cta: body.cta ?? {},
          heroBackgrounds: body.heroBackgrounds ?? [],
          aboutImages: body.aboutImages ?? [],
        },
        update: {
          heroSlides: body.heroSlides ?? [],
          stats: body.stats ?? [],
          cta: body.cta ?? {},
          heroBackgrounds: body.heroBackgrounds ?? [],
          aboutImages: body.aboutImages ?? [],
        },
      });
      return jsonSaved({ home });
    }
    case "about": {
      const about = await prisma.aboutContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          paragraphOne: String(body.paragraphOne ?? ""),
          paragraphTwo: String(body.paragraphTwo ?? ""),
          visionTitle: String(body.visionTitle ?? ""),
          visionText: String(body.visionText ?? ""),
          missionTitle: String(body.missionTitle ?? ""),
          missionText: String(body.missionText ?? ""),
        },
        update: {
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          paragraphOne: String(body.paragraphOne ?? ""),
          paragraphTwo: String(body.paragraphTwo ?? ""),
          visionTitle: String(body.visionTitle ?? ""),
          visionText: String(body.visionText ?? ""),
          missionTitle: String(body.missionTitle ?? ""),
          missionText: String(body.missionText ?? ""),
        },
      });
      return jsonSaved({ about });
    }
    case "services": {
      const existingServices = await prisma.servicesContent.findUnique({
        where: { id: "default" },
      });
      const services = await prisma.servicesContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
          tv: body.tv ?? existingServices?.tv ?? {},
          solar: body.solar ?? existingServices?.solar ?? {},
        },
        update: {
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
          ...(body.tv !== undefined ? { tv: body.tv } : {}),
          ...(body.solar !== undefined ? { solar: body.solar } : {}),
        },
      });
      return jsonSaved({ services });
    }
    case "contact": {
      const contact = await prisma.contactContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
        },
        update: {
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
        },
      });
      return jsonSaved({ contact });
    }
    case "products": {
      const productsPage = await prisma.productsPageContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
          heroBackground: String(body.heroBackground ?? ""),
        },
        update: {
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
          heroBackground: String(body.heroBackground ?? ""),
        },
      });
      return jsonSaved({ productsPage });
    }
    case "charges": {
      const existing = await prisma.servicesContent.findUnique({
        where: { id: "default" },
      });
      const services = await prisma.servicesContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          tv: body.tv ?? {},
          solar: body.solar ?? {},
        },
        update: {
          tv: body.tv ?? existing?.tv ?? {},
          solar: body.solar ?? existing?.solar ?? {},
        },
      });
      return jsonSaved({ services });
    }
    default:
      return jsonError("Unknown section");
  }
}

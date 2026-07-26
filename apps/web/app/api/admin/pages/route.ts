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
      return jsonOk({ home });
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
      return jsonOk({ about });
    }
    case "services": {
      const services = await prisma.servicesContent.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
          tv: body.tv ?? {},
          solar: body.solar ?? {},
        },
        update: {
          label: String(body.label ?? ""),
          title: String(body.title ?? ""),
          subtitle: String(body.subtitle ?? ""),
          tv: body.tv ?? undefined,
          solar: body.solar ?? undefined,
        },
      });
      return jsonOk({ services });
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
      return jsonOk({ contact });
    }
    case "products": {
      const productsPage = await prisma.productsPageContent.upsert({
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
      return jsonOk({ productsPage });
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
      return jsonOk({ services });
    }
    default:
      return jsonError("Unknown section");
  }
}

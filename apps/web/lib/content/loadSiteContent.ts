import type { SiteData } from "@/data/types";
import { getSiteData } from "@/data/siteData";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Load site content from Prisma when DATABASE_URL/POSTGRES_URL is set and
 * content exists; otherwise fall back to defaultSiteData.json.
 */
export async function loadSiteContent(): Promise<SiteData> {
  const fallback = structuredClone(getSiteData()) as SiteData;

  if (!isDatabaseConfigured() || !prisma) {
    return fallback;
  }

  try {
    const [
      settings,
      meta,
      home,
      about,
      services,
      contact,
      productsPage,
      categories,
      products,
      blogs,
      testimonials,
      whyChoose,
      sectionSeos,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.siteMeta.findUnique({ where: { id: "default" } }),
      prisma.homeContent.findUnique({ where: { id: "default" } }),
      prisma.aboutContent.findUnique({ where: { id: "default" } }),
      prisma.servicesContent.findUnique({ where: { id: "default" } }),
      prisma.contactContent.findUnique({ where: { id: "default" } }),
      prisma.productsPageContent.findUnique({ where: { id: "default" } }),
      prisma.category.findMany({
        include: { subProducts: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        include: { category: true },
        orderBy: { legacyId: "asc" },
      }),
      prisma.blogPost.findMany({ orderBy: { date: "desc" } }),
      prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.whyChooseItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.sectionSeo.findMany(),
    ]);

    if (!settings && !meta && products.length === 0) {
      return fallback;
    }

    const merged = fallback;

    if (settings) {
      merged.generalSettings = {
        phone: settings.phone,
        email: settings.email,
        whatsapp: settings.whatsapp,
        location: settings.location,
        mapEmbed: settings.mapEmbed,
        socialLinks: asArray(settings.socialLinks),
      };
      merged.footer = {
        blurb: settings.footerBlurb,
        hours: settings.hours,
        businessHoursDetail: settings.businessHoursDetail,
        copyright: settings.copyright,
      };
    }

    if (meta) {
      merged.siteMeta = {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        ogTitle: meta.ogTitle,
        ogDescription: meta.ogDescription,
      };
    }

    if (home) {
      const slides = asArray<SiteData["sections"]["heroSlides"][number]>(
        home.heroSlides
      );
      if (slides.length) merged.sections.heroSlides = slides;
      const stats = asArray<SiteData["stats"][number]>(home.stats);
      if (stats.length) merged.stats = stats;
      const cta = asRecord(home.cta);
      if (cta.title) {
        merged.cta = {
          title: String(cta.title || merged.cta.title),
          subtitle: String(cta.subtitle || merged.cta.subtitle),
        };
      }
      const backgrounds = asArray<string>(home.heroBackgrounds);
      if (backgrounds.length) merged.heroBackgrounds = backgrounds;
      const aboutImages = asArray<string>(home.aboutImages);
      if (aboutImages.length) merged.aboutImages = aboutImages;
    }

    if (about) {
      merged.sections.aboutIntro = {
        label: about.label,
        title: about.title,
        paragraphOne: about.paragraphOne,
        paragraphTwo: about.paragraphTwo,
        visionTitle: about.visionTitle,
        visionText: about.visionText,
        missionTitle: about.missionTitle,
        missionText: about.missionText,
      };
    }

    if (services) {
      merged.sections.servicesIntro = {
        label: services.label,
        title: services.title,
        subtitle: services.subtitle,
      };
      const tv = asRecord(services.tv);
      const solar = asRecord(services.solar);
      if (Object.keys(tv).length) {
        merged.serviceCharges.tv = {
          ...merged.serviceCharges.tv,
          ...(tv as object),
        };
      }
      if (Object.keys(solar).length) {
        merged.serviceCharges.solar = {
          ...merged.serviceCharges.solar,
          ...(solar as object),
        };
      }
    }

    if (contact) {
      merged.sections.contactIntro = {
        label: contact.label,
        title: contact.title,
        subtitle: contact.subtitle,
      };
    }

    if (productsPage) {
      merged.sections.productsIntro = {
        label: productsPage.label,
        title: productsPage.title,
        subtitle: productsPage.subtitle,
      };
    }

    if (categories.length) {
      const categorySeo: SiteData["categorySeo"] = { ...merged.categorySeo };
      const subProducts: SiteData["subProducts"] = {};
      for (const cat of categories) {
        categorySeo[cat.key] = {
          title: cat.title,
          description: cat.description,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
        };
        subProducts[cat.key] = cat.subProducts.map((s) => ({
          id: s.subId,
          label: s.label,
        }));
      }
      merged.categorySeo = categorySeo;
      if (Object.keys(subProducts).length) merged.subProducts = subProducts;
    }

    if (products.length) {
      merged.products = products.map((p) => ({
        id: p.legacyId,
        name: p.name,
        cat: p.category.key,
        catLabel: p.catLabel,
        subCat: p.subCat,
        shortDesc: p.shortDesc,
        desc: p.description,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        specs: asArray<string[]>(p.specs),
        features: asArray<string>(p.features),
        imgs: asArray<string>(p.imageUrls),
      }));
    }

    if (blogs.length) {
      merged.blogs = blogs.map((b) => ({
        id: b.legacyId,
        title: b.title,
        date: b.date,
        author: b.author,
        excerpt: b.excerpt,
        content: b.content,
        image: b.imageUrl,
        link: b.link,
      }));
    }

    if (testimonials.length) {
      merged.testimonials = testimonials.map((t) => ({
        stars: t.stars,
        quote: t.quote,
        initials: t.initials,
        name: t.name,
        role: t.role,
      }));
    }

    if (whyChoose.length) {
      merged.whyChoose = whyChoose.map((w) => ({
        icon: w.icon,
        title: w.title,
        text: w.text,
      }));
    }

    if (sectionSeos.length) {
      for (const seo of sectionSeos) {
        merged.sectionSeo[seo.section] = {
          title: seo.title,
          description: seo.description,
        };
      }
    }

    return merged;
  } catch (error) {
    console.warn("Prisma content load failed, using static JSON", error);
    return fallback;
  }
}

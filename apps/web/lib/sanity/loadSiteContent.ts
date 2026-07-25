import {
  getSanityClient,
  isSanityConfigured,
  resolveImageUrl,
  SANITY_REVALIDATE_SECONDS,
} from "./client";
import { getSiteData } from "@/data/siteData";
import type { SiteData } from "@/data/types";
import type { SanityImageSource } from "@sanity/image-url";

type FetchOpts = {
  next: { revalidate: number; tags: string[] };
};

const fetchOpts: FetchOpts = {
  next: {
    revalidate: SANITY_REVALIDATE_SECONDS,
    tags: ["sanity"],
  },
};

/**
 * Load site content from Sanity when configured; otherwise fall back to static JSON.
 * Fetches use ISR (`revalidate`) so Studio publishes appear within about a minute.
 */
export async function loadSiteContent(): Promise<SiteData> {
  const fallback = structuredClone(getSiteData()) as SiteData;
  if (!isSanityConfigured) return fallback;

  const client = getSanityClient();
  if (!client) return fallback;

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
      subProducts,
    ] = await Promise.all([
      client.fetch(`*[_type == "siteSettings"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "siteMeta"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "homePage"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "aboutPage"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "servicesPage"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "contactPage"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "productsPage"][0]`, {}, fetchOpts),
      client.fetch(`*[_type == "category"] | order(order asc)`, {}, fetchOpts),
      client.fetch(
        `*[_type == "product"]{..., "cat": category->key.current}`,
        {},
        fetchOpts
      ),
      client.fetch(`*[_type == "blogPost"] | order(date desc)`, {}, fetchOpts),
      client.fetch(
        `*[_type == "testimonial"] | order(order asc)`,
        {},
        fetchOpts
      ),
      client.fetch(
        `*[_type == "whyChooseItem"] | order(order asc)`,
        {},
        fetchOpts
      ),
      client.fetch(`*[_type == "sectionSeo"]`, {}, fetchOpts),
      client.fetch(
        `*[_type == "subProduct"]{subId,label,order,"categoryKey": category->key.current} | order(order asc)`,
        {},
        fetchOpts
      ),
    ]);

    const merged: SiteData = structuredClone(fallback);

    if (settings) {
      merged.generalSettings = {
        phone: settings.phone ?? merged.generalSettings.phone,
        email: settings.email ?? merged.generalSettings.email,
        whatsapp: settings.whatsapp ?? merged.generalSettings.whatsapp,
        location: settings.location ?? merged.generalSettings.location,
        mapEmbed: settings.mapEmbed ?? merged.generalSettings.mapEmbed,
        socialLinks: settings.socialLinks?.length
          ? settings.socialLinks
          : merged.generalSettings.socialLinks,
      };
      if (settings.footerBlurb) merged.footer.blurb = settings.footerBlurb;
      if (settings.hours) merged.footer.hours = settings.hours;
      if (settings.businessHoursDetail)
        merged.footer.businessHoursDetail = settings.businessHoursDetail;
      if (settings.copyright) merged.footer.copyright = settings.copyright;
    }

    if (meta) {
      merged.siteMeta = {
        title: meta.title ?? merged.siteMeta.title,
        description: meta.description ?? merged.siteMeta.description,
        keywords: meta.keywords ?? merged.siteMeta.keywords,
        ogTitle: meta.ogTitle ?? merged.siteMeta.ogTitle,
        ogDescription: meta.ogDescription ?? merged.siteMeta.ogDescription,
      };
    }

    if (home?.heroSlides?.length) {
      merged.sections.heroSlides = home.heroSlides.map(
        (s: {
          badge?: string;
          title?: string;
          description?: string;
          backgroundImage?: SanityImageSource;
        }) => ({
          badge: s.badge || "",
          title: s.title || "",
          description: s.description || "",
        })
      );

      const slideBackgrounds = home.heroSlides
        .map((s: { backgroundImage?: SanityImageSource }) =>
          resolveImageUrl(s.backgroundImage)
        )
        .filter(Boolean) as string[];
      if (slideBackgrounds.length) {
        merged.heroBackgrounds = slideBackgrounds;
      }
    }
    if (home?.stats?.length) merged.stats = home.stats;
    if (home?.cta) merged.cta = home.cta;

    if (about) {
      merged.sections.aboutIntro = {
        label: about.label ?? merged.sections.aboutIntro.label,
        title: about.title ?? merged.sections.aboutIntro.title,
        paragraphOne:
          about.paragraphOne ?? merged.sections.aboutIntro.paragraphOne,
        paragraphTwo:
          about.paragraphTwo ?? merged.sections.aboutIntro.paragraphTwo,
        visionTitle:
          about.visionTitle ?? merged.sections.aboutIntro.visionTitle,
        visionText: about.visionText ?? merged.sections.aboutIntro.visionText,
        missionTitle:
          about.missionTitle ?? merged.sections.aboutIntro.missionTitle,
        missionText:
          about.missionText ?? merged.sections.aboutIntro.missionText,
      };
      if (Array.isArray(about.images) && about.images.length) {
        const urls = about.images
          .map((img: SanityImageSource) => resolveImageUrl(img))
          .filter(Boolean) as string[];
        if (urls.length) merged.aboutImages = urls;
      }
    }

    if (services) {
      merged.sections.servicesIntro = {
        label: services.label ?? merged.sections.servicesIntro.label,
        title: services.title ?? merged.sections.servicesIntro.title,
        subtitle: services.subtitle ?? merged.sections.servicesIntro.subtitle,
      };
      if (services.tv)
        merged.serviceCharges.tv = {
          ...merged.serviceCharges.tv,
          ...services.tv,
        };
      if (services.solar)
        merged.serviceCharges.solar = {
          ...merged.serviceCharges.solar,
          ...services.solar,
        };
    }

    if (contact) {
      merged.sections.contactIntro = {
        label: contact.label ?? merged.sections.contactIntro.label,
        title: contact.title ?? merged.sections.contactIntro.title,
        subtitle: contact.subtitle ?? merged.sections.contactIntro.subtitle,
      };
    }

    if (productsPage) {
      merged.sections.productsIntro = {
        label: productsPage.label ?? merged.sections.productsIntro.label,
        title: productsPage.title ?? merged.sections.productsIntro.title,
        subtitle:
          productsPage.subtitle ?? merged.sections.productsIntro.subtitle,
      };
    }

    if (categories?.length) {
      for (const cat of categories) {
        const key = cat.key?.current || cat.key;
        if (!key || key === "all") continue;
        merged.categorySeo[key as keyof typeof merged.categorySeo] = {
          title: cat.title,
          description: cat.description,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
        };
      }
    }

    if (subProducts?.length) {
      const byCat: SiteData["subProducts"] = {};
      for (const sub of subProducts) {
        const key = sub.categoryKey as keyof SiteData["subProducts"] | undefined;
        if (!key) continue;
        if (!byCat[key]) byCat[key] = [];
        byCat[key].push({
          id: sub.subId || "",
          label: sub.label || "",
        });
      }
      if (Object.keys(byCat).length) {
        merged.subProducts = { ...merged.subProducts, ...byCat };
      }
    }

    if (products?.length) {
      merged.products = products.map(
        (
          p: {
            legacyId?: number;
            name: string;
            cat?: string;
            catLabel?: string;
            subCat?: string;
            shortDesc?: string;
            desc?: string;
            seoTitle?: string;
            seoDescription?: string;
            specs?: { label: string; value: string }[];
            features?: string[];
            imageUrls?: string[];
            images?: SanityImageSource[];
          },
          index: number
        ) => {
          const fromAssets = (p.images || [])
            .map((img) => resolveImageUrl(img))
            .filter(Boolean) as string[];
          const fromUrls = (p.imageUrls || []).filter(Boolean);
          return {
            id: p.legacyId ?? index + 1,
            name: p.name,
            cat: (p.cat || "tv-mounts") as SiteData["products"][0]["cat"],
            catLabel: p.catLabel || "",
            subCat: p.subCat || "",
            shortDesc: p.shortDesc || "",
            desc: p.desc || "",
            seoTitle: p.seoTitle || "",
            seoDescription: p.seoDescription || "",
            specs: (p.specs || []).map(
              (s) => [s.label, s.value] as [string, string]
            ),
            features: p.features || [],
            imgs: fromAssets.length ? fromAssets : fromUrls,
          };
        }
      );
    }

    if (blogs?.length) {
      merged.blogs = blogs.map(
        (
          b: {
            legacyId?: number;
            title: string;
            date?: string;
            author?: string;
            excerpt?: string;
            content?: string;
            imageUrl?: string;
            image?: SanityImageSource;
            link?: string;
          },
          index: number
        ) => ({
          id: b.legacyId ?? index + 1,
          title: b.title,
          date: b.date || "",
          author: b.author || "Admin",
          excerpt: b.excerpt || "",
          content: b.content || "",
          image: resolveImageUrl(b.image, b.imageUrl || ""),
          link: b.link || "#",
        })
      );
    }

    if (testimonials?.length) merged.testimonials = testimonials;
    if (whyChoose?.length) merged.whyChoose = whyChoose;

    if (sectionSeos?.length) {
      for (const seo of sectionSeos) {
        if (
          seo.section &&
          merged.sectionSeo[seo.section as keyof typeof merged.sectionSeo]
        ) {
          merged.sectionSeo[seo.section as keyof typeof merged.sectionSeo] = {
            title: seo.title,
            description: seo.description,
          };
        }
      }
    }

    return merged;
  } catch (error) {
    console.warn("Sanity fetch failed, using static data", error);
    return fallback;
  }
}

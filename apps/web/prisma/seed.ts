import { Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
const __dirname = dirname(fileURLToPath(import.meta.url));

type SiteJson = {
  siteMeta: Record<string, string>;
  sectionSeo: Record<string, { title: string; description: string }>;
  categorySeo: Record<
    string,
    {
      title: string;
      description: string;
      metaTitle: string;
      metaDescription: string;
    }
  >;
  subProducts: Record<string, { id: string; label: string }[]>;
  generalSettings: {
    phone: string;
    email: string;
    whatsapp: string;
    location: string;
    mapEmbed: string;
    socialLinks: unknown[];
  };
  serviceCharges: Record<string, unknown>;
  blogs: {
    id: number;
    title: string;
    date: string;
    author: string;
    excerpt: string;
    content: string;
    image: string;
    link: string;
  }[];
  sections: {
    heroSlides: unknown[];
    productsIntro: Record<string, string>;
    servicesIntro: Record<string, string>;
    aboutIntro: Record<string, string>;
    contactIntro: Record<string, string>;
  };
  products: {
    id: number;
    name: string;
    cat: string;
    catLabel: string;
    subCat: string;
    shortDesc: string;
    desc: string;
    seoTitle: string;
    seoDescription: string;
    specs: string[][];
    features: string[];
    imgs: string[];
  }[];
  stats: unknown[];
  whyChoose: { icon: string; title: string; text: string }[];
  testimonials: {
    stars: string;
    quote: string;
    initials: string;
    name: string;
    role: string;
  }[];
  cta: Record<string, string>;
  footer: {
    blurb: string;
    hours: string;
    businessHoursDetail: string;
    copyright: string;
  };
  aboutImages: string[];
  heroBackgrounds: string[];
};

const CAT_ICONS: Record<string, string> = {
  "tv-mounts": "bi-tv",
  guards: "bi-shield-check",
  solar: "bi-sun",
  cables: "bi-plug",
};

function slugify(title: string) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL or POSTGRES_URL before seeding");
  }

  const data = JSON.parse(
    readFileSync(join(__dirname, "../data/defaultSiteData.json"), "utf8")
  ) as SiteJson;

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      phone: data.generalSettings.phone,
      email: data.generalSettings.email,
      whatsapp: data.generalSettings.whatsapp,
      location: data.generalSettings.location,
      mapEmbed: data.generalSettings.mapEmbed,
      socialLinks: asJson(data.generalSettings.socialLinks),
      footerBlurb: data.footer.blurb,
      hours: data.footer.hours,
      businessHoursDetail: data.footer.businessHoursDetail,
      copyright: data.footer.copyright,
    },
    update: {
      phone: data.generalSettings.phone,
      email: data.generalSettings.email,
      whatsapp: data.generalSettings.whatsapp,
      location: data.generalSettings.location,
      mapEmbed: data.generalSettings.mapEmbed,
      socialLinks: asJson(data.generalSettings.socialLinks),
      footerBlurb: data.footer.blurb,
      hours: data.footer.hours,
      businessHoursDetail: data.footer.businessHoursDetail,
      copyright: data.footer.copyright,
    },
  });

  await prisma.siteMeta.upsert({
    where: { id: "default" },
    create: { id: "default", ...data.siteMeta },
    update: { ...data.siteMeta },
  });

  await prisma.homeContent.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroSlides: asJson(data.sections.heroSlides),
      stats: asJson(data.stats),
      cta: asJson(data.cta),
      heroBackgrounds: asJson(data.heroBackgrounds),
      aboutImages: asJson(data.aboutImages),
    },
    update: {
      heroSlides: asJson(data.sections.heroSlides),
      stats: asJson(data.stats),
      cta: asJson(data.cta),
      heroBackgrounds: asJson(data.heroBackgrounds),
      aboutImages: asJson(data.aboutImages),
    },
  });

  await prisma.aboutContent.upsert({
    where: { id: "default" },
    create: { id: "default", ...data.sections.aboutIntro },
    update: { ...data.sections.aboutIntro },
  });

  await prisma.servicesContent.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...data.sections.servicesIntro,
      tv: asJson(data.serviceCharges.tv || {}),
      solar: asJson(data.serviceCharges.solar || {}),
    },
    update: {
      ...data.sections.servicesIntro,
      tv: asJson(data.serviceCharges.tv || {}),
      solar: asJson(data.serviceCharges.solar || {}),
    },
  });

  await prisma.contactContent.upsert({
    where: { id: "default" },
    create: { id: "default", ...data.sections.contactIntro },
    update: { ...data.sections.contactIntro },
  });

  await prisma.productsPageContent.upsert({
    where: { id: "default" },
    create: { id: "default", ...data.sections.productsIntro },
    update: { ...data.sections.productsIntro },
  });

  const categoryIds: Record<string, string> = {};
  let order = 0;
  for (const [key, seo] of Object.entries(data.categorySeo)) {
    if (key === "all") continue;
    const cat = await prisma.category.upsert({
      where: { key },
      create: {
        key,
        title: seo.title,
        description: seo.description,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        icon: CAT_ICONS[key] || "bi-box",
        sortOrder: order++,
      },
      update: {
        title: seo.title,
        description: seo.description,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        icon: CAT_ICONS[key] || "bi-box",
        sortOrder: order - 1,
      },
    });
    categoryIds[key] = cat.id;

    const subs = data.subProducts[key] || [];
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      await prisma.subProduct.upsert({
        where: {
          categoryId_subId: { categoryId: cat.id, subId: sub.id },
        },
        create: {
          subId: sub.id,
          label: sub.label,
          sortOrder: i,
          categoryId: cat.id,
        },
        update: {
          label: sub.label,
          sortOrder: i,
        },
      });
    }
  }

  for (const p of data.products) {
    const categoryId = categoryIds[p.cat];
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { legacyId: p.id },
      create: {
        legacyId: p.id,
        name: p.name,
        catLabel: p.catLabel,
        subCat: p.subCat,
        shortDesc: p.shortDesc,
        description: p.desc,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        specs: asJson(p.specs),
        features: asJson(p.features),
        imageUrls: asJson(p.imgs),
        categoryId,
      },
      update: {
        name: p.name,
        catLabel: p.catLabel,
        subCat: p.subCat,
        shortDesc: p.shortDesc,
        description: p.desc,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        specs: asJson(p.specs),
        features: asJson(p.features),
        imageUrls: asJson(p.imgs),
        categoryId,
      },
    });
  }

  for (const b of data.blogs) {
    const slug = slugify(b.title);
    await prisma.blogPost.upsert({
      where: { legacyId: b.id },
      create: {
        legacyId: b.id,
        title: b.title,
        slug,
        date: b.date,
        author: b.author,
        excerpt: b.excerpt,
        content: b.content,
        imageUrl: b.image,
        link: b.link,
      },
      update: {
        title: b.title,
        slug,
        date: b.date,
        author: b.author,
        excerpt: b.excerpt,
        content: b.content,
        imageUrl: b.image,
        link: b.link,
      },
    });
  }

  await prisma.testimonial.deleteMany();
  for (let i = 0; i < data.testimonials.length; i++) {
    const t = data.testimonials[i];
    await prisma.testimonial.create({
      data: { ...t, sortOrder: i },
    });
  }

  await prisma.whyChooseItem.deleteMany();
  for (let i = 0; i < data.whyChoose.length; i++) {
    const w = data.whyChoose[i];
    await prisma.whyChooseItem.create({
      data: { ...w, sortOrder: i },
    });
  }

  for (const [section, seo] of Object.entries(data.sectionSeo)) {
    await prisma.sectionSeo.upsert({
      where: { section },
      create: { section, title: seo.title, description: seo.description },
      update: { title: seo.title, description: seo.description },
    });
  }

  console.log("Seeded Maze site content from defaultSiteData.json");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

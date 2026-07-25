/**
 * Seed script: prints Sanity create mutations from defaultSiteData.json.
 * Run after creating a Sanity project:
 *   1. Set NEXT_PUBLIC_SANITY_PROJECT_ID / DATASET / SANITY_API_WRITE_TOKEN
 *   2. npx sanity dataset import (or use this script with @sanity/client)
 *
 * Usage: node --experimental-strip-types scripts/seed-sanity.mjs
 * Or: npm run seed:sanity
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(join(__dirname, "../data/defaultSiteData.json"), "utf8")
);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN to seed."
  );
  console.log(
    "Schemas are ready at /studio. You can also paste content manually from defaultSiteData.json."
  );
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

const docs = [];

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  ...data.generalSettings,
  footerBlurb: data.footer.blurb,
  hours: data.footer.hours,
  businessHoursDetail: data.footer.businessHoursDetail,
  copyright: data.footer.copyright,
});

docs.push({
  _id: "siteMeta",
  _type: "siteMeta",
  ...data.siteMeta,
});

docs.push({
  _id: "homePage",
  _type: "homePage",
  heroSlides: data.sections.heroSlides,
  stats: data.stats,
  cta: data.cta,
});

docs.push({
  _id: "aboutPage",
  _type: "aboutPage",
  ...data.sections.aboutIntro,
});

docs.push({
  _id: "servicesPage",
  _type: "servicesPage",
  ...data.sections.servicesIntro,
  tv: data.serviceCharges.tv,
  solar: data.serviceCharges.solar,
});

docs.push({
  _id: "contactPage",
  _type: "contactPage",
  ...data.sections.contactIntro,
});

docs.push({
  _id: "productsPage",
  _type: "productsPage",
  ...data.sections.productsIntro,
});

const catIcons = {
  "tv-mounts": "bi-tv",
  guards: "bi-shield-check",
  solar: "bi-sun",
  cables: "bi-plug",
};

let order = 0;
for (const [key, seo] of Object.entries(data.categorySeo)) {
  if (key === "all") continue;
  docs.push({
    _id: `category-${key}`,
    _type: "category",
    key: { _type: "slug", current: key },
    title: seo.title,
    description: seo.description,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    icon: catIcons[key],
    order: order++,
  });
}

for (const [cat, items] of Object.entries(data.subProducts)) {
  items.forEach((item, i) => {
    docs.push({
      _id: `subProduct-${cat}-${item.id}`,
      _type: "subProduct",
      subId: item.id,
      label: item.label,
      category: { _type: "reference", _ref: `category-${cat}` },
      order: i,
    });
  });
}

data.products.forEach((p) => {
  docs.push({
    _id: `product-${p.id}`,
    _type: "product",
    legacyId: p.id,
    name: p.name,
    category: { _type: "reference", _ref: `category-${p.cat}` },
    catLabel: p.catLabel,
    subCat: p.subCat,
    shortDesc: p.shortDesc,
    desc: p.desc,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    specs: p.specs.map(([label, value]) => ({ label, value })),
    features: p.features,
    imageUrls: p.imgs,
  });
});

data.blogs.forEach((b) => {
  docs.push({
    _id: `blog-${b.id}`,
    _type: "blogPost",
    legacyId: b.id,
    title: b.title,
    slug: {
      _type: "slug",
      current: b.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    },
    date: b.date,
    author: b.author,
    excerpt: b.excerpt,
    content: b.content,
    imageUrl: b.image,
    link: b.link,
  });
});

data.testimonials.forEach((t, i) => {
  docs.push({
    _id: `testimonial-${i}`,
    _type: "testimonial",
    ...t,
    order: i,
  });
});

data.whyChoose.forEach((w, i) => {
  docs.push({
    _id: `why-${i}`,
    _type: "whyChooseItem",
    ...w,
    order: i,
  });
});

for (const [section, seo] of Object.entries(data.sectionSeo)) {
  docs.push({
    _id: `sectionSeo-${section}`,
    _type: "sectionSeo",
    section,
    ...seo,
  });
}

const tx = client.transaction();
for (const doc of docs) {
  tx.createOrReplace(doc);
}

await tx.commit();
console.log(`Seeded ${docs.length} documents to ${projectId}/${dataset}`);

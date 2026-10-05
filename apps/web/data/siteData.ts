import defaultSiteData from "./defaultSiteData.json";
import type { BlogPost, Product, ProductCategoryId, SiteData } from "./types";

const CATEGORY_ICONS: Record<string, string> = {
  "tv-mounts": "bi-tv",
  "solar-outdoor-lights": "bi-sun",
  guards: "bi-shield-check",
  "extension-sockets": "bi-plug",
  solar: "bi-sun",
  cables: "bi-plug",
};

const CATEGORY_ORDER: string[] = [
  "tv-mounts",
  "solar-outdoor-lights",
  "guards",
  "extension-sockets",
];

export const CATEGORY_ALIASES: Record<string, string> = {
  solar: "solar-outdoor-lights",
  cables: "extension-sockets",
  "extension-cables": "extension-sockets",
};

export function normalizeCategorySlug(slug: string): string {
  const norm = slugify(slug);
  return CATEGORY_ALIASES[norm] || norm;
}

export function getSiteData(): SiteData {
  return defaultSiteData as SiteData;
}

export function phoneDigits(value?: string): string {
  return (value || "").replace(/[^\d]/g, "");
}

export function telHref(phone?: string): string {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : "tel:";
}

export function whatsappLink(whatsapp?: string): string {
  const digits = phoneDigits(whatsapp);
  return digits ? `https://wa.me/${digits}` : "#";
}

export function slugify(title: string): string {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategoryIcon(catId: string, fallback?: string): string {
  if (fallback) return fallback;
  return CATEGORY_ICONS[catId as ProductCategoryId] || "bi-box";
}

export function getProductCategories(data: SiteData = getSiteData()) {
  if (Array.isArray(data.categories) && data.categories.length > 0) {
    return [...data.categories]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => ({
        id: c.key,
        label: c.title || data.categorySeo[c.key]?.title || c.key,
        icon: c.icon || getCategoryIcon(c.key),
        description:
          c.description || data.categorySeo[c.key]?.description || "",
      }));
  }

  const keys = Object.keys(data.categorySeo || {}).filter((k) => k !== "all");
  const allKeys = Array.from(new Set([...CATEGORY_ORDER, ...keys]));

  return allKeys.map((id) => ({
    id,
    label: data.categorySeo[id]?.title || id,
    icon: getCategoryIcon(id),
    description: data.categorySeo[id]?.description || "",
  }));
}

export function getBlogBySlug(
  slug: string,
  data: SiteData = getSiteData()
): BlogPost | undefined {
  const norm = slugify(slug);
  return data.blogs.find((post) => {
    if (post.slug && slugify(post.slug) === norm) return true;
    if (slugify(post.title) === norm) return true;
    const linkSlug = String(post.link || "")
      .split("/")
      .filter(Boolean)
      .pop();
    return linkSlug ? slugify(linkSlug) === norm : false;
  });
}

export function getBlogSlug(post: BlogPost): string {
  if (post.slug) return slugify(post.slug);
  const linkSlug = String(post.link || "")
    .split("/")
    .filter(Boolean)
    .pop();
  if (linkSlug && linkSlug !== "#") return slugify(linkSlug);
  return slugify(post.title);
}

export function extractMapEmbedSrc(value?: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes("<iframe")) {
    const match = raw.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  }
  return raw;
}

export function formatBlogDate(date: string): string {
  const dateObj = date ? new Date(date) : null;
  if (!dateObj || Number.isNaN(dateObj.valueOf())) return "";
  // Fixed locale avoids server/client hydration mismatches from toLocaleDateString()
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRichText(value?: string): string {
  const safe = String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return safe
    .split(/\n{2,}/)
    .map((part) => `<p>${part.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function findProduct(
  id: number,
  data: SiteData = getSiteData()
): Product | undefined {
  return data.products.find((product) => product.id === id);
}

export function getProductSlug(product: Product): string {
  if (product.slug) {
    return slugify(product.slug);
  }
  return slugify(product.name);
}

export function getProductBySlug(
  slug: string,
  data: SiteData = getSiteData()
): Product | undefined {
  const norm = slugify(slug);
  return data.products.find(
    (product) => getProductSlug(product) === norm || String(product.id) === norm
  );
}

export function getProductHref(product: Product): string {
  const cat = normalizeCategorySlug(product.cat);
  const slug = getProductSlug(product);
  return `/${cat}/${slug}`;
}

export function getProductByCategoryAndSlug(
  categorySlug: string,
  productSlug: string,
  data: SiteData = getSiteData()
): Product | undefined {
  const normCat = normalizeCategorySlug(categorySlug);
  const normSlug = slugify(productSlug);
  return data.products.find((p) => {
    const pCat = normalizeCategorySlug(p.cat);
    if (pCat !== normCat) return false;
    return (
      getProductSlug(p) === normSlug ||
      String(p.id) === normSlug ||
      slugify(p.subCat) === normSlug
    );
  });
}

export { CATEGORY_ICONS, CATEGORY_ORDER };

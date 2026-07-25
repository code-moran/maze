import defaultSiteData from "./defaultSiteData.json";
import type { BlogPost, Product, ProductCategoryId, SiteData } from "./types";

const CATEGORY_ICONS: Record<ProductCategoryId, string> = {
  "tv-mounts": "bi-tv",
  guards: "bi-shield-check",
  solar: "bi-sun",
  cables: "bi-plug",
};

const CATEGORY_ORDER: ProductCategoryId[] = [
  "tv-mounts",
  "guards",
  "solar",
  "cables",
];

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

export function getCategoryIcon(catId: string): string {
  return CATEGORY_ICONS[catId as ProductCategoryId] || "bi-box";
}

export function getProductCategories(data: SiteData = getSiteData()) {
  return CATEGORY_ORDER.map((id) => ({
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
  return data.blogs.find((post) => slugify(post.title) === slug);
}

export function getBlogSlug(post: BlogPost): string {
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
  return dateObj.toLocaleDateString(undefined, {
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

export { CATEGORY_ICONS, CATEGORY_ORDER };

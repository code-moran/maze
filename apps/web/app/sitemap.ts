import type { MetadataRoute } from "next";
import {
  getBlogSlug,
  getProductCategories,
  getProductSlug,
} from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await loadSiteContent();
  const now = new Date();
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/services",
    "/about",
    "/blog",
    "/location",
    "/contact",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" || path === "/products" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.7,
  }));

  const categories = getProductCategories(data).map((cat) => ({
    url: absoluteUrl(`/products/category/${cat.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const products = data.products.map((product) => ({
    url: absoluteUrl(`/products/${getProductSlug(product)}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogs = data.blogs.map((post) => ({
    url: absoluteUrl(`/blog/${getBlogSlug(post)}`),
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categories,
    ...products,
    ...blogs,
    // Ensure base is always present even if absoluteUrl edge-cases
    ...(staticRoutes.some((e) => e.url === base) ? [] : [{ url: base, lastModified: now }]),
  ];
}

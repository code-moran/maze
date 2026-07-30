import type { Metadata } from "next";
import type { SiteData } from "@/data/types";

/** Public site origin used for canonicals, sitemap, and Open Graph. */
export function getSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "";
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  keywords,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    keywords: keywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type,
      images: ogImage,
      siteName: "Maze",
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function siteMetaFromContent(data: SiteData): Metadata {
  const meta = data.siteMeta;
  const homeSeo = data.sectionSeo?.home;
  return buildPageMetadata({
    title: homeSeo?.title || meta.title,
    description: homeSeo?.description || meta.description,
    path: "/",
    image: data.heroBackgrounds?.[0],
    keywords: meta.keywords,
  });
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function organizationJsonLd(data: SiteData) {
  const g = data.generalSettings;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maze",
    url: getSiteUrl(),
    email: g.email || undefined,
    telephone: g.phone || undefined,
    address: g.location
      ? {
          "@type": "PostalAddress",
          streetAddress: g.location,
          addressCountry: "KE",
        }
      : undefined,
    sameAs: (g.socialLinks || [])
      .filter((s) => s.enabled && s.url)
      .map((s) => s.url),
  };
}

export function productJsonLd(
  product: SiteData["products"][number],
  path: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription || product.shortDesc || product.desc,
    image: product.imgs?.filter(Boolean),
    sku: String(product.id),
    category: product.catLabel,
    brand: {
      "@type": "Brand",
      name: "Maze",
    },
    url: absoluteUrl(path),
  };
}

export function blogPostingJsonLd(
  post: SiteData["blogs"][number],
  path: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image || undefined,
    datePublished: post.date || undefined,
    author: {
      "@type": "Person",
      name: post.author || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: "Maze",
      url: getSiteUrl(),
    },
    mainEntityOfPage: absoluteUrl(path),
    url: absoluteUrl(path),
  };
}

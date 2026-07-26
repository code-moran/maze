/**
 * Sanity client helpers.
 * When NEXT_PUBLIC_SANITY_PROJECT_ID is unset, the app falls back to static JSON data.
 */
import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

/** How often public pages re-fetch Sanity after publish (seconds). */
export const SANITY_REVALIDATE_SECONDS = 60;

export const isSanityConfigured = Boolean(
  projectId && projectId !== "placeholder"
);

function readToken(): string | undefined {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  // Empty / placeholder tokens break public dataset reads
  if (!token || token === "undefined" || token === "null") return undefined;
  return token;
}

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    // API (not CDN) so publishes are visible as soon as Next revalidates
    useCdn: false,
    token: readToken(),
  });
}

export function urlForImage(source: SanityImageSource) {
  if (!isSanityConfigured) return null;
  const client = getSanityClient();
  if (!client) return null;
  return imageUrlBuilder(client).image(source);
}

export function resolveImageUrl(
  source: SanityImageSource | null | undefined,
  fallback = ""
): string {
  if (!source) return fallback;
  try {
    return urlForImage(source)?.width(1600).url() || fallback;
  } catch {
    return fallback;
  }
}

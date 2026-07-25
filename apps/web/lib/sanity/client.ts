/**
 * Sanity client helpers.
 * When NEXT_PUBLIC_SANITY_PROJECT_ID is unset, the app falls back to static JSON data.
 */
import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const isSanityConfigured = Boolean(projectId && projectId !== "placeholder");

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    token: process.env.SANITY_API_READ_TOKEN,
  });
}

export function urlForImage(source: SanityImageSource) {
  if (!isSanityConfigured) return null;
  const client = getSanityClient();
  if (!client) return null;
  return imageUrlBuilder(client).image(source);
}

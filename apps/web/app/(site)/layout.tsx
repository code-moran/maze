import SiteChrome from "@/components/SiteChrome";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/client";

/** Re-fetch Sanity content periodically so Studio publishes show without redeploy. */
export const revalidate = SANITY_REVALIDATE_SECONDS;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await loadSiteContent();
  return <SiteChrome data={siteData}>{children}</SiteChrome>;
}

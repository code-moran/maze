import SiteChrome from "@/components/SiteChrome";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";

/** Re-fetch Sanity content periodically so Studio publishes show without redeploy. */
export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await loadSiteContent();
  return <SiteChrome data={siteData}>{children}</SiteChrome>;
}

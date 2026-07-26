import SiteChrome from "@/components/SiteChrome";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

/** Re-fetch CMS content periodically so admin saves show without redeploy. */
export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await loadSiteContent();
  return <SiteChrome data={siteData}>{children}</SiteChrome>;
}

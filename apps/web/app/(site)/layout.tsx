import SiteChrome from "@/components/SiteChrome";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await loadSiteContent();
  return <SiteChrome data={siteData}>{children}</SiteChrome>;
}

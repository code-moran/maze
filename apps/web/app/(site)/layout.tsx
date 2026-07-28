import SiteChrome from "@/components/SiteChrome";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await loadSiteContent();
  return <SiteChrome data={siteData}>{children}</SiteChrome>;
}

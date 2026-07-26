import type { Metadata } from "next";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import LocationSection from "@/components/LocationSection";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.location;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function LocationPage() {
  const data = await loadSiteContent();

  return (
    <>
      <BreadcrumbBar current="Location" />
      <LocationSection
        settings={data.generalSettings}
        footer={data.footer}
      />
    </>
  );
}

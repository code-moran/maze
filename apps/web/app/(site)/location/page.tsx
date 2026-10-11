import type { Metadata } from "next";
import LocationSection from "@/components/LocationSection";
import PageHero from "@/components/PageHero";
import { loadSiteContent } from "@/lib/content/loadSiteContent";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.location;
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: "/location",
    image: data.heroBackgrounds[0],
  });
}

export default async function LocationPage() {
  const data = await loadSiteContent();
  const background = data.heroBackgrounds[0] || "";

  return (
    <>
      <PageHero
        label="FIND US"
        title="Our Office & Location"
        subtitle={data.generalSettings.location || "Visit our physical store and service center."}
        backgroundImage={background}
        crumbs={[{ label: "Location" }]}
      />
      <LocationSection
        settings={data.generalSettings}
        footer={data.footer}
      />
    </>
  );
}

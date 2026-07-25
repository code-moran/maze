import type { Metadata } from "next";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import ServicesSection from "@/components/ServicesSection";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.services;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function ServicesPage() {
  const data = await loadSiteContent();

  return (
    <>
      <BreadcrumbBar current="Installation Services" />
      <ServicesSection
        intro={data.sections.servicesIntro}
        charges={data.serviceCharges}
      />
    </>
  );
}

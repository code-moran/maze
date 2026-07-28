import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ServicesSection from "@/components/ServicesSection";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

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
  const intro = data.sections.servicesIntro;
  const background = data.heroBackgrounds[1] || data.heroBackgrounds[0] || "";

  return (
    <>
      <PageHero
        label={intro.label || "OUR SERVICES"}
        title={intro.title || "Professional Installation & Setup"}
        subtitle={intro.subtitle}
        backgroundImage={background}
        crumbs={[{ label: "Services" }]}
        ctas={[
          { href: "/contact", label: "Request Installation" },
          { href: "/products", label: "Browse Products", outline: true },
        ]}
      />
      <ServicesSection
        intro={intro}
        charges={data.serviceCharges}
      />
    </>
  );
}

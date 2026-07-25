import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.about;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function AboutPage() {
  const data = await loadSiteContent();

  return (
    <>
      <BreadcrumbBar current="About" />
      <AboutSection
        intro={data.sections.aboutIntro}
        images={data.aboutImages}
      />
    </>
  );
}

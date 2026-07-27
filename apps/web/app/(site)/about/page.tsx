import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";
import PageHero from "@/components/PageHero";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

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
  const intro = data.sections.aboutIntro;
  const background = data.aboutImages[0] || data.heroBackgrounds[0] || "";

  return (
    <>
      <PageHero
        label={intro.label || "ABOUT MAZE"}
        title={intro.title || "About Maze Technologies"}
        subtitle={intro.paragraphOne}
        backgroundImage={background}
        crumbs={[{ label: "About" }]}
        ctas={[
          { href: "/products", label: "View Our Products" },
          { href: "/contact", label: "Get In Touch", outline: true },
        ]}
      />
      <AboutSection
        intro={intro}
        images={data.aboutImages}
      />
    </>
  );
}

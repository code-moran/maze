import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.contact;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function ContactPage() {
  const data = await loadSiteContent();
  const intro = data.sections.contactIntro;
  const background = data.heroBackgrounds[2] || data.heroBackgrounds[0] || "";

  return (
    <>
      <PageHero
        label={intro.label || "GET IN TOUCH"}
        title={intro.title || "Contact Our Support & Sales Team"}
        subtitle={intro.subtitle}
        backgroundImage={background}
        crumbs={[{ label: "Contact" }]}
      />
      <ContactForm
        intro={intro}
        settings={data.generalSettings}
      />
    </>
  );
}

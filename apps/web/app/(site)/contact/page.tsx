import type { Metadata } from "next";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import ContactForm from "@/components/ContactForm";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";

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

  return (
    <>
      <BreadcrumbBar current="Contact" />
      <ContactForm
        intro={data.sections.contactIntro}
        settings={data.generalSettings}
      />
    </>
  );
}

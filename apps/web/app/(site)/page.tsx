import type { Metadata } from "next";
import { Suspense } from "react";
import AboutSection from "@/components/AboutSection";
import BlogGrid from "@/components/BlogGrid";
import CtaBanner from "@/components/CtaBanner";
import HeroCarousel from "@/components/HeroCarousel";
import ProductsBrowser from "@/components/ProductsBrowser";
import ServicesSection from "@/components/ServicesSection";
import StatsBar from "@/components/StatsBar";
import Testimonials from "@/components/Testimonials";
import WhyChoose from "@/components/WhyChoose";
import { loadSiteContent } from "@/lib/content/loadSiteContent";
import {
  jsonLdScript,
  organizationJsonLd,
  siteMetaFromContent,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const meta = siteMetaFromContent(data);
  return {
    ...meta,
    title: data.siteMeta.ogTitle || meta.title,
    openGraph: {
      ...meta.openGraph,
      title: data.siteMeta.ogTitle || data.siteMeta.title,
      description: data.siteMeta.ogDescription || data.siteMeta.description,
    },
  };
}

export default async function HomePage() {
  const data = await loadSiteContent();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd(data))}
      />
      <HeroCarousel
        slides={data.sections.heroSlides}
        backgrounds={data.heroBackgrounds}
      />
      <StatsBar stats={data.stats} />
      <Suspense fallback={null}>
        <ProductsBrowser data={data} preview />
      </Suspense>
      <ServicesSection
        intro={data.sections.servicesIntro}
        charges={data.serviceCharges}
        teaser
      />
      <WhyChoose items={data.whyChoose} />
      <AboutSection
        intro={data.sections.aboutIntro}
        images={data.aboutImages}
        teaser
      />
      <Testimonials items={data.testimonials} />
      <BlogGrid posts={data.blogs} teaser limit={3} />
      <CtaBanner cta={data.cta} whatsapp={data.generalSettings.whatsapp} />
    </>
  );
}

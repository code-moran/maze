import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import ProductsBrowser from "@/components/ProductsBrowser";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.products;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function ProductsPage() {
  const data = await loadSiteContent();
  const intro = data.sections.productsIntro;
  const background =
    data.heroBackgrounds?.[0] ||
    data.products.find((p) => p.imgs?.[0])?.imgs?.[0] ||
    "";

  return (
    <>
      <PageHero
        label={intro.label}
        title={intro.title}
        subtitle={intro.subtitle}
        backgroundImage={background}
        crumbs={[{ label: "Products" }]}
        ctas={[
          { href: "/contact", label: "Request a Quote" },
          { href: "/services", label: "Installation", outline: true },
        ]}
      />
      <Suspense fallback={null}>
        <ProductsBrowser data={data} hideIntro />
      </Suspense>
    </>
  );
}

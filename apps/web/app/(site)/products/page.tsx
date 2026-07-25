import type { Metadata } from "next";
import { Suspense } from "react";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import ProductsBrowser from "@/components/ProductsBrowser";
import { loadSiteContent } from "@/lib/sanity/loadSiteContent";

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

  return (
    <>
      <BreadcrumbBar current="Products" />
      <Suspense fallback={null}>
        <ProductsBrowser data={data} />
      </Suspense>
    </>
  );
}

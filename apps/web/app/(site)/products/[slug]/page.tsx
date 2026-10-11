import { notFound, redirect } from "next/navigation";
import {
  getProductBySlug,
  getProductCategories,
  getProductHref,
  normalizeCategorySlug,
} from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const data = await loadSiteContent();
  return data.products.map((product) => ({
    slug: product.slug || String(product.id),
  }));
}

export default async function LegacyProductRedirectPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadSiteContent();

  const categories = getProductCategories(data);
  if (categories.some((c) => c.id === slug)) {
    redirect(`/${normalizeCategorySlug(slug)}`);
  }

  const product = getProductBySlug(slug, data);
  if (!product) notFound();

  redirect(getProductHref(product));
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProductDetailView from "@/components/ProductDetailView";
import { getProductBySlug, getProductSlug, getProductCategories } from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const data = await loadSiteContent();
  return data.products.map((product) => ({
    slug: getProductSlug(product),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSiteContent();

  const categories = getProductCategories(data);
  if (categories.some((c) => c.id === slug)) {
    const categorySeo = data.categorySeo[slug];
    return {
      title: categorySeo?.title ? `${categorySeo.title} | Maze` : "Product Category | Maze",
    };
  }

  const product = getProductBySlug(slug, data);

  if (!product) {
    return {
      title: "Product Not Found | Maze",
    };
  }

  return {
    title: product.seoTitle || `${product.name} | Maze`,
    description: product.seoDescription || product.shortDesc,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDesc,
      images: product.imgs?.[0] ? [{ url: product.imgs[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadSiteContent();

  const categories = getProductCategories(data);
  if (categories.some((c) => c.id === slug)) {
    redirect(`/products/category/${slug}`);
  }

  const product = getProductBySlug(slug, data);

  if (!product) {
    notFound();
  }

  const relatedProducts = data.products
    .filter((item) => item.cat === product.cat && item.id !== product.id)
    .slice(0, 3);

  const heroBackground =
    product.imgs[0] ||
    data.heroBackgrounds?.[0] ||
    "";

  return (
    <>
      <PageHero
        label={product.catLabel}
        title={product.name}
        subtitle={product.shortDesc}
        backgroundImage={heroBackground}
        crumbs={[
          { label: "Products", href: "/products" },
          { label: product.catLabel, href: `/products/category/${product.cat}` },
          { label: product.name },
        ]}
        ctas={[
          { href: "/contact", label: "Request a Quote" },
          { href: "/services", label: "Installation Services", outline: true },
        ]}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}

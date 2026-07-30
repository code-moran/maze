import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProductsBrowser from "@/components/ProductsBrowser";
import { getProductCategories } from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const data = await loadSiteContent();
  const categories = getProductCategories(data);
  return categories.map((cat) => ({
    slug: cat.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSiteContent();
  const categorySeo = data.categorySeo[slug];
  const categories = getProductCategories(data);
  const category = categories.find((c) => c.id === slug);

  if (!category && !categorySeo) {
    return {
      title: "Category Not Found | Maze Technologies",
    };
  }

  const title =
    categorySeo?.metaTitle ||
    categorySeo?.title ||
    category?.label ||
    `${slug} Products`;
  const description =
    categorySeo?.metaDescription ||
    categorySeo?.description ||
    `Browse ${title} at Maze Technologies. Premium quality products with professional installation services in Nairobi, Kenya.`;

  return buildPageMetadata({
    title: `${title} | Maze Technologies`,
    description,
    path: `/products/category/${slug}`,
    image: data.sections.productsIntro.heroBackground || data.heroBackgrounds[0],
  });
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadSiteContent();
  const categorySeo = data.categorySeo[slug];
  const categories = getProductCategories(data);
  const category = categories.find((c) => c.id === slug);

  if (!category && !categorySeo) {
    notFound();
  }

  const categoryTitle = categorySeo?.title || category?.label || slug;
  const categoryDescription =
    categorySeo?.description ||
    category?.description ||
    `Explore our range of high-performance ${categoryTitle.toLowerCase()}.`;

  const categoryProducts = data.products.filter((p) => p.cat === slug);

  const heroBackground =
    categoryProducts.find((p) => p.imgs?.[0])?.imgs?.[0] ||
    data.sections.productsIntro.heroBackground ||
    data.heroBackgrounds?.[0] ||
    "";

  return (
    <>
      <PageHero
        label="Product Category"
        title={categoryTitle}
        subtitle={categoryDescription}
        backgroundImage={heroBackground}
        crumbs={[
          { label: "Products", href: "/products" },
          { label: categoryTitle },
        ]}
        ctas={[
          { href: "/contact", label: "Request a Quote" },
          { href: "/services", label: "Installation Services", outline: true },
        ]}
      />
      <ProductsBrowser data={data} initialCategory={slug} hideIntro />
    </>
  );
}

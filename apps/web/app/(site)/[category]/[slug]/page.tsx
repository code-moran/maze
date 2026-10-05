import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProductDetailView from "@/components/ProductDetailView";
import ProductsBrowser from "@/components/ProductsBrowser";
import {
  getProductByCategoryAndSlug,
  getProductCategories,
  getProductSlug,
  normalizeCategorySlug,
} from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";
import {
  buildPageMetadata,
  jsonLdScript,
  productJsonLd,
} from "@/lib/seo";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  const data = await loadSiteContent();
  const params: { category: string; slug: string }[] = [];

  // Add all products
  for (const product of data.products) {
    const cat = normalizeCategorySlug(product.cat);
    const slug = getProductSlug(product);
    params.push({ category: cat, slug });
    if (product.cat !== cat) {
      params.push({ category: product.cat, slug });
    }
  }

  // Add all subcategories
  for (const [catKey, subList] of Object.entries(data.subProducts || {})) {
    const cat = normalizeCategorySlug(catKey);
    for (const sub of subList) {
      params.push({ category: cat, slug: sub.id });
      if (catKey !== cat) {
        params.push({ category: catKey, slug: sub.id });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: rawCategory, slug } = await params;
  const data = await loadSiteContent();
  const category = normalizeCategorySlug(rawCategory);

  const product = getProductByCategoryAndSlug(category, slug, data);
  if (product) {
    const canonicalPath = `/${category}/${getProductSlug(product)}`;
    return buildPageMetadata({
      title: product.seoTitle || `${product.name} | Maze`,
      description: product.seoDescription || product.shortDesc,
      path: canonicalPath,
      image: product.imgs?.[0],
    });
  }

  const subItems = data.subProducts[category] || [];
  const subItem = subItems.find(
    (s) => s.id === slug || s.id.toLowerCase() === slug.toLowerCase()
  );
  if (subItem) {
    const categorySeo = data.categorySeo[category];
    const catTitle = categorySeo?.title || category;
    const title = `${subItem.label} | ${catTitle}`;
    const description = `Shop high quality ${subItem.label.toLowerCase()} in Nairobi, Kenya. Professional installation and warranty included.`;
    return buildPageMetadata({
      title: `${title} | Maze Technologies`,
      description,
      path: `/${category}/${subItem.id}`,
      image:
        data.sections.productsIntro.heroBackground || data.heroBackgrounds[0],
    });
  }

  return {
    title: "Not Found | Maze Technologies",
  };
}

export default async function CategorySubOrProductDetailPage({
  params,
}: Props) {
  const { category: rawCategory, slug } = await params;
  const data = await loadSiteContent();
  const category = normalizeCategorySlug(rawCategory);

  // 1. Check if slug matches a product
  const product = getProductByCategoryAndSlug(category, slug, data);
  if (product) {
    const relatedProducts = data.products
      .filter(
        (item) =>
          normalizeCategorySlug(item.cat) === category &&
          item.id !== product.id
      )
      .slice(0, 3);

    const heroBackground =
      product.imgs[0] || data.heroBackgrounds?.[0] || "";
    const canonicalPath = `/${category}/${getProductSlug(product)}`;

    const crumbs: { label: string; href?: string }[] = [
      { label: "Products", href: "/products" },
      {
        label: product.catLabel,
        href: `/${category}`,
      },
    ];

    if (
      product.subCat &&
      product.subCat !== product.cat &&
      product.subCat !== getProductSlug(product)
    ) {
      const subItems = data.subProducts[category] || [];
      const sub = subItems.find((s) => s.id === product.subCat);
      if (sub) {
        crumbs.push({
          label: sub.label,
          href: `/${category}/${sub.id}`,
        });
      }
    }

    crumbs.push({ label: product.name });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(
            productJsonLd(product, canonicalPath)
          )}
        />
        <PageHero
          label={product.catLabel}
          title={product.name}
          subtitle={product.shortDesc}
          backgroundImage={heroBackground}
          crumbs={crumbs}
          ctas={[
            { href: "/contact", label: "Request a Quote" },
            { href: "/services", label: "Installation Services", outline: true },
          ]}
        />
        <ProductDetailView
          product={product}
          relatedProducts={relatedProducts}
        />
      </>
    );
  }

  // 2. Check if slug matches a subcategory
  const subItems = data.subProducts[category] || [];
  const subItem = subItems.find(
    (s) => s.id === slug || s.id.toLowerCase() === slug.toLowerCase()
  );

  if (subItem) {
    const categorySeo = data.categorySeo[category];
    const categories = getProductCategories(data);
    const catObj = categories.find((c) => c.id === category);
    const catTitle = categorySeo?.title || catObj?.label || category;

    const subCategoryProducts = data.products.filter(
      (p) =>
        normalizeCategorySlug(p.cat) === category && p.subCat === subItem.id
    );

    const heroBackground =
      subCategoryProducts.find((p) => p.imgs?.[0])?.imgs?.[0] ||
      data.sections.productsIntro.heroBackground ||
      data.heroBackgrounds?.[0] ||
      "";

    return (
      <>
        <PageHero
          label={catTitle}
          title={subItem.label}
          subtitle={`Explore our selection of ${subItem.label.toLowerCase()} built for reliability and performance.`}
          backgroundImage={heroBackground}
          crumbs={[
            { label: "Products", href: "/products" },
            { label: catTitle, href: `/${category}` },
            { label: subItem.label },
          ]}
          ctas={[
            { href: "/contact", label: "Request a Quote" },
            { href: "/services", label: "Installation Services", outline: true },
          ]}
        />
        <Suspense
          fallback={<div className="container py-5">Loading products…</div>}
        >
          <ProductsBrowser
            data={data}
            initialCategory={category}
            initialSubCategory={subItem.id}
            hideIntro
          />
        </Suspense>
      </>
    );
  }

  // 3. Not found
  notFound();
}

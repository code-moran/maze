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

function ProductsSkeleton() {
  return (
    <section className="py-5" style={{ background: "#fafffe" }}>
      <div className="container">
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="placeholder-glow"
              style={{ width: 120, height: 38, borderRadius: 20 }}
            >
              <span className="placeholder w-100 h-100 rounded-pill d-inline-block" />
            </div>
          ))}
        </div>
        <div className="row g-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-6 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                <div
                  className="placeholder-glow"
                  style={{ height: 180, background: "#f3f7f3" }}
                >
                  <span className="placeholder w-100 h-100 d-block" />
                </div>
                <div className="card-body">
                  <span className="placeholder col-4 mb-2 rounded" />
                  <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-8" />
                  </h5>
                  <p className="card-text placeholder-glow">
                    <span className="placeholder col-11" />
                    <span className="placeholder col-7" />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function ProductsPage() {
  const data = await loadSiteContent();
  const intro = data.sections.productsIntro;
  const background =
    intro.heroBackground ||
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
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsBrowser data={data} hideIntro />
      </Suspense>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getProductCategories } from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  return {
    title: "Product Categories | Maze Technologies",
    description:
      "Explore all product categories at Maze Technologies: TV Wall Mounts, Fridge & AC Guards, Solar Lights, and Extension Cables.",
  };
}

export default async function ProductCategoriesPage() {
  const data = await loadSiteContent();
  const categories = getProductCategories(data);
  const intro = data.sections.productsIntro;

  const background =
    intro.heroBackground ||
    data.heroBackgrounds?.[0] ||
    "";

  return (
    <>
      <PageHero
        label="Product Showcase"
        title="Product Categories"
        subtitle="Explore our specialized product categories engineered for performance, safety, and durability."
        backgroundImage={background}
        crumbs={[
          { label: "Products", href: "/products" },
          { label: "Categories" },
        ]}
        ctas={[
          { href: "/contact", label: "Request a Quote" },
          { href: "/services", label: "Installation Services", outline: true },
        ]}
      />

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {categories.map((cat) => {
              const catProducts = data.products.filter((p) => p.cat === cat.id);
              const previewImg =
                catProducts.find((p) => p.imgs?.[0])?.imgs?.[0] || "";

              return (
                <div key={cat.id} className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden product-card">
                    {previewImg ? (
                      <div
                        className="ratio ratio-4x3 bg-white"
                        style={{ overflow: "hidden" }}
                      >
                        <img
                          src={previewImg}
                          alt={cat.label}
                          style={{ objectFit: "contain", padding: "1.5rem" }}
                        />
                      </div>
                    ) : (
                      <div
                        className="ratio ratio-4x3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                      >
                        <i className={`bi ${cat.icon} display-3 text-success`}></i>
                      </div>
                    )}
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className={`bi ${cat.icon} text-success fs-5`}></i>
                        <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                          {catProducts.length} Products
                        </span>
                      </div>
                      <h4 className="h5 fw-bold mb-2">{cat.label}</h4>
                      <p className="small text-secondary flex-grow-1 mb-3">
                        {cat.description ||
                          `Explore high-grade ${cat.label.toLowerCase()} tailored for home and enterprise installations.`}
                      </p>
                      <Link
                        href={`/products/category/${cat.id}`}
                        className="btn btn-maze btn-sm w-100"
                      >
                        Browse {cat.label} <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

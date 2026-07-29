"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductCategories, getProductSlug } from "@/data/siteData";
import type { Product, SiteData } from "@/data/types";
import ProductRequestModal from "@/components/ProductRequestModal";

const PER_PAGE = 8;

type Props = {
  data: SiteData;
  preview?: boolean;
  hideIntro?: boolean;
  initialCategory?: string;
};

function setDocumentMeta(title?: string, description?: string) {
  if (typeof document === "undefined") return;
  if (title) document.title = title;
  if (description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }
}

export default function ProductsBrowser({
  data,
  preview = false,
  hideIntro = false,
  initialCategory,
}: Props) {
  const router = useRouter();

  const [currentFilter, setCurrentFilter] = useState(initialCategory || "all");
  const [currentSubFilter, setCurrentSubFilter] = useState("all");
  const [displayedCount, setDisplayedCount] = useState(PER_PAGE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mainImg, setMainImg] = useState("");
  const [requestModalState, setRequestModalState] = useState<{
    isOpen: boolean;
    type: "QUOTE" | "INSTALLATION";
  }>({
    isOpen: false,
    type: "QUOTE",
  });

  const products = data.products;
  const categories = getProductCategories(data);
  const intro = data.sections.productsIntro;

  const applyListingMeta = useCallback(
    (cat: string) => {
      if (preview) return;
      if (cat === "all") {
        const seo = data.sectionSeo.products;
        setDocumentMeta(
          seo?.title || data.siteMeta.title,
          seo?.description || data.siteMeta.description
        );
        return;
      }
      const category = data.categorySeo[cat];
      setDocumentMeta(
        category?.metaTitle || category?.title || data.siteMeta.title,
        category?.metaDescription ||
          category?.description ||
          data.siteMeta.description
      );
    },
    [data.categorySeo, data.sectionSeo.products, data.siteMeta, preview]
  );

  const openProduct = useCallback(
    (id: number) => {
      const product = products.find((item) => item.id === id);
      if (!product) return;
      setSelectedProduct(product);
      setMainImg(product.imgs[0] || "");
      if (product.seoTitle || product.seoDescription) {
        setDocumentMeta(
          product.seoTitle || product.name,
          product.seoDescription || product.shortDesc
        );
      }
    },
    [products]
  );

  useEffect(() => {
    if (selectedProduct && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (preview || typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("cat") || initialCategory || "all";
      const subcat = params.get("subcat") || "all";
      const productParam = params.get("product");

      setCurrentFilter(cat);
      setCurrentSubFilter(subcat);
      setDisplayedCount(PER_PAGE);

      if (productParam) {
        const id = Number(productParam);
        if (!Number.isNaN(id)) openProduct(id);
      } else {
        applyListingMeta(cat);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [preview, initialCategory, openProduct, applyListingMeta]);

  const filtered = useMemo(() => {
    if (currentFilter === "all") return products;
    let list = products.filter((p) => p.cat === currentFilter);
    if (currentSubFilter !== "all") {
      list = list.filter((p) => p.subCat === currentSubFilter);
    }
    return list;
  }, [products, currentFilter, currentSubFilter]);

  const titleText = useMemo(() => {
    if (currentFilter === "all") return intro.title;
    return data.categorySeo[currentFilter]?.title || intro.title;
  }, [currentFilter, data.categorySeo, intro.title]);

  const subtitleText = useMemo(() => {
    if (currentFilter === "all") {
      return "Choose TV Wall Mounts, Guards, Solar Outdoor Lights, or Extension Cables to view the products inside.";
    }
    if (currentSubFilter === "all") {
      return "Select a sub product to view the items inside this category.";
    }
    return (
      data.categorySeo[currentFilter]?.description || intro.subtitle
    );
  }, [currentFilter, currentSubFilter, data.categorySeo, intro.subtitle]);

  const scrollToGrid = () => {
    if (typeof window !== "undefined") {
      const grid = document.getElementById("productsGridWrap") || document.getElementById("products");
      grid?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filterProducts = (cat: string) => {
    setCurrentFilter(cat);
    setCurrentSubFilter("all");
    setDisplayedCount(PER_PAGE);
    applyListingMeta(cat);
    if (!preview && typeof window !== "undefined") {
      const url =
        cat === "all"
          ? "/products"
          : `/products/category/${encodeURIComponent(cat)}`;
      window.history.pushState(null, "", url);
    }
    scrollToGrid();
  };

  const filterSubCategory = (subCatId: string) => {
    const nextSub = subCatId || "all";
    setCurrentSubFilter(nextSub);
    setDisplayedCount(PER_PAGE);
    if (!preview && typeof window !== "undefined") {
      const url =
        nextSub === "all"
          ? `/products?cat=${encodeURIComponent(currentFilter)}`
          : `/products?cat=${encodeURIComponent(currentFilter)}&subcat=${encodeURIComponent(nextSub)}`;
      window.history.pushState(null, "", url);
    }
    scrollToGrid();
  };

  const goToContact = () => {
    const modalEl = document.getElementById("productModal");
    const navigate = () => router.push("/contact");

    if (modalEl && modalEl.classList.contains("show") && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl);
      const handleHidden = () => {
        modalEl.removeEventListener("hidden.bs.modal", handleHidden);
        navigate();
      };
      modalEl.addEventListener("hidden.bs.modal", handleHidden);
      instance?.hide();
    } else {
      navigate();
    }
  };

  const showSidebar = !preview && currentFilter !== "all";

  const subItems =
    currentFilter !== "all"
      ? data.subProducts[currentFilter] || []
      : [];

  const categoryProducts =
    currentFilter !== "all"
      ? products.filter((p) => p.cat === currentFilter)
      : [];

  const visibleProducts = filtered.slice(0, displayedCount);
  const related = selectedProduct
    ? products
        .filter(
          (item) =>
            item.cat === selectedProduct.cat && item.id !== selectedProduct.id
        )
        .slice(0, 3)
    : [];

  return (
    <section id="products" className="py-5" style={{ background: "#fafffe" }}>
      <div className="container">
        {hideIntro && !preview ? null : (
          <div className="text-center mb-4">
            <p className="section-label">{intro.label}</p>
            <h2 className="section-title">
              {preview ? intro.title : titleText}
            </h2>
            <div className="divider-green mx-auto"></div>
            <p className="section-sub">
              {preview ? intro.subtitle : subtitleText}
            </p>
          </div>
        )}
        <div
          className="d-flex flex-wrap justify-content-center gap-2 mb-4"
          id="catFilters"
        >
          <Link
            href="/products"
            className={`cat-pill text-decoration-none${
              !preview && currentFilter === "all" ? " active" : ""
            }`}
          >
            <i className="bi bi-grid-fill me-1"></i>
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products/category/${encodeURIComponent(cat.id)}`}
              className={`cat-pill text-decoration-none${
                !preview && currentFilter === cat.id ? " active" : ""
              }`}
            >
              <i className={`bi ${cat.icon} me-1`}></i>
              {cat.label}
            </Link>
          ))}
        </div>

        <div className="row g-4 align-items-start">
          <div
            className={`col-12 col-lg-3${showSidebar ? "" : " d-none"}`}
            id="subCatPanel"
          >
            <div className="subcat-sidebar">
              <h5 className="fw-bold mb-3">
                {data.categorySeo[currentFilter]?.title || "Sub Products"}
              </h5>
              <div id="subCatFilters">
                <Link
                  href={`/products/category/${encodeURIComponent(currentFilter)}`}
                  className={`subcat-pill text-decoration-none d-flex justify-content-between align-items-center${
                    currentSubFilter === "all" ? " active" : ""
                  }`}
                >
                  <span>All Sub Products</span>
                  <span className="subcat-count">{categoryProducts.length}</span>
                </Link>
                {subItems.map((item) => {
                  const count = categoryProducts.filter(
                    (p) => p.subCat === item.id
                  ).length;
                  return (
                    <Link
                      key={item.id}
                      href={`/products/category/${encodeURIComponent(currentFilter)}?subcat=${encodeURIComponent(item.id)}`}
                      className={`subcat-pill text-decoration-none d-flex justify-content-between align-items-center${
                        currentSubFilter === item.id ? " active" : ""
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="subcat-count">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className={showSidebar ? "col-12 col-lg-9" : "col-12"}
            id="productsGridWrap"
          >
            <div className="row g-4" id="productsGrid">
              {preview || currentFilter === "all" ? (
                categories.map((cat) => {
                  const categoryProductsList = products.filter(
                    (p) => p.cat === cat.id
                  );
                  const previewImage = categoryProductsList[0]?.imgs?.[0] || "";

                  const href = `/products/category/${cat.id}`;

                  return (
                    <div key={cat.id} className="col-md-6 col-xl-3">
                      <Link href={href} className="product-category-card text-decoration-none text-dark d-block h-100">
                        <div className="product-category-image">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt={cat.label}
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="card-body">
                          <span className="badge-cat mb-2 d-inline-block">
                            <i className={`bi ${cat.icon} me-1`}></i>
                            {cat.label}
                          </span>
                          <div className="card-title">{cat.label}</div>
                          <p className="card-text text-secondary small">
                            {cat.description}
                          </p>
                          <span className="btn btn-maze w-100 btn-sm text-white d-inline-flex align-items-center justify-content-center">
                            View Products{" "}
                            <i className="bi bi-arrow-right ms-1"></i>
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : visibleProducts.length === 0 ? (
                <div className="col-12">
                  <div className="empty-state">No products found.</div>
                </div>
              ) : (
                visibleProducts.map((product) => {
                  const slug = getProductSlug(product);
                  return (
                    <div key={product.id} className="col-6 col-md-6 col-lg-4">
                      <Link
                        href={`/products/${slug}`}
                        className="text-decoration-none text-dark d-block h-100"
                      >
                        <div className="product-card h-100">
                          <div className="card-img-wrap">
                            <img
                              src={product.imgs[0]}
                              alt={product.name}
                              loading="lazy"
                            />
                          </div>
                          <div className="card-body">
                            <span className="badge-cat mb-2 d-inline-block">
                              {product.catLabel}
                            </span>
                            <div className="card-title">{product.name}</div>
                            <p className="card-text">{product.shortDesc}</p>
                            <span className="btn btn-maze w-100 btn-sm">
                              View Details{" "}
                              <i className="bi bi-arrow-right ms-1"></i>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            {!preview &&
            currentFilter !== "all" &&
            displayedCount < filtered.length ? (
              <div className="text-center mt-4">
                <button
                  className="btn btn-maze-outline"
                  type="button"
                  onClick={() =>
                    setDisplayedCount((count) => count + PER_PAGE)
                  }
                >
                  Load More Products <i className="bi bi-arrow-down ms-1"></i>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedProduct ? (
        <div
          className="modal fade show d-block"
          id="productModal"
          tabIndex={-1}
          style={{
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 1080,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "1rem 0.5rem",
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              <div className="modal-header border-0 pb-0 bg-light p-3 d-flex align-items-center justify-content-between">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0 small">
                    <li className="breadcrumb-item">
                      <Link href="/" className="text-success">
                        Home
                      </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link href="/products" className="text-success">
                        Products
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">
                      {selectedProduct?.catLabel || "Category"}
                    </li>
                  </ol>
                </nav>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedProduct(null)}
                ></button>
              </div>
              <div className="modal-body p-4 pt-2">
                <div className="row g-4">
                  <div className="col-md-5">
                    <img
                      src={mainImg}
                      alt={selectedProduct.name}
                      className="modal-main-img mb-2"
                    />
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedProduct.imgs.map((img, index) => (
                        <img
                          key={img + index}
                          src={img}
                          className={`modal-gallery-thumb${
                            mainImg === img ? " active" : ""
                          }`}
                          onClick={() => setMainImg(img)}
                          alt={`${selectedProduct.name} view ${index + 1}`}
                          role="button"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col-md-7">
                    <span
                      className="badge mb-2"
                      style={{
                        background: "var(--maze-green-light)",
                        color: "var(--maze-green)",
                        fontSize: ".8rem",
                      }}
                    >
                      {selectedProduct.catLabel}
                    </span>
                    <h4 className="fw-bold">{selectedProduct.name}</h4>
                    <p className="text-secondary">{selectedProduct.desc}</p>
                    <h6 className="fw-bold mt-3 mb-2">Specifications</h6>
                    <table className="table table-sm spec-table">
                      <tbody>
                        {selectedProduct.specs.map((spec) => (
                          <tr key={spec[0]}>
                            <td>{spec[0]}</td>
                            <td>{spec[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <h6 className="fw-bold mt-3 mb-2">Key Features</h6>
                    <ul className="small text-secondary ps-3">
                      {selectedProduct.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    {/* Request Quote / Installation Action Buttons */}
                    <div className="p-3 bg-light rounded border mt-3">
                      <div className="d-flex flex-wrap gap-2">
                        <Link
                          href={`/request?type=QUOTE&product=${encodeURIComponent(selectedProduct.name)}&cat=${encodeURIComponent(selectedProduct.catLabel)}`}
                          className="btn btn-maze btn-sm px-3 text-white text-decoration-none"
                        >
                          <i className="bi bi-calculator me-1 text-white"></i>Request Quote
                        </Link>
                        <Link
                          href={`/request?type=INSTALLATION&product=${encodeURIComponent(selectedProduct.name)}&cat=${encodeURIComponent(selectedProduct.catLabel)}`}
                          className="btn btn-maze-outline btn-sm px-3 text-decoration-none"
                        >
                          <i className="bi bi-tools me-1"></i>Request Installation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <h5 className="fw-bold mb-3">Related Products</h5>
                <div className="row g-3">
                  {related.map((item) => (
                    <div key={item.id} className="col-4">
                      <div
                        className="product-card"
                        onClick={() => openProduct(item.id)}
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                      >
                        <div
                          className="card-img-wrap"
                          style={{ height: 100 }}
                        >
                          <img
                            src={item.imgs[0]}
                            alt={item.name}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="card-body p-2">
                          <div style={{ fontSize: ".82rem", fontWeight: 600 }}>
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ProductRequestModal
        isOpen={requestModalState.isOpen}
        onClose={() => setRequestModalState((prev) => ({ ...prev, isOpen: false }))}
        productName={selectedProduct?.name}
        catLabel={selectedProduct?.catLabel}
        defaultType={requestModalState.type}
      />
    </section>
  );
}

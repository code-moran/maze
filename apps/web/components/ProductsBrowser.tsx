"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductCategories } from "@/data/siteData";
import type { Product, SiteData } from "@/data/types";

const PER_PAGE = 8;

type Props = {
  data: SiteData;
  preview?: boolean;
  hideIntro?: boolean;
};

export default function ProductsBrowser({
  data,
  preview = false,
  hideIntro = false,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCat = searchParams.get("cat") || "all";
  const productParam = searchParams.get("product");

  const [currentFilter, setCurrentFilter] = useState(
    preview ? "all" : initialCat
  );
  const [currentSubFilter, setCurrentSubFilter] = useState("all");
  const [displayedCount, setDisplayedCount] = useState(PER_PAGE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mainImg, setMainImg] = useState("");

  const products = data.products;
  const categories = getProductCategories(data);
  const intro = data.sections.productsIntro;

  useEffect(() => {
    if (preview) return;
    const cat = searchParams.get("cat") || "all";
    setCurrentFilter(cat);
    setCurrentSubFilter("all");
    setDisplayedCount(PER_PAGE);
  }, [searchParams, preview]);

  const openProduct = useCallback(
    (id: number) => {
      const product = products.find((item) => item.id === id);
      if (!product) return;
      setSelectedProduct(product);
      setMainImg(product.imgs[0] || "");
      requestAnimationFrame(() => {
        const el = document.getElementById("productModal");
        if (el && window.bootstrap?.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(el).show();
        }
      });
    },
    [products]
  );

  useEffect(() => {
    if (preview || !productParam) return;
    const id = Number(productParam);
    if (!Number.isNaN(id)) openProduct(id);
  }, [productParam, preview, openProduct]);

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

  const filterProducts = (cat: string) => {
    setCurrentFilter(cat);
    setCurrentSubFilter("all");
    setDisplayedCount(PER_PAGE);
    if (!preview) {
      const url =
        cat === "all" ? "/products" : `/products?cat=${encodeURIComponent(cat)}`;
      router.replace(url, { scroll: false });
    }
  };

  const filterSubCategory = (subCatId: string) => {
    setCurrentSubFilter(subCatId || "all");
    setDisplayedCount(PER_PAGE);
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

  const showSidebar =
    !preview &&
    currentFilter !== "all" &&
    currentSubFilter !== "all";

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
          {categories.map((cat) => (
            <span
              key={cat.id}
              className={`cat-pill${
                !preview && currentFilter === cat.id ? " active" : ""
              }`}
              onClick={() => {
                if (preview) {
                  router.push(`/products?cat=${encodeURIComponent(cat.id)}`);
                } else {
                  filterProducts(cat.id);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (preview) {
                  router.push(`/products?cat=${encodeURIComponent(cat.id)}`);
                } else {
                  filterProducts(cat.id);
                }
              }}
            >
              <i className={`bi ${cat.icon} me-1`}></i>
              {cat.label}
            </span>
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
                <span
                  className={`subcat-pill${
                    currentSubFilter === "all" ? " active" : ""
                  }`}
                  onClick={() => filterSubCategory("all")}
                  role="button"
                  tabIndex={0}
                >
                  <span>All Sub Products</span>
                  <span className="subcat-count">{categoryProducts.length}</span>
                </span>
                {subItems.map((item) => {
                  const count = categoryProducts.filter(
                    (p) => p.subCat === item.id
                  ).length;
                  return (
                    <span
                      key={item.id}
                      className={`subcat-pill${
                        currentSubFilter === item.id ? " active" : ""
                      }`}
                      onClick={() => filterSubCategory(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <span>{item.label}</span>
                      <span className="subcat-count">{count}</span>
                    </span>
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

                  const href = `/products?cat=${cat.id}`;
                  const goToCategory = () => {
                    if (preview) router.push(href);
                    else filterProducts(cat.id);
                  };

                  return (
                    <div key={cat.id} className="col-md-6 col-xl-3">
                      {preview ? (
                        <Link href={href} className="product-category-card text-decoration-none text-dark d-block">
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
                            <span className="btn btn-maze w-100 btn-sm">
                              View Products{" "}
                              <i className="bi bi-arrow-right ms-1"></i>
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div
                          className="product-category-card"
                          onClick={goToCategory}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") goToCategory();
                          }}
                        >
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
                            <button
                              className="btn btn-maze w-100 btn-sm"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToCategory();
                              }}
                            >
                              View Products{" "}
                              <i className="bi bi-arrow-right ms-1"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : currentSubFilter === "all" ? (
                <div className="col-12">
                  <div className="subproduct-browser">
                    <div className="subproduct-browser-title">
                      {data.categorySeo[currentFilter]?.title || "Sub Products"}
                    </div>
                    <div className="subproduct-browser-list">
                      {subItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="subproduct-browser-link"
                          onClick={() => filterSubCategory(item.id)}
                        >
                          <i className="bi bi-caret-right-fill"></i>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className="col-12">
                  <div className="empty-state">No products found.</div>
                </div>
              ) : (
                visibleProducts.map((product) => (
                  <div key={product.id} className="col-sm-6 col-lg-3">
                    <div
                      className="product-card h-100"
                      onClick={() => openProduct(product.id)}
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                    >
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
                        <button
                          className="btn btn-maze w-100 btn-sm"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProduct(product.id);
                          }}
                        >
                          View Details{" "}
                          <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!preview &&
            currentFilter !== "all" &&
            currentSubFilter !== "all" &&
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

      <div className="modal fade" id="productModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div
            className="modal-content"
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <div className="modal-header border-0 pb-0">
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
                data-bs-dismiss="modal"
              ></button>
            </div>
            {selectedProduct ? (
              <div className="modal-body pt-2">
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
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-maze"
                        onClick={goToContact}
                      >
                        <i className="bi bi-tools me-2"></i>Request Installation
                      </button>
                      <button
                        type="button"
                        className="btn btn-maze-outline"
                        onClick={goToContact}
                      >
                        <i className="bi bi-chat-dots me-2"></i>Enquire Now
                      </button>
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
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

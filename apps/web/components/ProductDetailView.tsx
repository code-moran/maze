"use client";

import Link from "next/link";
import { useState } from "react";
import { getProductSlug } from "@/data/siteData";
import type { Product } from "@/data/types";
import ProductInlineRequestForm from "@/components/ProductInlineRequestForm";

type Props = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductDetailView({ product, relatedProducts }: Props) {
  const [mainImg, setMainImg] = useState(product.imgs[0] || "");

  return (
    <section className="py-5" style={{ background: "#fafffe" }}>
      <div className="container">
        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle mb-5">
          <div className="row g-4 align-items-start">
            {/* Image Gallery Column */}
            <div className="col-lg-5">
              <div
                className="modal-main-img mb-3 shadow-sm overflow-hidden rounded-3 border"
                style={{ height: 360, background: "#f8fbf8" }}
              >
                <img
                  src={mainImg || product.imgs[0]}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              {product.imgs.length > 1 ? (
                <div className="d-flex gap-2 flex-wrap">
                  {product.imgs.map((img, index) => (
                    <img
                      key={img + index}
                      src={img}
                      className={`modal-gallery-thumb${
                        (mainImg || product.imgs[0]) === img ? " active" : ""
                      }`}
                      onClick={() => setMainImg(img)}
                      alt={`${product.name} view ${index + 1}`}
                      role="button"
                      style={{
                        width: 76,
                        height: 76,
                        objectFit: "cover",
                        borderRadius: 8,
                        cursor: "pointer",
                        border:
                          (mainImg || product.imgs[0]) === img
                            ? "2px solid var(--maze-green)"
                            : "2px solid transparent",
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Details Column */}
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge"
                  style={{
                    background: "var(--maze-green-light)",
                    color: "var(--maze-green)",
                    fontSize: ".82rem",
                    padding: "6px 12px",
                    fontWeight: 700,
                  }}
                >
                  {product.catLabel}
                </span>
              </div>

              <h1 className="fw-bold h2 mb-3 text-dark">{product.name}</h1>
              <p className="lead text-secondary fs-6 mb-4">{product.desc}</p>

              {/* Specs Table */}
              {product.specs?.length ? (
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase small tracking-wide text-dark mb-2">
                    <i className="bi bi-sliders me-2 text-success"></i>
                    Specifications
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-striped spec-table border align-middle mb-0">
                      <tbody>
                        {product.specs.map((spec) => (
                          <tr key={spec[0]}>
                            <td className="fw-semibold text-secondary" style={{ width: "35%" }}>
                              {spec[0]}
                            </td>
                            <td className="fw-medium text-dark">{spec[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* Key Features */}
              {product.features?.length ? (
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase small tracking-wide text-dark mb-2">
                    <i className="bi bi-check-circle-fill me-2 text-success"></i>
                    Key Features
                  </h6>
                  <ul className="list-unstyled row g-2 small text-secondary mb-0">
                    {product.features.map((feature) => (
                      <li key={feature} className="col-12 col-md-6 d-flex align-items-start gap-2">
                        <i className="bi bi-check2 text-success fw-bold"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Inline Request Form */}
              <ProductInlineRequestForm
                productName={product.name}
                catLabel={product.catLabel}
                defaultType="QUOTE"
              />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="fw-bold h4 mb-0">Related Products</h3>
              <Link href={`/products?cat=${product.cat}`} className="text-success text-decoration-none fw-semibold small">
                View All in {product.catLabel} <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="row g-4">
              {relatedProducts.map((item) => {
                const itemSlug = getProductSlug(item);
                return (
                  <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                    <Link
                      href={`/products/${itemSlug}`}
                      className="text-decoration-none text-dark d-block h-100"
                    >
                      <div className="product-card h-100 shadow-sm border rounded-3 overflow-hidden">
                        <div className="card-img-wrap" style={{ height: 180 }}>
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
                        <div className="card-body p-3">
                          <span className="badge-cat mb-2 d-inline-block">
                            {item.catLabel}
                          </span>
                          <h5 className="card-title fs-6 fw-bold mb-1">
                            {item.name}
                          </h5>
                          <p className="card-text text-secondary small mb-2 line-clamp-2">
                            {item.shortDesc}
                          </p>
                          <span className="btn btn-maze-outline w-100 btn-sm mt-2">
                            View Details <i className="bi bi-arrow-right ms-1"></i>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

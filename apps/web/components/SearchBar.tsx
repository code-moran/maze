"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/types";

export default function SearchBar({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const matches =
    query.trim().length < 2
      ? []
      : products
          .filter(
            (product) =>
              product.name.toLowerCase().includes(query.trim().toLowerCase()) ||
              product.catLabel
                .toLowerCase()
                .includes(query.trim().toLowerCase()) ||
              product.shortDesc
                .toLowerCase()
                .includes(query.trim().toLowerCase())
          )
          .slice(0, 6);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const goToProduct = (id: number) => {
    setOpen(false);
    setQuery("");
    router.push(`/products?product=${id}`);
  };

  const doSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = products.find(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.catLabel.toLowerCase().includes(q)
    );
    if (match) goToProduct(match.id);
  };

  return (
    <div className="search-bar-wrap">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-7 col-lg-6 position-relative" ref={wrapRef}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="searchInput"
                placeholder="Search products, categories..."
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
                onFocus={() => setOpen(true)}
              />
              <button className="btn" type="button" onClick={doSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
            <div
              id="searchResults"
              style={{
                display: open && query.trim().length >= 2 ? "block" : "none",
              }}
            >
              {matches.length === 0 ? (
                <div className="p-3 text-secondary small">
                  No products found for &quot;{query.trim()}&quot;
                </div>
              ) : (
                matches.map((product) => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => goToProduct(product.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") goToProduct(product.id);
                    }}
                  >
                    <img src={product.imgs[0]} alt={product.name} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: ".9rem" }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: ".78rem", color: "#777" }}>
                        {product.catLabel}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

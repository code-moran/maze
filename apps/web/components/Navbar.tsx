"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getProductCategories,
  telHref,
} from "@/data/siteData";
import type { SiteData } from "@/data/types";

export default function Navbar({ data }: { data: SiteData }) {
  const pathname = usePathname();
  const categories = getProductCategories(data);
  const phone = data.generalSettings.phone;

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const closeMenu = () => {
    setMenuOpen(false);
    setAboutOpen(false);
    setProductsOpen(false);
  };

  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close drawer after route changes
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.body.classList.add("mobile-menu-open");
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top" id="mainNav">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <img
              src="/images/logo-wordmark.png"
              alt="Maze"
              className="brand-logo"
            />
          </Link>
          <button
            className="navbar-toggler border-0 d-lg-none"
            type="button"
            aria-controls="mobileMenu"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i
              className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-4`}
              style={{ color: "var(--maze-green)" }}
            ></i>
          </button>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto align-items-center gap-1">
              <li className="nav-item">
                <Link
                  className={`nav-link${isActive("/") && pathname === "/" ? " active" : ""}`}
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className={`nav-link dropdown-toggle${
                    ["/about", "/blog", "/location"].some((p) =>
                      pathname.startsWith(p)
                    )
                      ? " active"
                      : ""
                  }`}
                  href="#"
                  data-bs-toggle="dropdown"
                >
                  About Us
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" href="/about">
                      <i className="bi bi-building me-2 text-success"></i>
                      About Maze
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/blog">
                      <i className="bi bi-newspaper me-2 text-success"></i>
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/location">
                      <i className="bi bi-geo-alt me-2 text-success"></i>
                      Location
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className={`nav-link dropdown-toggle${
                    isActive("/products") ? " active" : ""
                  }`}
                  href="#"
                  data-bs-toggle="dropdown"
                >
                  Products
                </a>
                <div className="dropdown-menu mega-menu p-0 overflow-hidden">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?cat=${cat.id}`}
                      className="dropdown-item products-menu-item"
                    >
                      <i className={`bi ${cat.icon} text-success`}></i>
                      <span>{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link${isActive("/services") ? " active" : ""}`}
                  href="/services"
                >
                  Installation Services
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link${isActive("/contact") ? " active" : ""}`}
                  href="/contact"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {menuOpen ? (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        ></button>
      ) : null}

      <aside
        id="mobileMenu"
        className={`mobile-menu-drawer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        aria-labelledby="mobileMenuLabel"
      >
        <div className="mobile-menu-header">
          <img
            src="/images/logo-icon.png"
            alt="Maze"
            className="brand-logo-icon"
            id="mobileMenuLabel"
          />
          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Close"
            onClick={closeMenu}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="mobile-menu-body" aria-label="Mobile">
          <a href="/" className="mobile-menu-link" onClick={closeMenu}>
            Home
          </a>

          <button
            type="button"
            className={`mobile-menu-toggle${aboutOpen ? " is-open" : ""}`}
            aria-expanded={aboutOpen}
            onClick={() => {
              setAboutOpen((open) => !open);
              setProductsOpen(false);
            }}
          >
            About Us
            <i className="bi bi-chevron-down"></i>
          </button>
          {aboutOpen ? (
            <div className="mobile-menu-sub">
              <a href="/about" onClick={closeMenu}>
                About Maze
              </a>
              <a href="/blog" onClick={closeMenu}>
                Blog
              </a>
              <a href="/location" onClick={closeMenu}>
                Location
              </a>
            </div>
          ) : null}

          <button
            type="button"
            className={`mobile-menu-toggle${productsOpen ? " is-open" : ""}`}
            aria-expanded={productsOpen}
            onClick={() => {
              setProductsOpen((open) => !open);
              setAboutOpen(false);
            }}
          >
            Products
            <i className="bi bi-chevron-down"></i>
          </button>
          {productsOpen ? (
            <div className="mobile-menu-sub">
              <a href="/products" onClick={closeMenu}>
                All Products
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?cat=${cat.id}`}
                  onClick={closeMenu}
                >
                  {cat.label}
                </a>
              ))}
            </div>
          ) : null}

          <a href="/services" className="mobile-menu-link" onClick={closeMenu}>
            Installation Services
          </a>
          <a href="/contact" className="mobile-menu-link" onClick={closeMenu}>
            Contact Us
          </a>

          <div className="mobile-menu-cta">
            <a href={telHref(phone)} className="btn btn-maze w-100">
              <i className="bi bi-telephone-fill me-2"></i>
              {phone}
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}

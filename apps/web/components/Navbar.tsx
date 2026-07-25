"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  getProductCategories,
  telHref,
} from "@/data/siteData";
import type { SiteData } from "@/data/types";

/**
 * Mobile nav uses a native checkbox + labels so it opens even if React
 * hydration is delayed/broken on a phone. React only enhances close-on-route.
 */
export default function Navbar({ data }: { data: SiteData }) {
  const pathname = usePathname();
  const categories = getProductCategories(data);
  const phone = data.generalSettings.phone;
  const reactId = useId().replace(/:/g, "");
  const menuId = `maze-mobile-nav-${reactId}`;
  const aboutId = `maze-mobile-about-${reactId}`;
  const productsId = `maze-mobile-products-${reactId}`;
  const checkRef = useRef<HTMLInputElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const closeMenu = () => {
    if (checkRef.current) checkRef.current.checked = false;
    const about = document.getElementById(aboutId) as HTMLInputElement | null;
    const products = document.getElementById(
      productsId
    ) as HTMLInputElement | null;
    if (about) about.checked = false;
    if (products) products.checked = false;
  };

  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

          <label
            htmlFor={menuId}
            className="mobile-menu-toggler d-lg-none"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list mobile-menu-icon-open fs-4" aria-hidden />
            <i className="bi bi-x-lg mobile-menu-icon-close fs-4" aria-hidden />
          </label>

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

      {/* Checkbox siblings drive open/close with pure CSS (no React required). */}
      <input
        ref={checkRef}
        id={menuId}
        type="checkbox"
        className="mobile-nav-check"
        aria-controls="mobileMenu"
      />
      <label
        htmlFor={menuId}
        className="mobile-menu-backdrop"
        aria-label="Close menu"
      />
      <aside id="mobileMenu" className="mobile-menu-drawer" aria-label="Mobile">
        <div className="mobile-menu-header">
          <img
            src="/images/logo-icon.png"
            alt="Maze"
            className="brand-logo-icon"
          />
          <label
            htmlFor={menuId}
            className="mobile-menu-close"
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </label>
        </div>

        <nav className="mobile-menu-body">
          <a href="/" className="mobile-menu-link" onClick={closeMenu}>
            Home
          </a>

          <input
            id={aboutId}
            type="checkbox"
            className="mobile-submenu-check"
          />
          <label htmlFor={aboutId} className="mobile-menu-toggle">
            About Us
            <i className="bi bi-chevron-down"></i>
          </label>
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

          <input
            id={productsId}
            type="checkbox"
            className="mobile-submenu-check"
          />
          <label htmlFor={productsId} className="mobile-menu-toggle">
            Products
            <i className="bi bi-chevron-down"></i>
          </label>
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

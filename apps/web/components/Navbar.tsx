"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getProductCategories,
  telHref,
} from "@/data/siteData";
import type { SiteData } from "@/data/types";

function closeMobileMenu() {
  const el = document.getElementById("mobileMenu");
  if (!el || !window.bootstrap?.Offcanvas) return;
  window.bootstrap.Offcanvas.getOrCreateInstance(el).hide();
}

export default function Navbar({ data }: { data: SiteData }) {
  const pathname = usePathname();
  const categories = getProductCategories(data);
  const phone = data.generalSettings.phone;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
            aria-label="Toggle navigation"
          >
            <i
              className="bi bi-list fs-4"
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

      <div
        className="offcanvas offcanvas-start"
        id="mobileMenu"
        tabIndex={-1}
        aria-labelledby="mobileMenuLabel"
      >
        <div
          className="offcanvas-header"
          style={{ background: "var(--maze-green)" }}
        >
          <img
            src="/images/logo-icon.png"
            alt="Maze"
            className="brand-logo-icon"
            id="mobileMenuLabel"
          />
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body p-0">
          <Link
            href="/"
            className="d-block px-4 py-3 text-decoration-none text-dark fw-500 border-bottom"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <div className="accordion accordion-flush" id="mobileAccordion">
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mc1"
                  aria-expanded="false"
                  aria-controls="mc1"
                >
                  About Us
                </button>
              </h2>
              <div
                id="mc1"
                className="accordion-collapse collapse"
                data-bs-parent="#mobileAccordion"
              >
                <div className="accordion-body py-0">
                  <Link
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="/about"
                    onClick={closeMobileMenu}
                  >
                    About Maze
                  </Link>
                  <Link
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="/blog"
                    onClick={closeMobileMenu}
                  >
                    Blog
                  </Link>
                  <Link
                    className="d-block py-2 ps-3 text-decoration-none text-dark"
                    href="/location"
                    onClick={closeMobileMenu}
                  >
                    Location
                  </Link>
                </div>
              </div>
            </div>
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mc2"
                  aria-expanded="false"
                  aria-controls="mc2"
                >
                  Products
                </button>
              </h2>
              <div
                id="mc2"
                className="accordion-collapse collapse"
                data-bs-parent="#mobileAccordion"
              >
                <div className="accordion-body py-0">
                  <Link
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="/products"
                    onClick={closeMobileMenu}
                  >
                    All Products
                  </Link>
                  {categories.map((cat, index) => (
                    <Link
                      key={cat.id}
                      className={`d-block py-2 ps-3 text-decoration-none text-dark${
                        index < categories.length - 1 ? " border-bottom" : ""
                      }`}
                      href={`/products?cat=${cat.id}`}
                      onClick={closeMobileMenu}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link
            href="/services"
            className="d-block px-4 py-3 border-top text-decoration-none text-dark fw-500"
            onClick={closeMobileMenu}
          >
            Installation Services
          </Link>
          <Link
            href="/contact"
            className="d-block px-4 py-3 border-top text-decoration-none text-dark fw-500"
            onClick={closeMobileMenu}
          >
            Contact Us
          </Link>
          <div className="px-4 pt-3 pb-4">
            <a href={telHref(phone)} className="btn btn-maze w-100">
              <i className="bi bi-telephone-fill me-2"></i>
              {phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

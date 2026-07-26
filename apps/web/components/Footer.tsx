import Link from "next/link";
import {
  getProductCategories,
  telHref,
} from "@/data/siteData";
import type { SiteData } from "@/data/types";

export default function Footer({ data }: { data: SiteData }) {
  const { generalSettings, footer } = data;
  const categories = getProductCategories(data);
  const enabledSocial = (generalSettings.socialLinks || []).filter(
    (item) => item.enabled && (item.url || item.handle)
  );

  return (
    <footer>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <img
              src="/images/logo-wordmark.png"
              alt="Maze"
              className="footer-brand-logo mb-2"
            />
            <p className="small mb-3" style={{ color: "#888" }}>
              {footer.blurb}
            </p>
            <div className="d-flex gap-2">
              {enabledSocial.map((item) => (
                <a
                  key={item.platform}
                  href={item.url || "#"}
                  className="social-btn"
                  aria-label={item.platform}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`bi bi-${item.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          <div className="col-6 col-md-2">
            <h5>Products</h5>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?cat=${cat.id}`}>
                {cat.id === "solar" ? "Solar Lights" : cat.label}
              </Link>
            ))}
          </div>
          <div className="col-6 col-md-2">
            <h5>Company</h5>
            <Link href="/about">About Maze</Link>
            <Link href="/services">Our Services</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/location">Location</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin">Dashboard</Link>
          </div>
          <div className="col-md-4">
            <h5>Contact Info</h5>
            <p className="small footer-contact-item">
              <i className="bi bi-geo-alt text-success"></i>
              <span>{generalSettings.location}</span>
            </p>
            <p className="small footer-contact-item">
              <i className="bi bi-telephone text-success"></i>
              <a href={telHref(generalSettings.phone)}>
                {generalSettings.phone}
              </a>
            </p>
            <p className="small footer-contact-item">
              <i className="bi bi-envelope text-success"></i>
              <a href={`mailto:${generalSettings.email}`}>
                {generalSettings.email}
              </a>
            </p>
            <p className="small footer-contact-item">
              <i className="bi bi-clock text-success"></i>
              <span>{footer.hours}</span>
            </p>
          </div>
        </div>
        <div className="footer-bottom text-center">
          <span>{footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}

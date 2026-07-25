"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { HeroSlide } from "@/data/types";

const GRADIENTS = [
  "linear-gradient(135deg,#003300 0%,#005500 60%,#007700 100%)",
  "linear-gradient(135deg,#002200 0%,#004400 60%,#006600 100%)",
  "linear-gradient(135deg,#001800 0%,#003300 60%,#005500 100%)",
];

const CTAS = [
  [
    { href: "/products", label: "View Products", outline: false },
    { href: "/services", label: "Request Installation", outline: true },
  ],
  [
    { href: "/products?cat=solar", label: "Shop Solar Lights", outline: false },
    { href: "/contact", label: "Contact Us", outline: true },
  ],
  [
    { href: "/services", label: "Our Services", outline: false },
    { href: "/contact", label: "Get a Quote", outline: true },
  ],
];

export default function HeroCarousel({
  slides,
  backgrounds,
}: {
  slides: HeroSlide[];
  backgrounds: string[];
}) {
  useEffect(() => {
    const el = document.getElementById("heroCarousel");
    if (!el || !window.bootstrap?.Carousel) return;
    const carousel = window.bootstrap.Carousel.getOrCreateInstance(el, {
      interval: 5000,
      ride: "carousel",
      pause: false,
      wrap: true,
      touch: true,
    });
    carousel.cycle();
  }, []);

  return (
    <section id="home" className="hero-section">
      <div
        id="heroCarousel"
        className="carousel slide hero-carousel"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : undefined}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-item${index === 0 ? " active" : ""}`}
              style={{ background: GRADIENTS[index] || GRADIENTS[0] }}
            >
              <div
                className="hero-bg"
                style={{
                  backgroundImage: `url('${backgrounds[index] || backgrounds[0]}')`,
                }}
                aria-hidden="true"
              ></div>
              <div className="hero-overlay"></div>
              <div className="hero-caption">
                <div className={index === 0 ? "fade-up" : undefined}>
                  <span
                    className="badge mb-3"
                    style={{
                      background: "rgba(255,255,255,.15)",
                      color: "#c8f5c8",
                      fontSize: ".8rem",
                      padding: "6px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    {slide.badge}
                  </span>
                  <h1 dangerouslySetInnerHTML={{ __html: slide.title }} />
                  <p>{slide.description}</p>
                  <div className="d-flex flex-wrap gap-2 hero-actions">
                    {(CTAS[index] || CTAS[0]).map((cta) => (
                      <Link
                        key={cta.label}
                        href={cta.href}
                        className={
                          cta.outline
                            ? "btn btn-maze-outline"
                            : "btn btn-maze"
                        }
                        style={
                          cta.outline
                            ? { borderColor: "#c8f5c8", color: "#c8f5c8" }
                            : undefined
                        }
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

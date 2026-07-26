"use client";

import { FormEvent, useState } from "react";
import { showToast } from "@/components/Toast";
import { telHref, whatsappLink } from "@/data/siteData";
import type { ContactIntro, GeneralSettings } from "@/data/types";

export default function ContactForm({
  intro,
  settings,
}: {
  intro: ContactIntro;
  settings: GeneralSettings;
}) {
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const enabledSocial = (settings.socialLinks || []).filter(
    (item) => item.enabled && (item.url || item.handle)
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      company: String(formData.get("company") || "").trim(),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
      form.reset();
      showToast("Message sent successfully.");
    } catch {
      showToast("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-5" style={{ background: "var(--gray-light)" }}>
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">{intro.label}</p>
          <h2 className="section-title">{intro.title}</h2>
          <div className="divider-green mx-auto"></div>
          <p className="section-sub">{intro.subtitle}</p>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-lg-7">
            <div className="contact-card">
              <form id="contactForm" onSubmit={onSubmit} style={{ position: "relative" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-500 small">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g. John Kamau"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-500 small">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="+254 7XX XXX XXX"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-500 small">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-500 small">Subject *</label>
                    <select className="form-select" name="subject" required>
                      <option value="">Select a subject...</option>
                      <option>Product Enquiry</option>
                      <option>Installation Quote</option>
                      <option>After-Sales Support</option>
                      <option>Partnership / Bulk Order</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-500 small">Message *</label>
                    <textarea
                      className="form-control"
                      name="message"
                      rows={4}
                      placeholder="Tell us what you need..."
                      required
                    ></textarea>
                  </div>
                  <div
                    className="col-12"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-10000px",
                      height: 0,
                      overflow: "hidden",
                    }}
                  >
                    <label htmlFor="company">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-maze w-100 py-2"
                      disabled={submitting}
                    >
                      <i className="bi bi-send me-2"></i>
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </form>
              <div
                id="contactAlert"
                className={`alert alert-success mt-3${success ? "" : " d-none"}`}
                role="alert"
              >
                <i className="bi bi-check-circle-fill me-2"></i>
                Thanks! We&apos;ve received your message and will respond shortly.
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3">
              <a
                href={whatsappLink(settings.whatsapp)}
                className="contact-card d-flex align-items-center gap-3 text-decoration-none"
                style={{ background: "#25d366" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-whatsapp text-white fs-2"></i>
                <div>
                  <div className="fw-bold text-white">WhatsApp Us</div>
                  <div className="text-white opacity-75 small">
                    {settings.whatsapp}
                  </div>
                </div>
              </a>
              <a
                href={telHref(settings.phone)}
                className="contact-card d-flex align-items-center gap-3 text-decoration-none"
                style={{ background: "var(--maze-green)" }}
              >
                <i className="bi bi-telephone-fill text-white fs-2"></i>
                <div>
                  <div className="fw-bold text-white">Call Us</div>
                  <div className="text-white opacity-75 small">
                    {settings.phone}
                  </div>
                </div>
              </a>
              <div className="contact-card">
                <h6 className="fw-bold mb-3">Follow Us</h6>
                <div className="d-flex gap-2 flex-wrap">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

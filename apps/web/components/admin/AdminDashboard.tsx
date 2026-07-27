"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteData } from "@/data/types";

type SectionId =
  | "overview"
  | "hero-manager"
  | "products-hero"
  | "general-settings"
  | "installation-charges"
  | "page-content"
  | "products-manager"
  | "subproducts-manager"
  | "inquiries-manager"
  | "blogs-manager"
  | "seo-manager";

const NAV: { id: SectionId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "bi-speedometer2" },
  { id: "hero-manager", label: "Home Hero", icon: "bi-images" },
  { id: "products-hero", label: "Products Hero", icon: "bi-card-image" },
  { id: "general-settings", label: "Settings", icon: "bi-sliders2-vertical" },
  { id: "installation-charges", label: "Charges", icon: "bi-cash-coin" },
  { id: "page-content", label: "Page Text", icon: "bi-layout-text-window-reverse" },
  { id: "products-manager", label: "Products", icon: "bi-box-seam" },
  { id: "subproducts-manager", label: "Sub Products", icon: "bi-diagram-3" },
  { id: "inquiries-manager", label: "Inquiries", icon: "bi-chat-dots" },
  { id: "blogs-manager", label: "Blogs", icon: "bi-journal-text" },
  { id: "seo-manager", label: "SEO", icon: "bi-search-heart" },
];

const SECTION_LABELS: Record<SectionId, string> = {
  overview: "Overview",
  "hero-manager": "Home Hero",
  "products-hero": "Products Hero",
  "general-settings": "Settings",
  "installation-charges": "Charges",
  "page-content": "Page Text",
  "products-manager": "Products",
  "subproducts-manager": "Sub Products",
  "inquiries-manager": "Inquiries",
  "blogs-manager": "Blogs",
  "seo-manager": "SEO",
};

function htmlToText(value: string) {
  return (value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

function textToHtml(value: string) {
  return (value || "").trim().replace(/\n/g, "<br>");
}

function ensureHeroSlides(
  slides: SiteData["sections"]["heroSlides"]
): SiteData["sections"]["heroSlides"] {
  return [0, 1, 2].map((i) => ({
    badge: slides[i]?.badge || "",
    title: slides[i]?.title || "",
    description: slides[i]?.description || "",
  }));
}

function ensureHeroBackgrounds(backgrounds: string[]): string[] {
  return [0, 1, 2].map((i) => backgrounds[i] || "");
}

type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

function formatSpecs(specs: string[][]): string {
  return (specs || []).map((s) => `${s[0]}: ${s[1]}`).join("\n");
}

function parseSpecs(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(":");
      const label = (parts.shift() || "").trim();
      const value = parts.join(":").trim();
      return [label, value];
    })
    .filter(([label, value]) => label && value);
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function sectionFromHash(): SectionId {
  if (typeof window === "undefined") return "overview";
  const hash = (window.location.hash || "#overview").replace("#", "") as SectionId;
  return SECTION_LABELS[hash] ? hash : "overview";
}

export default function AdminDashboard({
  initialData,
  databaseConfigured,
}: {
  initialData: SiteData;
  databaseConfigured: boolean;
}) {
  const [section, setSection] = useState<SectionId>("overview");
  const [data, setData] = useState<SiteData>(initialData);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [alert, setAlert] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeProductId, setActiveProductId] = useState<number | null>(
    initialData.products[0]?.id ?? null
  );
  const [activeBlogId, setActiveBlogId] = useState<number | null>(
    initialData.blogs[0]?.id ?? null
  );
  const [subCatKey, setSubCatKey] = useState("tv-mounts");

  const showAlert = useCallback((message: string) => {
    setAlert(message);
    window.setTimeout(() => setAlert(""), 2500);
  }, []);

  const goSection = useCallback((id: SectionId) => {
    setSection(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  useEffect(() => {
    const sync = () => setSection(sectionFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const reload = useCallback(async () => {
    const res = await fetch("/api/admin/content");
    if (!res.ok) return;
    const json = await res.json();
    if (json.data) setData(json.data);
  }, []);

  const loadEnquiries = useCallback(async () => {
    const res = await fetch("/api/admin/enquiries");
    if (!res.ok) return;
    const json = await res.json();
    setEnquiries(json.enquiries || []);
  }, []);

  useEffect(() => {
    if (section === "inquiries-manager" || section === "overview") {
      loadEnquiries();
    }
  }, [section, loadEnquiries]);

  async function api(
    url: string,
    method: string,
    body?: unknown
  ): Promise<boolean> {
    setSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) {
        showAlert(json.error || "Save failed");
        return false;
      }
      showAlert("Saved successfully");
      await reload();
      return true;
    } catch {
      showAlert("Network error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  const activeProduct = useMemo(
    () => data.products.find((p) => p.id === activeProductId) || null,
    [data.products, activeProductId]
  );
  const activeBlog = useMemo(
    () => data.blogs.find((b) => b.id === activeBlogId) || null,
    [data.blogs, activeBlogId]
  );

  const seoCount =
    1 +
    Object.keys(data.sectionSeo || {}).length +
    Object.keys(data.categorySeo || {}).length +
    data.products.filter((p) => p.seoTitle || p.seoDescription).length;

  return (
    <>
      <div className="topbar d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <span>
              <i className="bi bi-shield-lock-fill me-1"></i>Content Dashboard
            </span>
            <span>
              <i className="bi bi-database-fill me-1"></i>
              {databaseConfigured
                ? "Postgres-backed thin CMS"
                : "JSON fallback — set DATABASE_URL to persist"}
            </span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Link href="/" className="text-white-50">
              View Website
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg sticky-top" id="mainNav">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <img
              src="/images/logo-wordmark.png"
              alt="Maze"
              className="brand-logo"
            />
          </Link>
          <div className="ms-auto d-flex align-items-center gap-2">
            <Link href="/studio" className="btn btn-maze-outline btn-sm">
              <i className="bi bi-database me-1"></i>Sanity Studio
            </Link>
            <Link href="/" className="btn btn-maze-outline btn-sm">
              <i className="bi bi-globe me-1"></i>View Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="breadcrumb-bar">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb maze-breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Website</Link>
              </li>
              <li className="breadcrumb-item">
                <a href="#overview" onClick={() => goSection("overview")}>
                  Dashboard
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {SECTION_LABELS[section]}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="dashboard-hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <p
                className="section-label text-white mb-2"
                style={{ letterSpacing: "3px" }}
              >
                MazeTech Admin
              </p>
              <h1>Website Dashboard</h1>
              <p className="mb-0 text-white-50">
                Manage home page text, product images and descriptions,
                inquiries, and meta SEO details from one place.
              </p>
            </div>
            <div className="col-lg-4">
              <div className="dashboard-note">
                {databaseConfigured
                  ? "Changes save to Postgres and update the public site after refresh (or within ~60s ISR)."
                  : "DATABASE_URL is unset. The site still serves default JSON until Postgres is configured."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-5">
        <div className="container">
          {alert ? (
            <div className="alert alert-success mb-4" role="alert">
              {alert}
            </div>
          ) : null}

          <div className="row g-4">
            <div className="col-lg-3">
              <div className="dashboard-nav">
                {NAV.map((item) => (
                  <a
                    key={item.id}
                    className={`nav-link${section === item.id ? " active" : ""}`}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goSection(item.id);
                    }}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="col-lg-9">
              {section === "overview" ? (
                <section id="overview" className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="dashboard-stat">
                        <div className="value">{data.products.length}</div>
                        <div className="label">Products Managed</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="dashboard-stat">
                        <div className="value">{enquiries.length}</div>
                        <div className="label">Saved Inquiries</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="dashboard-stat">
                        <div className="value">{seoCount}</div>
                        <div className="label">SEO Records</div>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-panel mt-4">
                    <h3>Quick jumps</h3>
                    <div className="d-flex flex-wrap gap-2">
                      {NAV.filter((n) => n.id !== "overview").map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="btn btn-maze-outline btn-sm"
                          onClick={() => goSection(n.id)}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              {section === "hero-manager" ? (
                <HeroPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/pages", "PUT", {
                      section: "home",
                      ...payload,
                    })
                  }
                />
              ) : null}

              {section === "products-hero" ? (
                <ProductsHeroPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/pages", "PUT", {
                      section: "products",
                      ...payload,
                    })
                  }
                />
              ) : null}

              {section === "general-settings" ? (
                <SettingsPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/settings", "PUT", payload)
                  }
                />
              ) : null}

              {section === "installation-charges" ? (
                <ChargesPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/pages", "PUT", {
                      section: "charges",
                      ...payload,
                    })
                  }
                />
              ) : null}

              {section === "page-content" ? (
                <PagesPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) => api("/api/admin/pages", "PUT", payload)}
                />
              ) : null}

              {section === "products-manager" ? (
                <ProductsPanel
                  data={data}
                  saving={saving}
                  activeProduct={activeProduct}
                  setActiveProductId={setActiveProductId}
                  onSaveProduct={async (product, isNew) => {
                    const ok = await api(
                      "/api/admin/products",
                      isNew ? "POST" : "PUT",
                      product
                    );
                    if (ok && isNew) setActiveProductId(null);
                  }}
                  onDelete={async (id) => {
                    const ok = await api(
                      `/api/admin/products?id=${id}`,
                      "DELETE"
                    );
                    if (ok) setActiveProductId(null);
                  }}
                />
              ) : null}

              {section === "subproducts-manager" ? (
                <SubProductsPanel
                  data={data}
                  categoryKey={subCatKey}
                  setCategoryKey={setSubCatKey}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/subproducts", "PUT", payload)
                  }
                />
              ) : null}

              {section === "blogs-manager" ? (
                <BlogsPanel
                  data={data}
                  saving={saving}
                  activeBlog={activeBlog}
                  setActiveBlogId={setActiveBlogId}
                  onSaveBlog={async (blog, isNew) => {
                    const ok = await api(
                      "/api/admin/blogs",
                      isNew ? "POST" : "PUT",
                      blog
                    );
                    if (ok && isNew) setActiveBlogId(null);
                  }}
                  onDelete={async (id) => {
                    const ok = await api(`/api/admin/blogs?id=${id}`, "DELETE");
                    if (ok) setActiveBlogId(null);
                  }}
                />
              ) : null}

              {section === "seo-manager" ? (
                <SeoPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) => api("/api/admin/seo", "PUT", payload)}
                  onOpenProduct={(id) => {
                    setActiveProductId(id);
                    goSection("products-manager");
                  }}
                />
              ) : null}

              {section === "inquiries-manager" ? (
                <InquiriesPanel
                  enquiries={enquiries}
                  onRefresh={loadEnquiries}
                  onStatus={async (id, status) => {
                    await api("/api/admin/enquiries", "PATCH", { id, status });
                    await loadEnquiries();
                  }}
                  onDelete={async (id) => {
                    await api(`/api/admin/enquiries?id=${id}`, "DELETE");
                    await loadEnquiries();
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function HeroPanel({
  data,
  saving,
  onSave,
}: {
  data: SiteData;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const [slides, setSlides] = useState(() =>
    ensureHeroSlides(data.sections.heroSlides).map((slide) => ({
      ...slide,
      title: htmlToText(slide.title),
    }))
  );
  const [backgrounds, setBackgrounds] = useState(() =>
    ensureHeroBackgrounds(data.heroBackgrounds)
  );

  useEffect(() => {
    setSlides(
      ensureHeroSlides(data.sections.heroSlides).map((slide) => ({
        ...slide,
        title: htmlToText(slide.title),
      }))
    );
    setBackgrounds(ensureHeroBackgrounds(data.heroBackgrounds));
  }, [data.sections.heroSlides, data.heroBackgrounds]);

  const updateSlide = (
    index: number,
    key: "badge" | "title" | "description",
    value: string
  ) => {
    const next = [...slides];
    next[index] = { ...next[index], [key]: value };
    setSlides(next);
  };

  const updateBackground = (index: number, value: string) => {
    const next = [...backgrounds];
    next[index] = value;
    setBackgrounds(next);
  };

  return (
    <section className="dashboard-panel mb-4">
      <h3>Home Hero</h3>
      <p className="small text-secondary mb-3">
        Edit the three homepage carousel slides. Use a line break in the title
        for a two-line headline. Backgrounds accept image URLs.
      </p>
      <form
        className="dashboard-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            heroSlides: slides.map((slide) => ({
              badge: slide.badge.trim(),
              title: textToHtml(slide.title),
              description: slide.description.trim(),
            })),
            stats: data.stats,
            cta: data.cta,
            heroBackgrounds: backgrounds.map(
              (url, i) => url.trim() || data.heroBackgrounds[i] || ""
            ),
            aboutImages: data.aboutImages,
          });
        }}
      >
        <div className="row g-4">
          {slides.map((slide, i) => (
            <div className="col-12" key={i}>
              <div className="dashboard-panel p-3 mb-0">
                <h5 className="h6 fw-bold mb-3">Slide {i + 1}</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Badge</label>
                    <input
                      className="form-control"
                      value={slide.badge}
                      onChange={(e) => updateSlide(i, "badge", e.target.value)}
                      placeholder="e.g. Premium TV Mounts"
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Title</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={slide.title}
                      onChange={(e) => updateSlide(i, "title", e.target.value)}
                      placeholder={"Mount Your TV\nLike a Pro"}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={slide.description}
                      onChange={(e) =>
                        updateSlide(i, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">
                      Background image URL
                    </label>
                    <input
                      className="form-control"
                      type="url"
                      value={backgrounds[i] || ""}
                      onChange={(e) => updateBackground(i, e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    {backgrounds[i] ? (
                      <img
                        src={backgrounds[i]}
                        alt={`Slide ${i + 1} preview`}
                        className="rounded w-100"
                        style={{
                          height: 72,
                          objectFit: "cover",
                          border: "1px solid #dce8dc",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded w-100 d-flex align-items-center justify-content-center small text-secondary"
                        style={{
                          height: 72,
                          background: "#f3f7f3",
                          border: "1px dashed #c5d6c5",
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="col-12">
            <button className="btn btn-maze" type="submit" disabled={saving}>
              <i className="bi bi-save me-2"></i>Save Hero
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function SettingsPanel({
  data,
  saving,
  onSave,
}: {
  data: SiteData;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const g = data.generalSettings;
  const f = data.footer;
  const [form, setForm] = useState({
    phone: g.phone,
    email: g.email,
    whatsapp: g.whatsapp,
    location: g.location,
    mapEmbed: g.mapEmbed,
    footerBlurb: f.blurb,
    hours: f.hours,
    businessHoursDetail: f.businessHoursDetail,
    copyright: f.copyright,
    socialLinks: g.socialLinks,
  });

  useEffect(() => {
    setForm({
      phone: g.phone,
      email: g.email,
      whatsapp: g.whatsapp,
      location: g.location,
      mapEmbed: g.mapEmbed,
      footerBlurb: f.blurb,
      hours: f.hours,
      businessHoursDetail: f.businessHoursDetail,
      copyright: f.copyright,
      socialLinks: g.socialLinks,
    });
  }, [g, f]);

  return (
    <section className="dashboard-panel mb-4">
      <h3>General Settings</h3>
      <form
        className="dashboard-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <div className="row g-3">
          {(
            [
              ["phone", "Phone"],
              ["email", "Email"],
              ["whatsapp", "WhatsApp"],
              ["location", "Location"],
              ["hours", "Hours (short)"],
              ["copyright", "Copyright"],
            ] as const
          ).map(([key, label]) => (
            <div className="col-md-6" key={key}>
              <label className="form-label small fw-semibold">{label}</label>
              <input
                className="form-control"
                value={String(form[key] || "")}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="col-12">
            <label className="form-label small fw-semibold">Map embed</label>
            <textarea
              className="form-control"
              value={form.mapEmbed}
              onChange={(e) => setForm({ ...form, mapEmbed: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Footer blurb</label>
            <textarea
              className="form-control"
              value={form.footerBlurb}
              onChange={(e) =>
                setForm({ ...form, footerBlurb: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">
              Business hours detail
            </label>
            <textarea
              className="form-control"
              value={form.businessHoursDetail}
              onChange={(e) =>
                setForm({ ...form, businessHoursDetail: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <button className="btn btn-maze" type="submit" disabled={saving}>
              <i className="bi bi-save me-2"></i>Save Settings
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function ChargesPanel({
  data,
  saving,
  onSave,
}: {
  data: SiteData;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const [tv, setTv] = useState(data.serviceCharges.tv);
  const [solar, setSolar] = useState(data.serviceCharges.solar);

  useEffect(() => {
    setTv(data.serviceCharges.tv);
    setSolar(data.serviceCharges.solar);
  }, [data.serviceCharges]);

  return (
    <section className="dashboard-panel mb-4">
      <h3>Installation Charges</h3>
      <form
        className="dashboard-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ tv, solar });
        }}
      >
        <div className="dashboard-table-wrap mb-3">
          <table className="table dashboard-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Enabled</th>
                <th>Amount label</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TV Mounting</td>
                <td>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={tv.enabled}
                    onChange={(e) =>
                      setTv({ ...tv, enabled: e.target.checked })
                    }
                  />
                </td>
                <td>
                  <input
                    className="form-control form-control-sm"
                    value={tv.amount}
                    onChange={(e) => setTv({ ...tv, amount: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Solar Installation</td>
                <td>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={solar.enabled}
                    onChange={(e) =>
                      setSolar({ ...solar, enabled: e.target.checked })
                    }
                  />
                </td>
                <td>
                  <input
                    className="form-control form-control-sm"
                    value={solar.amount}
                    onChange={(e) =>
                      setSolar({ ...solar, amount: e.target.value })
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold">
              TV description
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={tv.description}
              onChange={(e) => setTv({ ...tv, description: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold">
              Solar description
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={solar.description}
              onChange={(e) =>
                setSolar({ ...solar, description: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <button className="btn btn-maze" type="submit" disabled={saving}>
              <i className="bi bi-save me-2"></i>Save Charges
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function ProductsHeroPanel({
  data,
  saving,
  onSave,
}: {
  data: SiteData;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = useState(data.sections.productsIntro);

  useEffect(() => {
    setForm(data.sections.productsIntro);
  }, [data.sections.productsIntro]);

  return (
    <section className="dashboard-panel mb-4">
      <h3>Products Hero</h3>
      <p className="small text-secondary mb-3">
        Controls the banner at the top of the Products page — label, title,
        subtitle, and background image.
      </p>
      <form
        className="dashboard-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            label: form.label.trim(),
            title: form.title.trim(),
            subtitle: form.subtitle.trim(),
            heroBackground: form.heroBackground.trim(),
          });
        }}
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Label</label>
            <input
              className="form-control"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-semibold">Title</label>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Subtitle</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-semibold">
              Background image URL
            </label>
            <input
              className="form-control"
              type="url"
              value={form.heroBackground || ""}
              onChange={(e) =>
                setForm({ ...form, heroBackground: e.target.value })
              }
              placeholder="https://…"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            {form.heroBackground ? (
              <img
                src={form.heroBackground}
                alt="Products hero preview"
                className="rounded w-100"
                style={{
                  height: 72,
                  objectFit: "cover",
                  border: "1px solid #dce8dc",
                }}
              />
            ) : (
              <div
                className="rounded w-100 d-flex align-items-center justify-content-center small text-secondary"
                style={{
                  height: 72,
                  background: "#f3f7f3",
                  border: "1px dashed #c5d6c5",
                }}
              >
                No image
              </div>
            )}
          </div>
          <div className="col-12">
            <button className="btn btn-maze" type="submit" disabled={saving}>
              <i className="bi bi-save me-2"></i>Save Products Hero
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function PagesPanel({
  data,
  saving,
  onSave,
}: {
  data: SiteData;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const s = data.sections;
  const [services, setServices] = useState(s.servicesIntro);
  const [about, setAbout] = useState(s.aboutIntro);
  const [contact, setContact] = useState(s.contactIntro);

  useEffect(() => {
    setServices(s.servicesIntro);
    setAbout(s.aboutIntro);
    setContact(s.contactIntro);
  }, [s]);

  return (
    <section className="dashboard-panel mb-4">
      <h3>Page Text</h3>
      <p className="small text-secondary mb-3">
        Homepage and products banners are under <strong>Home Hero</strong> and{" "}
        <strong>Products Hero</strong> in the sidebar.
      </p>
      <form
        className="dashboard-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({ section: "services", ...services });
          await onSave({ section: "about", ...about });
          await onSave({ section: "contact", ...contact });
        }}
      >
        <div className="row g-3">
          {(
            [
              ["services", services, setServices],
              ["contact", contact, setContact],
            ] as const
          ).map(([name, value, setter]) => (
            <div className="col-12" key={name}>
              <h5 className="h6 fw-bold mt-2 text-capitalize">{name} intro</h5>
              <div className="row g-2">
                {(["label", "title", "subtitle"] as const).map((key) => (
                  <div
                    className={key === "subtitle" ? "col-12" : "col-md-6"}
                    key={key}
                  >
                    <label className="form-label small fw-semibold">{key}</label>
                    {key === "subtitle" ? (
                      <textarea
                        className="form-control"
                        value={value[key]}
                        onChange={(e) =>
                          setter({ ...value, [key]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        className="form-control"
                        value={value[key]}
                        onChange={(e) =>
                          setter({ ...value, [key]: e.target.value })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="col-12">
            <h5 className="h6 fw-bold mt-2">About intro</h5>
            <div className="row g-2">
              {(
                [
                  "label",
                  "title",
                  "paragraphOne",
                  "paragraphTwo",
                  "visionTitle",
                  "visionText",
                  "missionTitle",
                  "missionText",
                ] as const
              ).map((key) => (
                <div
                  className={
                    key.includes("paragraph") || key.includes("Text")
                      ? "col-12"
                      : "col-md-6"
                  }
                  key={key}
                >
                  <label className="form-label small fw-semibold">{key}</label>
                  {key.includes("paragraph") || key.includes("Text") ? (
                    <textarea
                      className="form-control"
                      value={about[key]}
                      onChange={(e) =>
                        setAbout({ ...about, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={about[key]}
                      onChange={(e) =>
                        setAbout({ ...about, [key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-12">
            <button className="btn btn-maze" type="submit" disabled={saving}>
              <i className="bi bi-save me-2"></i>Save Page Text
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function ProductsPanel({
  data,
  saving,
  activeProduct,
  setActiveProductId,
  onSaveProduct,
  onDelete,
}: {
  data: SiteData;
  saving: boolean;
  activeProduct: SiteData["products"][number] | null;
  setActiveProductId: (id: number | null) => void;
  onSaveProduct: (
    product: Record<string, unknown>,
    isNew: boolean
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const empty = {
    id: 0,
    slug: "",
    name: "",
    cat: "tv-mounts",
    catLabel: "TV Wall Mounts",
    subCat: "",
    shortDesc: "",
    desc: "",
    seoTitle: "",
    seoDescription: "",
    specs: [] as string[][],
    features: [] as string[],
    imgs: [] as string[],
  };
  const [form, setForm] = useState(activeProduct || empty);
  const isNew = !activeProduct;

  useEffect(() => {
    setForm(activeProduct || empty);
  }, [activeProduct]);

  const subs = data.subProducts[form.cat] || [];

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="mb-0">Products Manager</h3>
        <button
          className="btn btn-maze"
          type="button"
          onClick={() => setActiveProductId(null)}
        >
          <i className="bi bi-plus-lg me-2"></i>Add Product
        </button>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="dashboard-list">
            {data.products.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`dashboard-item w-100 text-start${
                  activeProduct?.id === p.id ? " active" : ""
                }`}
                onClick={() => setActiveProductId(p.id)}
              >
                <strong>{p.name}</strong>
                <div className="small text-secondary">
                  {p.catLabel || p.cat}
                  {p.seoTitle ? " · SEO set" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-8">
          <form
            className="dashboard-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSaveProduct(form, isNew);
            }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Name</label>
                <input
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Custom Slug (optional)
                </label>
                <input
                  className="form-control"
                  placeholder="e.g. full-motion-tv-wall-mount"
                  value={form.slug || ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={form.cat}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setForm({
                      ...form,
                      cat,
                      catLabel: data.categorySeo[cat]?.title || cat,
                      subCat: data.subProducts[cat]?.[0]?.id || "",
                    });
                  }}
                >
                  {Object.keys(data.categorySeo)
                    .filter((k) => k !== "all")
                    .map((k) => (
                      <option key={k} value={k}>
                        {data.categorySeo[k].title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Sub category
                </label>
                <select
                  className="form-select"
                  value={form.subCat}
                  onChange={(e) =>
                    setForm({ ...form, subCat: e.target.value })
                  }
                >
                  <option value="">Select…</option>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Image URLs (one per line)
                </label>
                <textarea
                  className="form-control"
                  value={(form.imgs || []).join("\n")}
                  onChange={(e) =>
                    setForm({ ...form, imgs: parseLines(e.target.value) })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Short description
                </label>
                <textarea
                  className="form-control"
                  required
                  value={form.shortDesc}
                  onChange={(e) =>
                    setForm({ ...form, shortDesc: e.target.value })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Full description
                </label>
                <textarea
                  className="form-control"
                  required
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">SEO Title</label>
                <input
                  className="form-control"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm({ ...form, seoTitle: e.target.value })
                  }
                  placeholder="Product page title for search engines"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  SEO Description
                </label>
                <textarea
                  className="form-control"
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm({ ...form, seoDescription: e.target.value })
                  }
                  placeholder="Meta description for this product"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Specifications
                </label>
                <textarea
                  className="form-control"
                  value={formatSpecs(form.specs)}
                  onChange={(e) =>
                    setForm({ ...form, specs: parseSpecs(e.target.value) })
                  }
                  placeholder="Label: Value"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Features</label>
                <textarea
                  className="form-control"
                  value={(form.features || []).join("\n")}
                  onChange={(e) =>
                    setForm({ ...form, features: parseLines(e.target.value) })
                  }
                  placeholder="One feature per line"
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2">
                <button className="btn btn-maze" type="submit" disabled={saving}>
                  <i className="bi bi-save me-2"></i>
                  {isNew ? "Create" : "Save"} Product
                </button>
                {!isNew ? (
                  <button
                    className="btn btn-maze-outline"
                    type="button"
                    disabled={saving}
                    onClick={() => onDelete(form.id)}
                  >
                    <i className="bi bi-trash me-2"></i>Delete Product
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function SubProductsPanel({
  data,
  categoryKey,
  setCategoryKey,
  saving,
  onSave,
}: {
  data: SiteData;
  categoryKey: string;
  setCategoryKey: (k: string) => void;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const [items, setItems] = useState(data.subProducts[categoryKey] || []);
  const [editIndex, setEditIndex] = useState(0);

  useEffect(() => {
    setItems(data.subProducts[categoryKey] || []);
    setEditIndex(0);
  }, [data.subProducts, categoryKey]);

  const current = items[editIndex] || { id: "", label: "" };

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="mb-0">Sub Products Manager</h3>
        <button
          className="btn btn-maze"
          type="button"
          onClick={() => {
            setItems([
              ...items,
              { id: `new-${items.length + 1}`, label: "New sub product" },
            ]);
            setEditIndex(items.length);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>Add Sub Product
        </button>
      </div>
      <div className="row g-4">
        <div className="col-lg-5">
          <label className="form-label small fw-semibold">Main Category</label>
          <select
            className="form-select mb-3"
            value={categoryKey}
            onChange={(e) => setCategoryKey(e.target.value)}
          >
            {Object.keys(data.subProducts).map((k) => (
              <option key={k} value={k}>
                {data.categorySeo[k]?.title || k}
              </option>
            ))}
          </select>
          <div className="dashboard-list">
            {items.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                className={`dashboard-item w-100 text-start${
                  editIndex === index ? " active" : ""
                }`}
                onClick={() => setEditIndex(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-7">
          <form
            className="dashboard-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSave({ categoryKey, subProducts: items });
            }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Sub Product ID
                </label>
                <input
                  className="form-control"
                  value={current.id}
                  onChange={(e) => {
                    const next = [...items];
                    next[editIndex] = { ...current, id: e.target.value };
                    setItems(next);
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Sub Product Name
                </label>
                <input
                  className="form-control"
                  value={current.label}
                  onChange={(e) => {
                    const next = [...items];
                    next[editIndex] = { ...current, label: e.target.value };
                    setItems(next);
                  }}
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2">
                <button className="btn btn-maze" type="submit" disabled={saving}>
                  <i className="bi bi-save me-2"></i>Save Sub Products
                </button>
                <button
                  className="btn btn-maze-outline"
                  type="button"
                  onClick={() => {
                    const next = items.filter((_, i) => i !== editIndex);
                    setItems(next);
                    setEditIndex(0);
                  }}
                >
                  <i className="bi bi-trash me-2"></i>Delete
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function BlogsPanel({
  data,
  saving,
  activeBlog,
  setActiveBlogId,
  onSaveBlog,
  onDelete,
}: {
  data: SiteData;
  saving: boolean;
  activeBlog: SiteData["blogs"][number] | null;
  setActiveBlogId: (id: number | null) => void;
  onSaveBlog: (blog: Record<string, unknown>, isNew: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const empty = {
    id: 0,
    title: "",
    date: new Date().toISOString().slice(0, 10),
    author: "Admin",
    excerpt: "",
    content: "",
    image: "",
    link: "#",
  };
  const [form, setForm] = useState(activeBlog || empty);
  const isNew = !activeBlog;

  useEffect(() => {
    setForm(activeBlog || empty);
  }, [activeBlog]);

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="mb-0">Blogs Manager</h3>
        <button
          className="btn btn-maze"
          type="button"
          onClick={() => setActiveBlogId(null)}
        >
          <i className="bi bi-plus-lg me-2"></i>Add Post
        </button>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="dashboard-list">
            {data.blogs.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`dashboard-item w-100 text-start${
                  activeBlog?.id === b.id ? " active" : ""
                }`}
                onClick={() => setActiveBlogId(b.id)}
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-8">
          <form
            className="dashboard-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSaveBlog(form, isNew);
            }}
          >
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">Title</label>
                <input
                  className="form-control"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Date</label>
                <input
                  className="form-control"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Author</label>
                <input
                  className="form-control"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Image URL</label>
                <input
                  className="form-control"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Excerpt</label>
                <textarea
                  className="form-control"
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Content</label>
                <textarea
                  className="form-control"
                  rows={8}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2">
                <button className="btn btn-maze" type="submit" disabled={saving}>
                  <i className="bi bi-save me-2"></i>
                  {isNew ? "Create" : "Save"} Post
                </button>
                {!isNew ? (
                  <button
                    className="btn btn-maze-outline"
                    type="button"
                    onClick={() => onDelete(form.id)}
                  >
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function SeoPanel({
  data,
  saving,
  onSave,
  onOpenProduct,
}: {
  data: SiteData;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
  onOpenProduct: (id: number) => void;
}) {
  const [siteMeta, setSiteMeta] = useState(data.siteMeta);
  const [sectionSeo, setSectionSeo] = useState(data.sectionSeo);
  const [categorySeo, setCategorySeo] = useState(data.categorySeo);

  useEffect(() => {
    setSiteMeta(data.siteMeta);
    setSectionSeo(data.sectionSeo);
    setCategorySeo(data.categorySeo);
  }, [data]);

  return (
    <section className="dashboard-panel mb-4">
      <h3>SEO Manager</h3>
      <form
        className="dashboard-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ siteMeta, sectionSeo, categorySeo });
        }}
      >
        <h5 className="h6 fw-bold">Site meta</h5>
        <div className="row g-3 mb-4">
          {Object.entries(siteMeta).map(([key, value]) => (
            <div className="col-12" key={key}>
              <label className="form-label small fw-semibold">{key}</label>
              <input
                className="form-control"
                value={value}
                onChange={(e) =>
                  setSiteMeta({ ...siteMeta, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <h5 className="h6 fw-bold">Section SEO</h5>
        {Object.entries(sectionSeo).map(([key, value]) => (
          <div className="row g-2 mb-3" key={key}>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                {key} title
              </label>
              <input
                className="form-control"
                value={value.title}
                onChange={(e) =>
                  setSectionSeo({
                    ...sectionSeo,
                    [key]: { ...value, title: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                {key} description
              </label>
              <input
                className="form-control"
                value={value.description}
                onChange={(e) =>
                  setSectionSeo({
                    ...sectionSeo,
                    [key]: { ...value, description: e.target.value },
                  })
                }
              />
            </div>
          </div>
        ))}

        <h5 className="h6 fw-bold mt-3">Category SEO</h5>
        {Object.entries(categorySeo).map(([key, value]) => (
          <div className="row g-2 mb-3" key={key}>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                {key} title
              </label>
              <input
                className="form-control"
                value={value.title}
                onChange={(e) =>
                  setCategorySeo({
                    ...categorySeo,
                    [key]: { ...value, title: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                {key} meta title
              </label>
              <input
                className="form-control"
                value={value.metaTitle}
                onChange={(e) =>
                  setCategorySeo({
                    ...categorySeo,
                    [key]: { ...value, metaTitle: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">
                {key} description
              </label>
              <input
                className="form-control"
                value={value.description}
                onChange={(e) =>
                  setCategorySeo({
                    ...categorySeo,
                    [key]: { ...value, description: e.target.value },
                  })
                }
              />
            </div>
          </div>
        ))}

        <h5 className="h6 fw-bold mt-3">Per-product SEO</h5>
        <p className="small text-secondary">
          Edit SEO Title and SEO Description on each product in Products
          Manager.
        </p>
        <div className="dashboard-table-wrap mb-3">
          <table className="table dashboard-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SEO Title</th>
                <th>SEO Description</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.seoTitle || "—"}</td>
                  <td className="small">
                    {(p.seoDescription || "—").slice(0, 80)}
                    {(p.seoDescription || "").length > 80 ? "…" : ""}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-maze-outline btn-sm"
                      onClick={() => onOpenProduct(p.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-maze" type="submit" disabled={saving}>
          <i className="bi bi-save me-2"></i>Save SEO
        </button>
      </form>
    </section>
  );
}

function InquiriesPanel({
  enquiries,
  onRefresh,
  onStatus,
  onDelete,
}: {
  enquiries: Enquiry[];
  onRefresh: () => void;
  onStatus: (id: number, status: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <h3 className="mb-0">Inquiry Manager</h3>
        <button
          type="button"
          className="btn btn-maze-outline btn-sm"
          onClick={onRefresh}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>
      <div className="dashboard-table-wrap">
        <table className="table dashboard-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={6}>No inquiries yet.</td>
              </tr>
            ) : (
              enquiries.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>{row.name}</td>
                  <td>
                    {row.phone}
                    <br />
                    {row.email || "—"}
                  </td>
                  <td>
                    <strong>{row.subject}</strong>
                    <div
                      className="small text-secondary mt-1 text-truncate"
                      style={{ maxWidth: 220 }}
                    >
                      {row.message}
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={row.status}
                      onChange={(e) => onStatus(row.id, e.target.value)}
                    >
                      {["New", "In progress", "Done", "Spam"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-maze btn-sm"
                        onClick={() => setSelectedEnquiry(row)}
                        title="View detailed enquiry"
                      >
                        <i className="bi bi-eye me-1"></i>View
                      </button>
                      <button
                        type="button"
                        className="btn btn-maze-outline btn-sm text-danger"
                        onClick={() => onDelete(row.id)}
                        title="Delete enquiry"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedEnquiry ? (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0, 0, 0, 0.5)", zIndex: 1060 }}
          tabIndex={-1}
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 14 }}
            >
              <div
                className="modal-header border-bottom pb-3"
                style={{ background: "#f8fbf8" }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-envelope-open me-2 text-success"></i>
                  Enquiry Details #{selectedEnquiry.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedEnquiry(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">
                        Customer Name
                      </small>
                      <strong className="fs-6">{selectedEnquiry.name}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">
                        Received Date & Time
                      </small>
                      <span>
                        {new Date(selectedEnquiry.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">
                        Phone Number
                      </small>
                      <a
                        href={`tel:${selectedEnquiry.phone}`}
                        className="text-success fw-bold text-decoration-none"
                      >
                        <i className="bi bi-telephone-fill me-1"></i>
                        {selectedEnquiry.phone}
                      </a>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">
                        Email Address
                      </small>
                      {selectedEnquiry.email ? (
                        <a
                          href={`mailto:${selectedEnquiry.email}`}
                          className="text-success fw-bold text-decoration-none"
                        >
                          <i className="bi bi-envelope-fill me-1"></i>
                          {selectedEnquiry.email}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Subject
                  </label>
                  <div className="p-2 border rounded bg-white fw-bold">
                    {selectedEnquiry.subject}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Message / Details
                  </label>
                  <div
                    className="p-3 border rounded bg-white"
                    style={{
                      whiteSpace: "pre-wrap",
                      minHeight: 120,
                      background: "#fafafa",
                    }}
                  >
                    {selectedEnquiry.message}
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted fw-semibold">Status:</span>
                    <select
                      className="form-select form-select-sm"
                      value={selectedEnquiry.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        await onStatus(selectedEnquiry.id, newStatus);
                        setSelectedEnquiry({
                          ...selectedEnquiry,
                          status: newStatus,
                        });
                      }}
                      style={{ width: "auto" }}
                    >
                      {["New", "In progress", "Done", "Spam"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <a
                      href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="bi bi-whatsapp me-1"></i>WhatsApp
                    </a>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={async () => {
                        await onDelete(selectedEnquiry.id);
                        setSelectedEnquiry(null);
                      }}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedEnquiry(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteData, SocialLink } from "@/data/types";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "@/lib/cloudinary/upload";

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
  | "seo-manager"
  | "profile-settings"
  | "users-manager";

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
  { id: "users-manager", label: "Users & Roles", icon: "bi-people-fill" },
  { id: "profile-settings", label: "Profile & Security", icon: "bi-person-lock" },
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
  "users-manager": "User Management",
  "profile-settings": "Profile & Security",
};

function htmlToText(value: string) {
  return (value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

function textToHtml(value: string) {
  return (value || "").trim().replace(/\n/g, "<br>");
}

function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureHeroSlides(
  slides: SiteData["sections"]["heroSlides"]
): SiteData["sections"]["heroSlides"] {
  if (Array.isArray(slides) && slides.length > 0) {
    return slides;
  }
  return [
    { badge: "Premium Mounts", title: "Mount Your TV\nLike a Pro", description: "Expert TV mounting and wall installation services." },
    { badge: "Solar Solutions", title: "Brighten Your Nights\nwith Solar", description: "Eco-friendly solar outdoor lighting." },
    { badge: "Complete Security", title: "Secure Your Property\n24/7", description: "High-definition CCTV and guards." },
  ];
}

function ensureHeroBackgrounds(backgrounds: string[], slidesCount: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < slidesCount; i++) {
    result.push(backgrounds?.[i] || "");
  }
  return result;
}

type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  type?: string;
  productName?: string | null;
  serviceType?: string | null;
  preferredDate?: string | null;
  location?: string | null;
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
  const { data: sessionData, update: updateSession } = useSession();
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
    body?: unknown,
    successMsg = "Changes saved successfully!"
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
        showAlert(json.error || "Save operation failed. Please try again.");
        return false;
      }
      showAlert(successMsg);
      await reload();
      return true;
    } catch {
      showAlert("Network error. Please check your connection.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function logout(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });
    }
    await signOut({ callbackUrl: "/admin/login", redirect: false });
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
              <i className="bi bi-shield-check me-1"></i>Secure Management Panel
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
                Changes save immediately and update your main website in real time.
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-5">
        <div className="container">
          {/* Toast Notification */}
          {alert ? (
            <div
              className="position-fixed top-0 end-0 p-3"
              style={{ zIndex: 1090, maxWidth: 420 }}
            >
              <div
                className="toast show align-items-center text-white bg-success border-0 shadow-lg"
                role="alert"
                style={{ borderRadius: 12 }}
              >
                <div className="d-flex p-3 align-items-center">
                  <i className="bi bi-check-circle-fill fs-4 me-3"></i>
                  <div className="toast-body p-0 fw-semibold fs-6">
                    {alert}
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white me-2 m-auto"
                    onClick={() => setAlert("")}
                  ></button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Force Default Password Change Security Banner */}
          {Boolean(
            (sessionData?.user as unknown as { isDefaultPassword?: boolean })?.isDefaultPassword
          ) ? (
            <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between p-3 mb-4 shadow-sm rounded-3">
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-shield-exclamation fs-2 text-warning"></i>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">
                    Security Notice: Default Password In Use
                  </h6>
                  <p className="small mb-0 text-dark">
                    You are signed in with the initial default password. For your security, please update your password now.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-warning text-dark fw-bold btn-sm text-nowrap ms-2"
                onClick={() => goSection("profile-settings")}
              >
                <i className="bi bi-key-fill me-1"></i>Change Password Now
              </button>
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
                  <div className="dashboard-panel mt-4">
                    <h3>Data Actions</h3>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-maze"
                        type="button"
                        onClick={() => {
                          const dataStr = JSON.stringify(data, null, 2);
                          const blob = new Blob([dataStr], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "maze-dashboard-data.json";
                          a.click();
                          URL.revokeObjectURL(url);
                          showAlert("Dashboard data exported as JSON.");
                        }}
                      >
                        <i className="bi bi-download me-2"></i>Export Dashboard Data
                      </button>
                      <button
                        className="btn btn-maze-outline"
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              "Reload website dashboard content to defaults?"
                            )
                          ) {
                            window.location.reload();
                          }
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>Reset To Defaults
                      </button>
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
                    api("/api/admin/settings", "PUT", payload, "Website settings saved successfully!")
                  }
                />
              ) : null}

              {section === "installation-charges" ? (
                <ChargesPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api(
                      "/api/admin/pages",
                      "PUT",
                      { section: "charges", ...payload },
                      "Installation charges saved successfully!"
                    )
                  }
                />
              ) : null}

              {section === "page-content" ? (
                <PagesPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/pages", "PUT", payload, "Page text content updated successfully!")
                  }
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
                      product,
                      isNew ? "New product added to catalog successfully!" : "Product details updated successfully!"
                    );
                    if (ok && isNew) setActiveProductId(null);
                  }}
                  onDelete={async (id) => {
                    const ok = await api(
                      `/api/admin/products?id=${id}`,
                      "DELETE",
                      undefined,
                      "Product deleted successfully."
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
                    api("/api/admin/subproducts", "PUT", payload, "Sub-products list saved successfully!")
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
                      blog,
                      isNew ? "New blog post published successfully!" : "Blog post updated successfully!"
                    );
                    if (ok && isNew) setActiveBlogId(null);
                  }}
                  onDelete={async (id) => {
                    const ok = await api(
                      `/api/admin/blogs?id=${id}`,
                      "DELETE",
                      undefined,
                      "Blog post deleted successfully."
                    );
                    if (ok) setActiveBlogId(null);
                  }}
                />
              ) : null}

              {section === "seo-manager" ? (
                <SeoPanel
                  data={data}
                  saving={saving}
                  onSave={(payload) =>
                    api("/api/admin/seo", "PUT", payload, "SEO metadata saved successfully!")
                  }
                  onOpenProduct={(id) => {
                    setActiveProductId(id);
                    goSection("products-manager");
                  }}
                />
              ) : null}

              {section === "profile-settings" ? (
                <ProfilePanel
                  sessionData={sessionData}
                  onUpdateSession={(newData) => updateSession(newData)}
                  showAlert={showAlert}
                />
              ) : null}

              {section === "users-manager" ? (
                <UsersPanel
                  showAlert={showAlert}
                  currentUserId={(sessionData?.user as unknown as { id?: string })?.id}
                />
              ) : null}

              {section === "inquiries-manager" ? (
                <InquiriesPanel
                  enquiries={enquiries}
                  onRefresh={loadEnquiries}
                  onStatus={async (id, status) => {
                    await api(
                      "/api/admin/enquiries",
                      "PATCH",
                      { id, status },
                      `Request #${id} status updated to "${status}".`
                    );
                    await loadEnquiries();
                  }}
                  onDelete={async (id) => {
                    await api(
                      `/api/admin/enquiries?id=${id}`,
                      "DELETE",
                      undefined,
                      `Request #${id} deleted successfully.`
                    );
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

function CloudinarySingleUpload({
  label,
  value,
  onChange,
  folder = "maze",
  placeholder = "Upload image file or enter URL...",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label small fw-semibold d-flex justify-content-between align-items-center">
        <span>{label}</span>
        {uploading && (
          <span className="text-success small fw-bold">
            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            Uploading to Cloudinary...
          </span>
        )}
      </label>
      <div className="input-group input-group-sm">
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {value && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onChange("")}
            title="Clear image"
          >
            Clear
          </button>
        )}
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
      <div className="mt-2 d-flex align-items-center gap-2">
        <input
          type="text"
          className="form-control form-control-sm"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="rounded border flex-shrink-0"
            style={{ width: 42, height: 42, objectFit: "cover" }}
          />
        ) : null}
      </div>
    </div>
  );
}

function CloudinaryMultiUpload({
  imgs,
  onChange,
  folder = "maze/products",
}: {
  imgs: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const newUrls = await uploadMultipleToCloudinary(files, folder);
      onChange([...imgs, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImg = (index: number) => {
    const updated = imgs.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="col-12 mb-3">
      <label className="form-label small fw-semibold d-flex justify-content-between align-items-center mb-2">
        <span>Product Images (Upload files or paste URLs)</span>
        {uploading && (
          <span className="text-success small fw-bold">
            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            Uploading to Cloudinary...
          </span>
        )}
      </label>

      <div className="border rounded-3 p-3 bg-light mb-2">
        <div className="row g-2 mb-3">
          {imgs.map((url, idx) => (
            <div key={idx} className="col-4 col-sm-3 col-md-2 position-relative">
              <div className="ratio ratio-1x1 border rounded overflow-hidden bg-white shadow-sm">
                <img src={url} alt={`Product ${idx + 1}`} style={{ objectFit: "cover" }} />
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle shadow-sm"
                style={{ width: 22, height: 22, transform: "translate(20%, -20%)", lineHeight: "20px" }}
                onClick={() => removeImg(idx)}
                title="Remove image"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          {imgs.length === 0 && (
            <div className="col-12 text-center text-muted small py-3">
              <i className="bi bi-images fs-4 d-block mb-1"></i>
              No images uploaded yet. Select files below or paste image URLs.
            </div>
          )}
        </div>

        <div className="input-group input-group-sm">
          <input
            type="file"
            accept="image/*"
            multiple
            className="form-control"
            onChange={handleFiles}
            disabled={uploading}
          />
        </div>
        {error && <div className="text-danger small mt-1">{error}</div>}
      </div>

      <textarea
        className="form-control form-control-sm"
        rows={2}
        placeholder="Image URLs (one per line)"
        value={imgs.join("\n")}
        onChange={(e) => onChange(parseLines(e.target.value))}
      />
    </div>
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
    ensureHeroBackgrounds(data.heroBackgrounds, data.sections.heroSlides?.length || 3)
  );

  useEffect(() => {
    const rawSlides = ensureHeroSlides(data.sections.heroSlides);
    setSlides(
      rawSlides.map((slide) => ({
        ...slide,
        title: htmlToText(slide.title),
      }))
    );
    setBackgrounds(ensureHeroBackgrounds(data.heroBackgrounds, rawSlides.length));
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

  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        badge: "Special Offer",
        title: "New Headline\nTitle",
        description: "Custom slide description.",
      },
    ]);
    setBackgrounds((prev) => [...prev, ""]);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setBackgrounds((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const newBg = [...backgrounds];

    const tempSlide = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = tempSlide;

    const tempBg = newBg[index];
    newBg[index] = newBg[targetIndex];
    newBg[targetIndex] = tempBg;

    setSlides(newSlides);
    setBackgrounds(newBg);
  };

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h3 className="mb-1">Homepage Hero Slider</h3>
          <p className="small text-secondary mb-0">
            Add, edit, reorder, or remove slides from the homepage carousel.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-maze"
          onClick={addSlide}
        >
          <i className="bi bi-plus-lg me-1"></i>Add New Slide
        </button>
      </div>

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
              <div className="dashboard-panel p-3 mb-0 border shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="h6 fw-bold mb-0">Slide {i + 1}</h5>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm p-1 px-2"
                      onClick={() => moveSlide(i, "up")}
                      disabled={i === 0}
                      title="Move Up"
                    >
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm p-1 px-2"
                      onClick={() => moveSlide(i, "down")}
                      disabled={i === slides.length - 1}
                      title="Move Down"
                    >
                      <i className="bi bi-arrow-down"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm p-1 px-2 ms-2"
                      onClick={() => deleteSlide(i)}
                      disabled={slides.length <= 1}
                      title="Delete Slide"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

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
                  <div className="col-12">
                    <CloudinarySingleUpload
                      label={`Slide ${i + 1} Background Image`}
                      value={backgrounds[i] || ""}
                      onChange={(url) => updateBackground(i, url)}
                      folder="maze/hero"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="col-12 d-flex justify-content-between align-items-center mt-3">
            <button
              type="button"
              className="btn btn-maze-outline"
              onClick={addSlide}
            >
              <i className="bi bi-plus-lg me-1"></i>Add Another Slide
            </button>

            <button className="btn btn-maze" type="submit" disabled={saving}>
              <i className="bi bi-save me-2"></i>Save Hero Slides
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
          <div className="col-12 border-top pt-4 mt-2">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-share-fill me-2 text-success"></i>
                  Social Media Links
                </h5>
                <p className="small text-secondary mb-0">
                  Configure social media platforms, icons, handles, and URLs. Active platforms are displayed in the site footer.
                </p>
              </div>
              <button
                className="btn btn-maze-outline btn-sm flex-shrink-0"
                type="button"
                onClick={() => {
                  const newLink: SocialLink = {
                    platform: "Platform",
                    icon: "facebook",
                    handle: "",
                    url: "https://",
                    enabled: true,
                  };
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: [...(prev.socialLinks || []), newLink],
                  }));
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>Add Platform
              </button>
            </div>
            <div className="table-responsive border rounded-3 overflow-hidden">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: 760 }}>
                <thead className="table-light small fw-bold">
                  <tr>
                    <th style={{ width: "20%" }}>Platform</th>
                    <th style={{ width: "20%" }}>Icon</th>
                    <th style={{ width: "20%" }}>Handle</th>
                    <th>Link URL</th>
                    <th className="text-center" style={{ width: "10%" }}>Active</th>
                    <th className="text-center" style={{ width: "10%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.socialLinks || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.platform}
                          onChange={(e) => {
                            const updated = [...(form.socialLinks || [])];
                            updated[idx] = { ...updated[idx], platform: e.target.value };
                            setForm({ ...form, socialLinks: updated });
                          }}
                          placeholder="e.g. Facebook"
                        />
                      </td>
                      <td>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-white">
                            <i className={`bi bi-${(item.icon || "globe").replace(/^bi-/, "")}`}></i>
                          </span>
                          <input
                            className="form-control form-control-sm"
                            value={item.icon}
                            onChange={(e) => {
                              const updated = [...(form.socialLinks || [])];
                              updated[idx] = { ...updated[idx], icon: e.target.value };
                              setForm({ ...form, socialLinks: updated });
                            }}
                            placeholder="facebook, instagram, twitter-x, etc."
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.handle}
                          onChange={(e) => {
                            const updated = [...(form.socialLinks || [])];
                            updated[idx] = { ...updated[idx], handle: e.target.value };
                            setForm({ ...form, socialLinks: updated });
                          }}
                          placeholder="@mazetech"
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          type="url"
                          value={item.url}
                          onChange={(e) => {
                            const updated = [...(form.socialLinks || [])];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            setForm({ ...form, socialLinks: updated });
                          }}
                          placeholder="https://..."
                        />
                      </td>
                      <td className="text-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={Boolean(item.enabled)}
                          onChange={(e) => {
                            const updated = [...(form.socialLinks || [])];
                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                            setForm({ ...form, socialLinks: updated });
                          }}
                        />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          onClick={() => {
                            const updated = (form.socialLinks || []).filter((_, i) => i !== idx);
                            setForm({ ...form, socialLinks: updated });
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!form.socialLinks || form.socialLinks.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-3 small">
                        No social media links added yet. Click &quot;Add Platform&quot; above to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-12 mt-3">
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
          <div className="col-12">
            <CloudinarySingleUpload
              label="Products Hero Background Image"
              value={form.heroBackground || ""}
              onChange={(url) => setForm({ ...form, heroBackground: url })}
              folder="maze/products"
            />
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
  const [isSlugCustomized, setIsSlugCustomized] = useState(
    Boolean(activeProduct?.slug)
  );
  const isNew = !activeProduct;

  useEffect(() => {
    setForm(activeProduct || empty);
    setIsSlugCustomized(Boolean(activeProduct?.slug));
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
                <label className="form-label small fw-semibold">Product Name</label>
                <input
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const autoSlug = slugify(newName);
                    setForm((prev) => ({
                      ...prev,
                      name: newName,
                      slug: isSlugCustomized ? prev.slug : autoSlug,
                    }));
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold d-flex justify-content-between align-items-center mb-1">
                  <span>Custom Slug</span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-success text-decoration-none"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => {
                      const autoSlug = slugify(form.name);
                      setForm((prev) => ({ ...prev, slug: autoSlug }));
                      setIsSlugCustomized(false);
                    }}
                  >
                    <i className="bi bi-magic me-1"></i>Regenerate from Name
                  </button>
                </label>
                <input
                  className="form-control"
                  placeholder="e.g. full-motion-tv-wall-mount"
                  value={form.slug || ""}
                  onChange={(e) => {
                    setForm({ ...form, slug: e.target.value });
                    setIsSlugCustomized(true);
                  }}
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
              <CloudinaryMultiUpload
                imgs={form.imgs || []}
                onChange={(urls) => setForm({ ...form, imgs: urls })}
                folder="maze/products"
              />
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
                <CloudinarySingleUpload
                  label="Featured Blog Image"
                  value={form.image || ""}
                  onChange={(url) => setForm({ ...form, image: url })}
                  folder="maze/blogs"
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
  const [activeTab, setActiveTab] = useState<"ALL" | "QUOTE" | "INSTALLATION" | "GENERAL">("ALL");

  const filteredEnquiries = enquiries.filter((item) => {
    if (activeTab === "ALL") return true;
    const itemType = item.type || "GENERAL";
    return itemType === activeTab;
  });

  const quoteCount = enquiries.filter((item) => item.type === "QUOTE").length;
  const installCount = enquiries.filter((item) => item.type === "INSTALLATION").length;
  const generalCount = enquiries.filter((item) => !item.type || item.type === "GENERAL").length;

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h3 className="mb-1">Requests & Inquiries Manager</h3>
          <p className="small text-secondary mb-0">
            View product quote requests, installation bookings, and general customer inquiries.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-maze-outline btn-sm"
          onClick={onRefresh}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh List
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          className={`btn btn-sm ${
            activeTab === "ALL" ? "btn-maze" : "btn-outline-secondary"
          }`}
          onClick={() => setActiveTab("ALL")}
        >
          All Requests ({enquiries.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${
            activeTab === "QUOTE" ? "btn-warning text-dark fw-bold" : "btn-outline-warning text-dark"
          }`}
          onClick={() => setActiveTab("QUOTE")}
        >
          <i className="bi bi-calculator me-1"></i>Quote Requests ({quoteCount})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${
            activeTab === "INSTALLATION" ? "btn-info text-dark fw-bold" : "btn-outline-info text-dark"
          }`}
          onClick={() => setActiveTab("INSTALLATION")}
        >
          <i className="bi bi-tools me-1"></i>Installation Requests ({installCount})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${
            activeTab === "GENERAL" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setActiveTab("GENERAL")}
        >
          <i className="bi bi-chat-text me-1"></i>General Inquiries ({generalCount})
        </button>
      </div>

      <div className="dashboard-table-wrap">
        <table className="table dashboard-table align-middle">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Target / Subject</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-secondary">
                  No requests found for this category.
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((row) => {
                const rowType = row.type || "GENERAL";
                return (
                  <tr key={row.id}>
                    <td>
                      {rowType === "QUOTE" ? (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-calculator me-1"></i>Quote
                        </span>
                      ) : rowType === "INSTALLATION" ? (
                        <span className="badge bg-info text-dark">
                          <i className="bi bi-tools me-1"></i>Installation
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <i className="bi bi-chat-text me-1"></i>General
                        </span>
                      )}
                    </td>
                    <td className="small">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="fw-bold small">{row.name}</div>
                      <div className="small text-secondary">{row.phone}</div>
                    </td>
                    <td>
                      <div className="fw-bold small text-dark">
                        {row.productName ? row.productName : row.subject}
                      </div>
                      {row.serviceType && row.productName ? (
                        <div className="small text-secondary">Category: {row.serviceType}</div>
                      ) : null}
                      <div
                        className="small text-secondary text-truncate"
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
                          title="View detailed request"
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
                );
              })
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
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold mb-0">
                    <i className="bi bi-envelope-open me-2 text-success"></i>
                    Request Details #{selectedEnquiry.id}
                  </h5>
                  {selectedEnquiry.type === "QUOTE" ? (
                    <span className="badge bg-warning text-dark">Quote Request</span>
                  ) : selectedEnquiry.type === "INSTALLATION" ? (
                    <span className="badge bg-info text-dark">Installation Booking</span>
                  ) : (
                    <span className="badge bg-secondary">General Inquiry</span>
                  )}
                </div>
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
                        Date Received
                      </small>
                      <span>
                        {new Date(selectedEnquiry.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">
                        Phone / WhatsApp
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

                  {selectedEnquiry.productName ? (
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1 fw-semibold">
                          Target Product
                        </small>
                        <strong className="text-success">{selectedEnquiry.productName}</strong>
                      </div>
                    </div>
                  ) : null}

                  {selectedEnquiry.serviceType ? (
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1 fw-semibold">
                          Service Category
                        </small>
                        <strong>{selectedEnquiry.serviceType}</strong>
                      </div>
                    </div>
                  ) : null}

                  {selectedEnquiry.location ? (
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1 fw-semibold">
                          Installation Location
                        </small>
                        <span>{selectedEnquiry.location}</span>
                      </div>
                    </div>
                  ) : null}

                  {selectedEnquiry.preferredDate ? (
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1 fw-semibold">
                          Preferred Date
                        </small>
                        <span>{selectedEnquiry.preferredDate}</span>
                      </div>
                    </div>
                  ) : null}
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
                    Customer Message & Notes
                  </label>
                  <div
                    className="p-3 border rounded bg-white"
                    style={{
                      whiteSpace: "pre-wrap",
                      minHeight: 100,
                      background: "#fafafa",
                    }}
                  >
                    {selectedEnquiry.message || "No message attached."}
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
                      href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${selectedEnquiry.name}, regarding your ${
                          selectedEnquiry.type === "QUOTE"
                            ? `quote request for ${selectedEnquiry.productName || selectedEnquiry.subject}`
                            : selectedEnquiry.type === "INSTALLATION"
                            ? `installation request for ${selectedEnquiry.serviceType || selectedEnquiry.productName || selectedEnquiry.subject}`
                            : `enquiry`
                        }:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="bi bi-whatsapp me-1"></i>Respond on WhatsApp
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

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  image?: string | null;
  createdAt: string;
}

function UsersPanel({
  showAlert,
  currentUserId,
}: {
  showAlert: (msg: string) => void;
  currentUserId?: string;
}) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EDITOR">("EDITOR");
  const [image, setImage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.ok) {
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, image }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showAlert("User created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setImage("");
        setRole("EDITOR");
        await loadUsers();
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch {
      setError("Failed to create user");
    } finally {
      setSavingUser(false);
    }
  }

  async function handleUpdateUserRole(userId: string, newRole: "ADMIN" | "EDITOR") {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showAlert("User role updated successfully");
        await loadUsers();
      } else {
        showAlert(data.error || "Failed to update role");
      }
    } catch {
      showAlert("Failed to update user role");
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showAlert("User deleted successfully");
        await loadUsers();
      } else {
        showAlert(data.error || "Failed to delete user");
      }
    } catch {
      showAlert("Failed to delete user");
    }
  }

  return (
    <section className="dashboard-panel mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">User Management</h3>
          <p className="small text-secondary mb-0">
            Manage admin accounts, assign roles (Admin / Editor), and provision access.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-maze-outline btn-sm"
          onClick={loadUsers}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh List
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border shadow-sm">
            <div className="card-header bg-white fw-bold py-3">
              <i className="bi bi-people-fill me-2 text-success"></i>
              Registered Accounts ({users.length})
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small fw-bold">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-secondary">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-secondary">
                        No secondary users registered yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name}
                                className="rounded-circle border"
                                style={{ width: 36, height: 36, objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-success fw-bold"
                                style={{ width: 36, height: 36 }}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : "A"}
                              </div>
                            )}
                            <div>
                              <div className="fw-bold small">{u.name}</div>
                              <div className="text-secondary" style={{ fontSize: "0.78rem" }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            className={`form-select form-select-sm fw-bold ${
                              u.role === "ADMIN" ? "text-success border-success" : "text-primary"
                            }`}
                            value={u.role}
                            onChange={(e) =>
                              handleUpdateUserRole(u.id, e.target.value as "ADMIN" | "EDITOR")
                            }
                            style={{ width: "auto" }}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="EDITOR">EDITOR</option>
                          </select>
                        </td>
                        <td className="small text-secondary">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm p-1 px-2"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === currentUserId}
                            title={
                              u.id === currentUserId
                                ? "Cannot delete your own account"
                                : "Delete user"
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border shadow-sm">
            <div className="card-header bg-white fw-bold py-3">
              <i className="bi bi-person-plus-fill me-2 text-success"></i>
              Add New User
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleCreateUser} className="dashboard-form">
                {error && <div className="alert alert-danger small mb-3">{error}</div>}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@mazetechnologies.co.ke"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Assign Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "ADMIN" | "EDITOR")}
                  >
                    <option value="ADMIN">ADMIN (Full access + user management)</option>
                    <option value="EDITOR">EDITOR (Content & products editor)</option>
                  </select>
                </div>

                <CloudinarySingleUpload
                  label="Avatar Image (Optional)"
                  value={image}
                  onChange={(url) => setImage(url)}
                  folder="maze/avatars"
                />

                <button
                  className="btn btn-maze w-100 mt-2"
                  type="submit"
                  disabled={savingUser}
                >
                  {savingUser ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check me-2"></i>Create Account
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfilePanel({
  sessionData,
  onUpdateSession,
  showAlert,
}: {
  sessionData: unknown;
  onUpdateSession: (data: unknown) => void;
  showAlert: (msg: string) => void;
}) {
  const user =
    (
      sessionData as {
        user?: { name?: string; email?: string; image?: string };
      }
    )?.user || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
    setImage(user.image || "");
  }, [user.name, user.email, user.image]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          name,
          email,
          image,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onUpdateSession({ name, email, image });
        showAlert("Profile updated successfully");
      } else {
        showAlert(data.error || "Profile update failed");
      }
    } catch {
      showAlert("Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showAlert("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || "Password update failed");
      }
    } catch {
      setPasswordError("Password update failed");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <section className="dashboard-panel mb-4">
      <h3 className="mb-4">Profile & Security</h3>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white fw-bold py-3">
              <i className="bi bi-person-badge me-2 text-success"></i>
              Manage Profile
            </div>
            <div className="card-body p-4">
              <form className="dashboard-form" onSubmit={handleProfileSubmit}>
                <div className="mb-3 text-center">
                  <div
                    className="mx-auto rounded-circle overflow-hidden bg-light border d-flex align-items-center justify-content-center mb-2"
                    style={{ width: 80, height: 80 }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i className="bi bi-person-fill fs-1 text-secondary"></i>
                    )}
                  </div>
                  <small className="text-secondary">Admin Avatar</small>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Display Name
                  </label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Email Address
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <CloudinarySingleUpload
                  label="Avatar Image"
                  value={image || ""}
                  onChange={(url) => setImage(url)}
                  folder="maze/avatars"
                />

                <button
                  className="btn btn-maze w-100"
                  type="submit"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving Profile…" : "Save Profile"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white fw-bold py-3">
              <i className="bi bi-shield-lock me-2 text-success"></i>
              Change Password
            </div>
            <div className="card-body p-4">
              <form className="dashboard-form" onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Current Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    New Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Confirm New Password
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                {passwordError ? (
                  <p className="text-danger small mb-3">{passwordError}</p>
                ) : null}

                <button
                  className="btn btn-maze-outline w-100"
                  type="submit"
                  disabled={savingPassword}
                >
                  {savingPassword ? "Updating Password…" : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

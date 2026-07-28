"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, Suspense } from "react";
import PageHero from "@/components/PageHero";

const PRODUCT_GROUPS = [
  {
    group: "TV Wall Mounts & Brackets",
    items: [
      "Fixed TV Wall Mount (32\" - 85\")",
      "Full-Motion Swivel TV Wall Mount",
      "Tilt TV Wall Mount",
      "Ceiling TV Mount",
    ],
  },
  {
    group: "Appliance & Voltage Guards",
    items: [
      "Fridge Guard (High-Voltage Protector)",
      "Air Conditioner Guard",
      "TV & Electronics Voltage Guard",
    ],
  },
  {
    group: "Solar Outdoor Lighting",
    items: [
      "Solar Street & Flood Light (100W - 300W)",
      "Solar Motion-Sensor Security Light",
    ],
  },
  {
    group: "Cables & Power Extensions",
    items: [
      "Heavy Duty Multi-Socket Extension Cable",
      "Power Distribution Extension Unit",
    ],
  },
];

const SERVICE_OPTIONS = [
  "TV Wall Mounting & Cable Concealing Service",
  "Appliance & Voltage Guard Installation Service",
  "Solar Outdoor Light Mounting & Wiring Service",
  "Full Home/Office Cable Setup & AV Installation",
  "Custom Electrical & Mounting Setup",
];

function RequestFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = searchParams.get("type") === "INSTALLATION" ? "INSTALLATION" : "QUOTE";
  const initialProduct = searchParams.get("product") || "";
  const initialCat = searchParams.get("cat") || "";

  const [requestType, setRequestType] = useState<"QUOTE" | "INSTALLATION">(initialType);
  const [selectedOption, setSelectedOption] = useState<string>(initialProduct || initialCat || "OTHER");
  const [customItem, setCustomItem] = useState<string>(initialProduct && selectedOption === "OTHER" ? initialProduct : "");
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialProduct || initialCat) {
      const match = initialProduct || initialCat;
      setSelectedOption(match);
    }
  }, [initialProduct, initialCat]);

  const targetItemName =
    selectedOption === "OTHER"
      ? customItem.trim() || "General Request"
      : selectedOption || initialProduct || "General Request";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const finalProduct = targetItemName;
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: requestType,
          productName: finalProduct,
          serviceType: initialCat || "General",
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          preferredDate,
          message: message.trim(),
          subject:
            requestType === "QUOTE"
              ? `Quote Request: ${finalProduct}`
              : `Installation Request: ${finalProduct}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setError("Unable to send request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden max-w-2xl mx-auto" style={{ maxWidth: 680 }}>
        {/* Toggle Header */}
        <div className="card-header bg-white border-bottom p-3">
          <div className="nav nav-pills nav-fill gap-2" role="tablist">
            <button
              type="button"
              className="nav-link py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: requestType === "QUOTE" ? "#146c43" : "#f8f9fa",
                color: requestType === "QUOTE" ? "#ffffff" : "#212529",
                border: requestType === "QUOTE" ? "1px solid #146c43" : "1px solid #dee2e6",
                borderRadius: "10px",
              }}
              onClick={() => {
                setRequestType("QUOTE");
                setSuccess(false);
              }}
            >
              <i className="bi bi-calculator fs-5"></i>
              <span>Get Product Quote</span>
            </button>

            <button
              type="button"
              className="nav-link py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: requestType === "INSTALLATION" ? "#146c43" : "#f8f9fa",
                color: requestType === "INSTALLATION" ? "#ffffff" : "#212529",
                border: requestType === "INSTALLATION" ? "1px solid #146c43" : "1px solid #dee2e6",
                borderRadius: "10px",
              }}
              onClick={() => {
                setRequestType("INSTALLATION");
                setSuccess(false);
              }}
            >
              <i className="bi bi-tools fs-5"></i>
              <span>Book Installation</span>
            </button>
          </div>
        </div>

        <div className="card-body p-4">
          {success ? (
            <div className="text-center py-4">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{ width: 72, height: 72, background: "#d1e7dd", color: "#0f5132" }}
              >
                <i className="bi bi-check-lg fs-1"></i>
              </div>
              <h4 className="fw-bold text-success mb-2">
                {requestType === "QUOTE" ? "Quote Request Submitted!" : "Installation Booking Submitted!"}
              </h4>
              <p className="text-secondary small max-w-md mx-auto mb-4 fs-6">
                Thank you! Your request for <strong>{targetItemName}</strong> has been received. Our team will contact you via WhatsApp or phone call shortly.
              </p>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-maze btn-lg w-100 fw-bold"
                  onClick={() => router.push("/products")}
                >
                  Return to Products
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg w-100"
                  onClick={() => router.push("/")}
                >
                  Go to Home Page
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="dashboard-form">
              {error ? <div className="alert alert-danger small mb-3">{error}</div> : null}

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark mb-1">
                    {requestType === "QUOTE" ? "Select Product for Quote *" : "Select Service for Installation *"}
                  </label>
                  {requestType === "QUOTE" ? (
                    <select
                      className="form-select form-select-lg"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      required
                    >
                      {initialProduct ? (
                        <option value={initialProduct}>{initialProduct} (Selected)</option>
                      ) : null}
                      {PRODUCT_GROUPS.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                          {group.items.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="OTHER">Other / Custom Product (Specify below)</option>
                    </select>
                  ) : (
                    <select
                      className="form-select form-select-lg"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      required
                    >
                      {initialProduct ? (
                        <option value={initialProduct}>{initialProduct} (Selected)</option>
                      ) : null}
                      {SERVICE_OPTIONS.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                      <option value="OTHER">Other / Custom Service (Specify below)</option>
                    </select>
                  )}
                </div>

                {selectedOption === "OTHER" ? (
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark mb-1">
                      Specify Custom Product or Service *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={customItem}
                      onChange={(e) => setCustomItem(e.target.value)}
                      placeholder="e.g. 75-inch Curved OLED Wall Mount"
                      required
                    />
                  </div>
                ) : null}

                <div className="col-12">
                  <label className="form-label fw-bold text-dark mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-dark mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    className="form-control form-control-lg"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-dark mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                {requestType === "INSTALLATION" ? (
                  <>
                    <div className="col-12">
                      <label className="form-label fw-bold text-dark mb-1">Installation Location *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Kilimani, Nairobi"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark mb-1">Preferred Installation Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                <div className="col-12">
                  <label className="form-label fw-bold text-dark mb-1">
                    {requestType === "QUOTE"
                      ? "Quantity, Delivery & Specification Notes"
                      : "Installation Wall Type & Setup Notes"}
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      requestType === "QUOTE"
                        ? "e.g. Need pricing for 3 units with delivery to Westlands"
                        : "e.g. Gypsum wall mounting for 65-inch TV"
                    }
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <button
                  className="btn btn-maze btn-lg w-100 py-3 fw-bold text-white fs-6"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <i
                        className={`bi ${
                          requestType === "QUOTE" ? "bi-calculator" : "bi-tools"
                        } me-2 text-white`}
                      ></i>
                      <span className="text-white">
                        {requestType === "QUOTE"
                          ? "Submit Quote Request"
                          : "Submit Installation Booking"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <>
      <PageHero
        label="Service & Quote Request"
        title="Request Quote or Installation"
        subtitle="Submit your details below and our team will respond with instant pricing or booking confirmation."
        crumbs={[
          { label: "Products", href: "/products" },
          { label: "Service Request" },
        ]}
      />
      <Suspense fallback={<div className="text-center py-5"><span className="spinner-border text-success"></span></div>}>
        <RequestFormContent />
      </Suspense>
    </>
  );
}

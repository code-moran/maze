"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  catLabel?: string;
  defaultType?: "QUOTE" | "INSTALLATION";
};

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

export default function ProductRequestModal({
  isOpen,
  onClose,
  productName: initialProductName = "",
  catLabel: initialCatLabel = "",
  defaultType = "QUOTE",
}: Props) {
  const [requestType, setRequestType] = useState<"QUOTE" | "INSTALLATION">(defaultType);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customItem, setCustomItem] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    setRequestType(defaultType);
    const initialMatch = initialProductName || initialCatLabel;
    setSelectedOption(initialMatch || "OTHER");
    setCustomItem(initialProductName && !initialMatch ? initialProductName : "");
    setSuccess(false);
    setError("");
  }, [isOpen, initialProductName, initialCatLabel, defaultType]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        onClose();
        const params = new URLSearchParams();
        params.set("type", defaultType);
        if (initialProductName) params.set("product", initialProductName);
        if (initialCatLabel) params.set("cat", initialCatLabel);
        router.push(`/request?${params.toString()}`);
        return;
      }
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, defaultType, initialProductName, initialCatLabel, onClose, router]);

  if (!isOpen) return null;

  const targetItemName =
    selectedOption === "OTHER"
      ? customItem.trim() || "General Request"
      : selectedOption || initialProductName || "General Request";

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
          serviceType: initialCatLabel || "General",
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
        setName("");
        setPhone("");
        setEmail("");
        setLocation("");
        setPreferredDate("");
        setMessage("");
        setCustomItem("");
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
    <div
      className="modal fade show d-block"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        zIndex: 1090,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "1rem 0.5rem",
      }}
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <div className="modal-header border-bottom p-3 bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 40,
                  height: 40,
                  background: requestType === "QUOTE" ? "#fff3cd" : "#cff4fc",
                  color: requestType === "QUOTE" ? "#664d03" : "#055160",
                }}
              >
                <i className={`bi ${requestType === "QUOTE" ? "bi-calculator-fill" : "bi-tools"} fs-5`}></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold fs-6 mb-0 text-dark">
                  {requestType === "QUOTE" ? "Request a Product Quote" : "Book Installation Service"}
                </h5>
                <span className="small text-secondary">
                  {targetItemName ? `Target: ${targetItemName}` : "Maze Technology Support & Quotes"}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Type Toggle Tabs with Guaranteed White Text for Active Button */}
          <div className="px-4 pt-3 pb-0 bg-white border-bottom">
            <div className="nav nav-pills nav-fill gap-2" role="tablist">
              <button
                type="button"
                className="nav-link py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: requestType === "QUOTE" ? "#146c43" : "#f8f9fa",
                  color: requestType === "QUOTE" ? "#ffffff" : "#212529",
                  border: requestType === "QUOTE" ? "1px solid #146c43" : "1px solid #dee2e6",
                  borderRadius: "8px",
                  boxShadow: requestType === "QUOTE" ? "0 2px 6px rgba(20, 108, 67, 0.3)" : "none",
                }}
                onClick={() => {
                  setRequestType("QUOTE");
                  setSuccess(false);
                }}
              >
                <i
                  className="bi bi-calculator"
                  style={{ color: requestType === "QUOTE" ? "#ffffff" : "inherit" }}
                ></i>
                <span style={{ color: requestType === "QUOTE" ? "#ffffff" : "inherit" }}>
                  Get Quote
                </span>
              </button>

              <button
                type="button"
                className="nav-link py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: requestType === "INSTALLATION" ? "#146c43" : "#f8f9fa",
                  color: requestType === "INSTALLATION" ? "#ffffff" : "#212529",
                  border: requestType === "INSTALLATION" ? "1px solid #146c43" : "1px solid #dee2e6",
                  borderRadius: "8px",
                  boxShadow: requestType === "INSTALLATION" ? "0 2px 6px rgba(20, 108, 67, 0.3)" : "none",
                }}
                onClick={() => {
                  setRequestType("INSTALLATION");
                  setSuccess(false);
                }}
              >
                <i
                  className="bi bi-tools"
                  style={{ color: requestType === "INSTALLATION" ? "#ffffff" : "inherit" }}
                ></i>
                <span style={{ color: requestType === "INSTALLATION" ? "#ffffff" : "inherit" }}>
                  Request Installation
                </span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {success ? (
              <div className="text-center py-4">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64, background: "#d1e7dd", color: "#0f5132" }}
                >
                  <i className="bi bi-check-lg fs-1"></i>
                </div>
                <h5 className="fw-bold text-success mb-2">
                  {requestType === "QUOTE" ? "Quote Request Submitted!" : "Installation Booking Submitted!"}
                </h5>
                <p className="text-secondary small max-w-md mx-auto mb-4">
                  Thank you! Your request for <strong>{targetItemName}</strong> has been received. Our team will contact you via WhatsApp / Phone shortly.
                </p>
                <button type="button" className="btn btn-maze text-white px-4" onClick={onClose}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="dashboard-form">
                {error ? <div className="alert alert-danger small mb-3">{error}</div> : null}

                <div className="row g-3">
                  {/* Context Aware Product or Service Dropdown Selection */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      {requestType === "QUOTE" ? "Select Product for Quote *" : "Select Service for Installation *"}
                    </label>
                    {requestType === "QUOTE" ? (
                      <select
                        className="form-select"
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        required
                      >
                        {initialProductName ? (
                          <option value={initialProductName}>
                            {initialProductName} (Current Selection)
                          </option>
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
                        <option value="OTHER">Other / Custom Product (Type below)</option>
                      </select>
                    ) : (
                      <select
                        className="form-select"
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        required
                      >
                        {initialProductName ? (
                          <option value={initialProductName}>
                            {initialProductName} (Current Selection)
                          </option>
                        ) : null}
                        {SERVICE_OPTIONS.map((srv) => (
                          <option key={srv} value={srv}>
                            {srv}
                          </option>
                        ))}
                        <option value="OTHER">Other / Custom Service (Type below)</option>
                      </select>
                    )}
                  </div>

                  {/* Custom Name input if "OTHER" or custom typed */}
                  {selectedOption === "OTHER" ? (
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Specify Product or Service Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={customItem}
                        onChange={(e) => setCustomItem(e.target.value)}
                        placeholder="e.g. 75-inch Curved OLED Wall Mount, Solar Battery Setup"
                        required
                      />
                    </div>
                  ) : null}

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>

                  {requestType === "INSTALLATION" ? (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">Installation Location *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Kilimani, Nairobi"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">Preferred Installation Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      {requestType === "QUOTE" ? "Quantity, Delivery & Specification Notes" : "Installation Wall Type & Requirements"}
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        requestType === "QUOTE"
                          ? "e.g. Need pricing for 3 units with delivery to Westlands"
                          : "e.g. Gypsum/Concrete wall mounting, 65-inch OLED TV"
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-0 pb-0 mt-4 d-flex justify-content-between align-items-center">
                  <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button className="btn btn-maze text-white px-4" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className={`bi ${requestType === "QUOTE" ? "bi-calculator" : "bi-tools"} me-2 text-white`}></i>
                        <span className="text-white">
                          {requestType === "QUOTE" ? "Submit Quote Request" : "Submit Installation Booking"}
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
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";

type Props = {
  productName: string;
  catLabel: string;
  defaultType?: "QUOTE" | "INSTALLATION";
};

export default function ProductInlineRequestForm({
  productName,
  catLabel,
  defaultType = "QUOTE",
}: Props) {
  const [requestType, setRequestType] = useState<"QUOTE" | "INSTALLATION">(
    defaultType
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: requestType,
          productName,
          serviceType: catLabel,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          preferredDate,
          message: message.trim(),
          subject:
            requestType === "QUOTE"
              ? `Quote Request: ${productName}`
              : `Installation Request: ${productName} (${catLabel})`,
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
    <div className="card border shadow-sm rounded-3 mt-4">
      <div className="card-header bg-light border-bottom p-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge"
              style={{
                background: "var(--maze-green)",
                color: "#fff",
                fontSize: ".75rem",
              }}
            >
              {catLabel}
            </span>
            <span className="fw-bold text-dark small">{productName}</span>
          </div>

          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${
                requestType === "QUOTE" ? "btn-maze" : "btn-outline-secondary"
              }`}
              onClick={() => {
                setRequestType("QUOTE");
                setSuccess(false);
              }}
            >
              <i className="bi bi-calculator me-1"></i>Get Quote
            </button>
            <button
              type="button"
              className={`btn ${
                requestType === "INSTALLATION"
                  ? "btn-maze"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setRequestType("INSTALLATION");
                setSuccess(false);
              }}
            >
              <i className="bi bi-tools me-1"></i>Request Installation
            </button>
          </div>
        </div>
      </div>

      <div className="card-body p-4">
        {success ? (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-0" role="alert">
            <i className="bi bi-check-circle-fill fs-4 text-success me-2"></i>
            <div>
              <h6 className="fw-bold mb-1">
                {requestType === "QUOTE"
                  ? "Quote Request Submitted!"
                  : "Installation Request Submitted!"}
              </h6>
              <p className="small mb-0">
                Thank you! Your request for <strong>{productName}</strong> has been received. Our team will contact you via WhatsApp / Phone shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="text-secondary small mb-3">
              <i className="bi bi-info-circle me-1 text-success"></i>
              {requestType === "QUOTE"
                ? `Fill out this quick form to receive pricing and availability for ${productName}.`
                : `Schedule professional installation or setup for ${productName}.`}
            </div>

            {error ? <div className="alert alert-danger small mb-3">{error}</div> : null}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Your Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Moran"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Phone / WhatsApp Number *</label>
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
                <label className="form-label small fw-semibold">Email Address (Optional)</label>
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
                    <label className="form-label small fw-semibold">Installation Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kilimani, Nairobi"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Preferred Installation Date</label>
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
                <label className="form-label small fw-semibold">
                  {requestType === "QUOTE" ? "Quantity or Special Requirements" : "Additional Installation Notes"}
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    requestType === "QUOTE"
                      ? "e.g. Need 2 units delivered to Westlands"
                      : "e.g. Concrete wall mounting, 65-inch OLED TV"
                  }
                />
              </div>
            </div>

            <div className="mt-3 text-end">
              <button className="btn btn-maze px-4" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className={`bi ${requestType === "QUOTE" ? "bi-calculator" : "bi-tools"} me-2`}></i>
                    {requestType === "QUOTE" ? "Submit Quote Request" : "Submit Installation Request"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

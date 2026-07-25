"use client";

import { FormEvent, useState } from "react";

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

export default function EnquiriesAdminClient() {
  const [secret, setSecret] = useState("");
  const [items, setItems] = useState<Enquiry[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function load(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    const res = await fetch("/api/enquiries", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) {
      setError("Unauthorized or server error");
      setLoaded(false);
      return;
    }
    const data = await res.json();
    setItems(data.enquiries || []);
    setLoaded(true);
  }

  return (
    <div className="container py-5">
      <h1 className="section-title mb-3">Enquiry Inbox</h1>
      <p className="section-sub">
        Protected with ADMIN_ENQUIRIES_SECRET. For site content editing, use{" "}
        <a href="/studio">Sanity Studio</a>.
      </p>

      <form
        onSubmit={load}
        className="contact-card mb-4"
        style={{ maxWidth: 480 }}
      >
        <label className="form-label small fw-semibold">Admin secret</label>
        <input
          type="password"
          className="form-control mb-3"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-maze">
          Load enquiries
        </button>
        {error ? (
          <div className="alert alert-danger mt-3 mb-0">{error}</div>
        ) : null}
      </form>

      {loaded ? (
        <div className="dashboard-table-wrap">
          <table className="table dashboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No enquiries yet.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleString()}</td>
                    <td>{row.name}</td>
                    <td>
                      {row.phone}
                      {row.email ? (
                        <>
                          <br />
                          {row.email}
                        </>
                      ) : null}
                    </td>
                    <td>{row.subject}</td>
                    <td>
                      <span className="status-pill status-new">{row.status}</span>
                    </td>
                    <td style={{ maxWidth: 280 }}>{row.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

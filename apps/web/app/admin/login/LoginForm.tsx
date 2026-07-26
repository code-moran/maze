"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
        return;
      }
      const next = searchParams.get("next") || "/admin";
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="form-label small fw-semibold" htmlFor="admin-secret">
          Admin secret
        </label>
        <input
          id="admin-secret"
          className="form-control"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_DASHBOARD_SECRET"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className="text-danger small">{error}</p> : null}
      <button className="btn btn-maze" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

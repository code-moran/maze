"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextUrl = searchParams.get("next") || "/admin";
  const redirectTarget = nextUrl.startsWith("/admin") ? nextUrl : "/admin";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (!res || res.error || !res.ok) {
        setError(res?.error || "Invalid email or password.");
        return;
      }

      router.replace(redirectTarget);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: redirectTarget });
  };

  return (
    <div className="dashboard-form">
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="admin-email">
            Email Address
          </label>
          <input
            id="admin-email"
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {error ? <p className="text-danger small mb-3">{error}</p> : null}

        <button className="btn btn-maze w-100 mb-3" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="text-center position-relative my-3">
        <hr />
        <span
          className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-secondary small"
        >
          OR
        </span>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={handleGoogleSignIn}
      >
        <i className="bi bi-google text-danger"></i>
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}

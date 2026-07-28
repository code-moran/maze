"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const nextUrl = searchParams.get("next") || "/admin";
  const redirectTarget = nextUrl.startsWith("/admin") ? nextUrl : "/admin";
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError === "CredentialsSignin") {
      setError("Incorrect email address or password. Please double check your credentials and try again.");
    } else if (urlError === "OAuthAccountNotLinked") {
      setError("To sign in with Google, please use the email address associated with your account.");
    } else if (urlError) {
      setError("Your login session expired or was unauthorized. Please enter your credentials below.");
    }
  }, [urlError]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (!res || res.error || !res.ok) {
        setError("Invalid email address or password. Please verify your credentials and try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Sign in successful! Loading your dashboard...");
      router.replace(redirectTarget);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please check your internet connection and try again.");
      setLoading(false);
    }
  }

  const handleGoogleSignIn = () => {
    setLoading(true);
    setSuccessMessage("Connecting to Google Account...");
    signIn("google", { callbackUrl: redirectTarget });
  };

  return (
    <div className="dashboard-form">
      {successMessage ? (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
          <span className="spinner-border spinner-border-sm text-success me-2" role="status"></span>
          <span className="small fw-semibold">{successMessage}</span>
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>
          <span className="small">{error}</span>
        </div>
      ) : null}

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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <button className="btn btn-maze w-100 mb-3" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Signing in...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right me-2"></i>Sign in to Dashboard
            </>
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
        disabled={loading}
      >
        <i className="bi bi-google text-danger"></i>
        <span>Sign in with Google Account</span>
      </button>
    </div>
  );
}

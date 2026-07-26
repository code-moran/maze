import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  isAdminAuthenticated,
  getAdminSecretConfigured,
} from "@/lib/admin/auth";
import AdminLoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top" id="mainNav">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <img
              src="/images/logo-wordmark.png"
              alt="Maze"
              className="brand-logo"
            />
          </Link>
          <Link href="/" className="btn btn-maze-outline btn-sm ms-auto">
            View Site
          </Link>
        </div>
      </nav>
      <section className="dashboard-hero">
        <div className="container">
          <p
            className="section-label text-white mb-2"
            style={{ letterSpacing: "3px" }}
          >
            MazeTech Admin
          </p>
          <h1>Dashboard Login</h1>
          <p className="mb-0 text-white-50">
            {getAdminSecretConfigured()
              ? "Enter the dashboard secret to manage site content."
              : "Set ADMIN_DASHBOARD_SECRET (or ADMIN_ENQUIRIES_SECRET) in env before signing in."}
          </p>
        </div>
      </section>
      <main className="py-5">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="dashboard-panel">
            <h3>Sign in</h3>
            <Suspense fallback={<p>Loading…</p>}>
              <AdminLoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}

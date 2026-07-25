"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BackToTop from "@/components/BackToTop";
import BootstrapClient from "@/components/BootstrapClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Toast from "@/components/Toast";
import Topbar from "@/components/Topbar";
import WhatsAppFab from "@/components/WhatsAppFab";
import type { SiteData } from "@/data/types";

function cleanupBootstrapOverlays() {
  document
    .querySelectorAll(".offcanvas-backdrop, .modal-backdrop")
    .forEach((node) => node.remove());
  document.body.classList.remove("offcanvas-open", "modal-open");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");

  const menu = document.getElementById("mobileMenu");
  if (menu) {
    menu.classList.remove("show");
    menu.style.visibility = "";
    window.bootstrap?.Offcanvas.getInstance(menu)?.hide();
  }
}

export default function SiteChrome({
  children,
  data,
}: {
  children: React.ReactNode;
  data: SiteData;
}) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  useEffect(() => {
    cleanupBootstrapOverlays();
  }, [pathname]);

  return (
    <>
      <BootstrapClient />
      <Topbar settings={data.generalSettings} />
      <Navbar data={data} />
      <SearchBar products={data.products} />
      {children}
      <Footer data={data} />
      <WhatsAppFab href={data.generalSettings.whatsapp} />
      <BackToTop />
      <Toast />
    </>
  );
}

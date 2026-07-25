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
    document.body.classList.remove("mobile-menu-open", "offcanvas-open", "modal-open");
    document
      .querySelectorAll(".offcanvas-backdrop, .modal-backdrop")
      .forEach((node) => node.remove());
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

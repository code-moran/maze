"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

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

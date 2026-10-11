import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import { getSiteData } from "@/data/siteData";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const fallback = getSiteData();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: fallback.siteMeta.title,
    template: "%s",
  },
  description: fallback.siteMeta.description,
  keywords: fallback.siteMeta.keywords,
  openGraph: {
    title: fallback.siteMeta.ogTitle || fallback.siteMeta.title,
    description:
      fallback.siteMeta.ogDescription || fallback.siteMeta.description,
    type: "website",
    siteName: "Maze",
  },
  twitter: {
    card: "summary_large_image",
    title: fallback.siteMeta.ogTitle || fallback.siteMeta.title,
    description:
      fallback.siteMeta.ogDescription || fallback.siteMeta.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className={figtree.className}>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}

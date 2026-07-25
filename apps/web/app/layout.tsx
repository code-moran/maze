import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { getSiteData } from "@/data/siteData";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const data = getSiteData();

export const metadata: Metadata = {
  title: data.siteMeta.title,
  description: data.siteMeta.description,
  keywords: data.siteMeta.keywords,
  openGraph: {
    title: data.siteMeta.ogTitle,
    description: data.siteMeta.ogDescription,
    type: "website",
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
      <body className={inter.className}>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}

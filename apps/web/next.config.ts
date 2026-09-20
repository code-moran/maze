import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/maze-technologies.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/dashboard.htm",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/dashboard.html",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/admin/enquiries",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/products/category/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

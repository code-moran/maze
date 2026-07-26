import type { Metadata } from "next";
import BlogGrid from "@/components/BlogGrid";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadSiteContent();
  const seo = data.sectionSeo.blog;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function BlogPage() {
  const data = await loadSiteContent();

  return (
    <>
      <BreadcrumbBar current="Blog" />
      <BlogGrid posts={data.blogs} />
    </>
  );
}

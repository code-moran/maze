import type { Metadata } from "next";
import BlogGrid from "@/components/BlogGrid";
import PageHero from "@/components/PageHero";
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
  const background = data.blogs[0]?.image || data.heroBackgrounds[0] || "";

  return (
    <>
      <PageHero
        label="MAZE BLOG"
        title="Latest News & Expert Articles"
        subtitle="Insights on TV mounting, security camera placement, and solar installation."
        backgroundImage={background}
        crumbs={[{ label: "Blog" }]}
      />
      <BlogGrid posts={data.blogs} />
    </>
  );
}

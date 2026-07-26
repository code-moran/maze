import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import {
  formatBlogDate,
  formatRichText,
  getBlogBySlug,
  getBlogSlug,
} from "@/data/siteData";
import { loadSiteContent } from "@/lib/content/loadSiteContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const data = await loadSiteContent();
  return data.blogs.map((post) => ({ slug: getBlogSlug(post) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSiteContent();
  const post = getBlogBySlug(slug, data);
  if (!post) return { title: "Blog | Maze" };
  return {
    title: `${post.title} | Maze`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadSiteContent();
  const post = getBlogBySlug(slug, data);
  if (!post) notFound();

  return (
    <>
      <BreadcrumbBar
        items={[
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <section className="py-5 bg-white">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="blog-meta mb-2">
            {formatBlogDate(post.date)}
            {post.author ? ` · ${post.author}` : ""}
          </div>
          <h1 className="section-title mb-4">{post.title}</h1>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt={post.title}
              className="img-fluid rounded-3 mb-4 w-100"
              style={{ maxHeight: 420, objectFit: "cover" }}
            />
          ) : null}
          <div
            className="text-secondary"
            dangerouslySetInnerHTML={{ __html: formatRichText(post.content) }}
          />
          {post.link && post.link !== "#" ? (
            <div className="mt-4">
              <a
                href={post.link}
                className="btn btn-maze-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Source Link
              </a>
            </div>
          ) : null}
          <div className="mt-5">
            <Link href="/blog" className="btn btn-maze">
              Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { formatBlogDate, getBlogSlug } from "@/data/siteData";
import type { BlogPost } from "@/data/types";

export default function BlogGrid({
  posts,
  teaser = false,
  limit,
}: {
  posts: BlogPost[];
  teaser?: boolean;
  limit?: number;
}) {
  const list = typeof limit === "number" ? posts.slice(0, limit) : posts;

  return (
    <section id="blog" className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Insights & Updates</p>
          <h2 className="section-title">
            {teaser ? "Latest from Our Blog" : "Our Blog"}
          </h2>
          <div className="divider-green mx-auto"></div>
        </div>
        <div className="row g-4">
          {list.length === 0 ? (
            <div className="col-12">
              <div className="empty-state">No blog posts yet.</div>
            </div>
          ) : (
            list.map((post) => {
              const dateLabel = formatBlogDate(post.date);
              return (
                <div key={post.id} className="col-md-6 col-lg-4">
                  <div className="blog-card h-100">
                    <div className="blog-img">
                      <img
                        src={post.image || ""}
                        alt={post.title || "Blog post"}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-body p-3">
                      <div className="blog-meta mb-2">
                        <i className="bi bi-calendar3 me-1"></i>
                        {dateLabel}
                        {post.author ? (
                          <>
                            {" "}
                            &nbsp;·&nbsp;{" "}
                            <i className="bi bi-person me-1"></i>
                            {post.author}
                          </>
                        ) : null}
                      </div>
                      <h6 className="fw-bold">{post.title}</h6>
                      <p className="small text-secondary">{post.excerpt}</p>
                      <Link
                        href={`/blog/${getBlogSlug(post)}`}
                        className="btn btn-maze-outline btn-sm"
                      >
                        Read More <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {teaser ? (
          <div className="text-center mt-4">
            <Link href="/blog" className="btn btn-maze-outline">
              View All Posts <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

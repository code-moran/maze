import { requireAdmin, jsonOk, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonOk({ blogs: [] });
  }
  const blogs = await prisma.blogPost.findMany({ orderBy: { date: "desc" } });
  return jsonOk({
    blogs: blogs.map((b) => ({
      id: b.legacyId,
      title: b.title,
      slug: b.slug,
      date: b.date,
      author: b.author,
      excerpt: b.excerpt,
      content: b.content,
      image: b.imageUrl,
      link: b.link,
    })),
  });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body?.title) return jsonError("Title is required");

  const max = await prisma.blogPost.aggregate({ _max: { legacyId: true } });
  const legacyId = (max._max.legacyId || 0) + 1;
  const slug =
    String(body.slug || "").trim() ||
    slugify(String(body.title)) ||
    `post-${legacyId}`;

  const blog = await prisma.blogPost.create({
    data: {
      legacyId,
      title: String(body.title),
      slug,
      date: String(body.date || new Date().toISOString().slice(0, 10)),
      author: String(body.author || "Admin"),
      excerpt: String(body.excerpt || ""),
      content: String(body.content || ""),
      imageUrl: String(body.image || body.imageUrl || ""),
      link: String(body.link || `/blog/${slug}`),
    },
  });

  return jsonOk({
    blog: {
      id: blog.legacyId,
      title: blog.title,
      slug: blog.slug,
      date: blog.date,
      author: blog.author,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.imageUrl,
      link: blog.link,
    },
  });
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!id) return jsonError("id is required");

  const slug =
    String(body.slug || "").trim() ||
    slugify(String(body.title || "")) ||
    `post-${id}`;

  const blog = await prisma.blogPost.update({
    where: { legacyId: id },
    data: {
      title: String(body.title || ""),
      slug,
      date: String(body.date || ""),
      author: String(body.author || "Admin"),
      excerpt: String(body.excerpt || ""),
      content: String(body.content || ""),
      imageUrl: String(body.image || body.imageUrl || ""),
      link: String(body.link || `/blog/${slug}`),
    },
  });

  return jsonOk({
    blog: {
      id: blog.legacyId,
      title: blog.title,
      slug: blog.slug,
      date: blog.date,
      author: blog.author,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.imageUrl,
      link: blog.link,
    },
  });
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return jsonError("id is required");

  await prisma.blogPost.delete({ where: { legacyId: id } });
  return jsonOk({});
}

import { requireAdmin, jsonOk, jsonSaved, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { slugify } from "@/data/siteData";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonOk({ categories: [] });
  }

  const categories = await prisma.category.findMany({
    include: {
      subProducts: { orderBy: { sortOrder: "asc" } },
      _count: { select: { products: true, subProducts: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return jsonOk({
    categories: categories.map((c) => ({
      id: c.id,
      key: c.key,
      title: c.title,
      description: c.description,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      icon: c.icon,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
      subProductCount: c._count.subProducts,
      subProducts: c.subProducts.map((s) => ({
        id: s.subId,
        label: s.label,
        sortOrder: s.sortOrder,
      })),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Invalid body");

  const title = String(body.title || "").trim();
  if (!title) return jsonError("Title is required");

  const rawSlug = String(body.slug || body.key || title).trim();
  const slug = slugify(rawSlug);

  if (!slug) {
    return jsonError("A valid slug is required");
  }

  if (slug === "all") {
    return jsonError("'all' is a reserved category slug and cannot be used");
  }

  const existing = await prisma.category.findUnique({
    where: { key: slug },
  });
  if (existing) {
    return jsonError(`A category with slug '${slug}' already exists`);
  }

  let sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : null;
  if (sortOrder === null) {
    const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
    sortOrder = (max._max.sortOrder ?? -1) + 1;
  }

  const category = await prisma.category.create({
    data: {
      key: slug,
      title,
      description: String(body.description || "").trim(),
      metaTitle: String(body.metaTitle || "").trim(),
      metaDescription: String(body.metaDescription || "").trim(),
      icon: String(body.icon || "bi-box").trim(),
      sortOrder,
    },
    include: {
      subProducts: { orderBy: { sortOrder: "asc" } },
      _count: { select: { products: true, subProducts: true } },
    },
  });

  return jsonSaved({
    category: {
      id: category.id,
      key: category.key,
      title: category.title,
      description: category.description,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      icon: category.icon,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
      subProductCount: category._count.subProducts,
      subProducts: category.subProducts.map((s) => ({
        id: s.subId,
        label: s.label,
        sortOrder: s.sortOrder,
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    },
  });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Invalid body");

  const id = body.id ? String(body.id) : null;
  const originalKey = body.originalKey ? String(body.originalKey) : (body.key ? String(body.key) : null);

  if (!id && !originalKey) {
    return jsonError("Category id or key is required");
  }

  const existing = id
    ? await prisma.category.findUnique({ where: { id } })
    : await prisma.category.findUnique({ where: { key: originalKey! } });

  if (!existing) {
    return jsonError("Category not found", 404);
  }

  const title = String(body.title ?? existing.title).trim();
  if (!title) return jsonError("Title cannot be empty");

  const rawSlug = String(body.slug || body.newKey || body.key || existing.key).trim();
  const slug = slugify(rawSlug);

  if (!slug) {
    return jsonError("A valid slug is required");
  }

  if (slug === "all") {
    return jsonError("'all' is a reserved category slug and cannot be used");
  }

  if (slug !== existing.key) {
    const slugInUse = await prisma.category.findUnique({
      where: { key: slug },
    });
    if (slugInUse && slugInUse.id !== existing.id) {
      return jsonError(`A category with slug '${slug}' already exists`);
    }
  }

  const sortOrder =
    typeof body.sortOrder === "number" ? body.sortOrder : existing.sortOrder;

  const updated = await prisma.category.update({
    where: { id: existing.id },
    data: {
      key: slug,
      title,
      description: String(body.description ?? existing.description).trim(),
      metaTitle: String(body.metaTitle ?? existing.metaTitle).trim(),
      metaDescription: String(body.metaDescription ?? existing.metaDescription).trim(),
      icon: String(body.icon ?? existing.icon).trim(),
      sortOrder,
    },
    include: {
      subProducts: { orderBy: { sortOrder: "asc" } },
      _count: { select: { products: true, subProducts: true } },
    },
  });

  return jsonSaved({
    category: {
      id: updated.id,
      key: updated.key,
      title: updated.title,
      description: updated.description,
      metaTitle: updated.metaTitle,
      metaDescription: updated.metaDescription,
      icon: updated.icon,
      sortOrder: updated.sortOrder,
      productCount: updated._count.products,
      subProductCount: updated._count.subProducts,
      subProducts: updated.subProducts.map((s) => ({
        id: s.subId,
        label: s.label,
        sortOrder: s.sortOrder,
      })),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const key = searchParams.get("key");

  if (!id && !key) {
    return jsonError("Category id or key is required");
  }

  const existing = id
    ? await prisma.category.findUnique({
        where: { id },
        include: {
          _count: { select: { products: true, subProducts: true } },
        },
      })
    : await prisma.category.findUnique({
        where: { key: key! },
        include: {
          _count: { select: { products: true, subProducts: true } },
        },
      });

  if (!existing) {
    return jsonError("Category not found", 404);
  }

  if (existing._count.products > 0) {
    return jsonError(
      `Cannot delete category "${existing.title}" because it has ${existing._count.products} product(s) attached. Please delete or reassign products first.`,
      400
    );
  }

  await prisma.category.delete({
    where: { id: existing.id },
  });

  return jsonSaved({
    deleted: true,
    id: existing.id,
    key: existing.key,
  });
}

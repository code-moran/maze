import { requireAdmin, jsonOk, jsonSaved, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonOk({ products: [], categories: [] });
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { legacyId: "asc" },
    }),
    prisma.category.findMany({
      include: { subProducts: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return jsonOk({
    products: products.map((p) => ({
      id: p.legacyId,
      slug: p.slug || undefined,
      name: p.name,
      cat: p.category.key,
      catLabel: p.catLabel,
      subCat: p.subCat,
      shortDesc: p.shortDesc,
      desc: p.description,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      specs: p.specs,
      features: p.features,
      imgs: p.imageUrls,
    })),
    categories: categories.map((c) => ({
      key: c.key,
      title: c.title,
      description: c.description,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      icon: c.icon,
      subProducts: c.subProducts.map((s) => ({ id: s.subId, label: s.label })),
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
  if (!body?.name || !body?.cat) return jsonError("name and cat are required");

  const category = await prisma.category.findUnique({
    where: { key: String(body.cat) },
  });
  if (!category) return jsonError("Unknown category");

  const max = await prisma.product.aggregate({ _max: { legacyId: true } });
  const legacyId = (max._max.legacyId || 0) + 1;
  const slug = body.slug ? String(body.slug).trim() : null;

  const product = await prisma.product.create({
    data: {
      legacyId,
      name: String(body.name),
      slug,
      catLabel: String(body.catLabel || category.title),
      subCat: String(body.subCat || ""),
      shortDesc: String(body.shortDesc || ""),
      description: String(body.desc || body.description || ""),
      seoTitle: String(body.seoTitle || ""),
      seoDescription: String(body.seoDescription || ""),
      specs: body.specs ?? [],
      features: body.features ?? [],
      imageUrls: body.imgs ?? body.imageUrls ?? [],
      categoryId: category.id,
    },
    include: { category: true },
  });

  return jsonSaved({
    product: {
      id: product.legacyId,
      slug: product.slug || undefined,
      name: product.name,
      cat: product.category.key,
      catLabel: product.catLabel,
      subCat: product.subCat,
      shortDesc: product.shortDesc,
      desc: product.description,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      specs: product.specs,
      features: product.features,
      imgs: product.imageUrls,
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
  const id = Number(body?.id);
  if (!id) return jsonError("id is required");

  const category = await prisma.category.findUnique({
    where: { key: String(body.cat) },
  });
  if (!category) return jsonError("Unknown category");

  const slug = body.slug ? String(body.slug).trim() : null;

  const product = await prisma.product.update({
    where: { legacyId: id },
    data: {
      name: String(body.name || ""),
      slug,
      catLabel: String(body.catLabel || category.title),
      subCat: String(body.subCat || ""),
      shortDesc: String(body.shortDesc || ""),
      description: String(body.desc || body.description || ""),
      seoTitle: String(body.seoTitle || ""),
      seoDescription: String(body.seoDescription || ""),
      specs: body.specs ?? [],
      features: body.features ?? [],
      imageUrls: body.imgs ?? body.imageUrls ?? [],
      categoryId: category.id,
    },
    include: { category: true },
  });

  return jsonSaved({
    product: {
      id: product.legacyId,
      slug: product.slug || undefined,
      name: product.name,
      cat: product.category.key,
      catLabel: product.catLabel,
      subCat: product.subCat,
      shortDesc: product.shortDesc,
      desc: product.description,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      specs: product.specs,
      features: product.features,
      imgs: product.imageUrls,
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
  const id = Number(searchParams.get("id"));
  if (!id) return jsonError("id is required");

  await prisma.product.delete({ where: { legacyId: id } });
  return jsonSaved({});
}

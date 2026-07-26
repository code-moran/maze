import { requireAdmin, jsonOk, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Invalid body");

  const categoryKey = String(body.categoryKey || body.cat || "");
  if (!categoryKey) return jsonError("categoryKey is required");

  const category = await prisma.category.findUnique({
    where: { key: categoryKey },
  });
  if (!category) return jsonError("Unknown category");

  const items = Array.isArray(body.subProducts) ? body.subProducts : [];
  const db = prisma;

  await db.$transaction([
    db.subProduct.deleteMany({ where: { categoryId: category.id } }),
    ...items.map(
      (
        item: { id?: string; label?: string; subId?: string },
        index: number
      ) =>
        db.subProduct.create({
          data: {
            subId: String(item.id || item.subId || `sub-${index + 1}`),
            label: String(item.label || ""),
            sortOrder: index,
            categoryId: category.id,
          },
        })
    ),
  ]);

  const refreshed = await db.subProduct.findMany({
    where: { categoryId: category.id },
    orderBy: { sortOrder: "asc" },
  });

  return jsonOk({
    subProducts: refreshed.map((s) => ({ id: s.subId, label: s.label })),
  });
}

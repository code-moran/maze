import { requireAdmin, jsonOk, jsonSaved, jsonError } from "@/lib/admin/api";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonOk({ enquiries: [] });
  }

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return jsonOk({
    enquiries: enquiries.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      subject: row.subject,
      message: row.message,
      type: row.type || "GENERAL",
      productName: row.productName,
      serviceType: row.serviceType,
      preferredDate: row.preferredDate,
      location: row.location,
      status: row.status,
      created_at: row.createdAt,
    })),
  });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isDatabaseConfigured() || !prisma) {
    return jsonError("Database is not configured", 503);
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!id || !body?.status) return jsonError("id and status are required");

  const enquiry = await prisma.enquiry.update({
    where: { id },
    data: { status: String(body.status) },
  });

  return jsonSaved({
    enquiry: {
      id: enquiry.id,
      status: enquiry.status,
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

  await prisma.enquiry.delete({ where: { id } });
  return jsonSaved({});
}

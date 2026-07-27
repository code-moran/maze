import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequestAuthorized } from "@/lib/admin/auth";

export async function requireAdmin(
  request: Request
): Promise<NextResponse | null> {
  if (!(await isAdminRequestAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function triggerRevalidation() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath("/about");
    revalidatePath("/services");
    revalidatePath("/contact");
    revalidatePath("/blog");
    revalidatePath("/location");
  } catch (err) {
    console.warn("Revalidation warning:", err);
  }
}

export function jsonOk<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  triggerRevalidation();
  return NextResponse.json({ ok: true, ...data }, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { loadSiteContent } from "@/lib/content/loadSiteContent";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const data = await loadSiteContent();

  return (
    <AdminDashboard
      initialData={data}
      databaseConfigured={isDatabaseConfigured() && Boolean(prisma)}
    />
  );
}

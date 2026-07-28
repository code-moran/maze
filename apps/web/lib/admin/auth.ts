import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth/authOptions";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSecretConfigured,
  isAdminRequestAuthorized,
  verifyAdminSessionToken,
} from "@/lib/admin/session";

export {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSecretConfigured,
  isAdminRequestAuthorized,
  verifyAdminSessionToken,
};

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (session?.user) return true;

  try {
    const jar = await cookies();
    return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

import { cookies } from "next/headers";
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
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

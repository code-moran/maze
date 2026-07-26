import { redirect } from "next/navigation";

export default function LegacyEnquiriesRedirect() {
  redirect("/admin");
}

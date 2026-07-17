import { redirect } from "next/navigation";
import { getSession } from "./session";

/** Ensure the caller is a logged-in admin; otherwise redirect to login. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }
  return session;
}

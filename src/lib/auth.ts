import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { SESSION_COOKIE, verifySession } from "./session";

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Returns the session or redirects. Pass roles to restrict a page or action. */
export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (roles && !roles.includes(session.role)) redirect("/dashboard");
  return session;
}

export const STAFF: Role[] = ["ADMIN", "TEACHER", "ACCOUNTANT"];

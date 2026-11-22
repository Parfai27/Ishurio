import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Pages anyone may read without signing in. */
const PUBLIC_PAGES = new Set(["/privacy", "/terms", "/cookies"]);

export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }
  if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  // Public: the landing page at "/", its static files (anything with a file extension) and Next's own assets.
  matcher: ["/((?!_next|api/health|.*\\.[a-zA-Z0-9]+$).+)"],
};

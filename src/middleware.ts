import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  // Public: the landing page at "/", its static files (anything with a file extension) and Next's own assets.
  matcher: ["/((?!_next|api/health|.*\\.[a-zA-Z0-9]+$).+)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get("admin_session")?.value;

  if (pathname.startsWith("/admin/dashboard")) {
    if (adminCookie !== "verified") {
      const url = new URL("/admin", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard"],
};

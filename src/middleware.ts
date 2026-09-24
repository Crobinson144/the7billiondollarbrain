import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/account", "/members", "/admin"];

/** Fast redirect for signed-out visitors; pages still verify the session server-side. */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/")) && !req.cookies.get("bdb_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/members/:path*", "/admin/:path*"] };

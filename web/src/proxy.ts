import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi = pathname.startsWith("/api/admin/content");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  if (req.auth) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/favicon.ico") {
    const version = request.nextUrl.searchParams.get("v");
    const target = version
      ? `/brand-icon?v=${encodeURIComponent(version)}`
      : "/brand-icon";
    return NextResponse.rewrite(new URL(target, request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/favicon.ico",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

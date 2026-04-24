import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // TODO: Re-enable auth before production!
  // TEMPORARILY DISABLED FOR DEVELOPMENT
  // Protect admin routes
  // if (pathname.startsWith("/admin")) {
  //   if (!req.auth?.user?.isAdmin) {
  //     const signInUrl = new URL("/auth/signin", req.url);
  //     signInUrl.searchParams.set("callbackUrl", req.url);
  //     return NextResponse.redirect(signInUrl);
  //   }
  // }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!req.auth?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect cron routes with secret
  if (pathname.startsWith("/api/cron")) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/cron/:path*",
  ],
};

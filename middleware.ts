import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  SESSION_COOKIE_NAME,
  verifyEdgeSessionToken,
} from "@/lib/auth-edge";

export async function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const isPublicRoute =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(
      SESSION_COOKIE_NAME
    )?.value;

  const user =
    await verifyEdgeSessionToken(
      token
    );

  if (!user) {
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/battalions/:path*",
  ],
};
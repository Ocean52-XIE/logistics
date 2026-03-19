import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE_KEY } from "./lib/auth-constants";

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/learning-paths",
  "/courses",
  "/lessons",
  "/exams",
  "/knowledge-base",
  "/certifications",
  "/my-progress",
  "/notifications",
  "/profile",
  "/admin"
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginPath = pathname === "/login";
  const needsAuth = isProtectedPath(pathname);

  if (!isLoginPath && !needsAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  if (!token) {
    if (needsAuth) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }

  const payload = parseJwtPayload(token);
  const isTokenExpired =
    typeof payload?.exp === "number" &&
    payload.exp <= Math.floor(Date.now() / 1000);
  if (!payload || isTokenExpired) {
    if (needsAuth) {
      const response = redirectToLogin(request);
      clearTokenCookie(response);
      return response;
    }
    const response = NextResponse.next();
    clearTokenCookie(response);
    return response;
  }

  if (isLoginPath) {
    return NextResponse.redirect(new URL(resolveHomeRoute(payload.role), request.url));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (payload.role !== "admin") {
      const fallbackPath = search ? `/dashboard${search}` : "/dashboard";
      return NextResponse.redirect(new URL(fallbackPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/learning-paths/:path*",
    "/courses/:path*",
    "/lessons/:path*",
    "/exams/:path*",
    "/knowledge-base/:path*",
    "/certifications/:path*",
    "/my-progress/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/admin"
  ]
};

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(loginUrl);
}

function clearTokenCookie(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE_KEY, "", {
    maxAge: 0,
    path: "/"
  });
}

function parseJwtPayload(token: string): { role: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const payloadPart = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      payloadPart + "=".repeat((4 - (payloadPart.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json) as { role?: string; exp?: number };

    if (!payload || typeof payload.role !== "string") {
      return null;
    }

    return {
      role: payload.role,
      exp: typeof payload.exp === "number" ? payload.exp : undefined
    };
  } catch {
    return null;
  }
}

function resolveHomeRoute(role: string): string {
  if (role === "admin") {
    return "/admin";
  }
  return "/dashboard";
}

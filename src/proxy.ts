import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { IS_DEMO as DEMO } from "@/lib/mode";

/**
 * Proxy de autenticación y autorización por rol.
 * - /app/*   → requiere sesión (cualquier rol).
 * - /admin/* → requiere rol "admin".
 * Las rutas públicas (landing, clases, precios, etc.) quedan abiertas.
 */
const isAppRoute = createRouteMatcher(["/app(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

/** En modo demo no usamos Clerk: el rol vive en la cookie `demo_role`. */
function demoProxy(req: NextRequest) {
  if (isAdminRoute(req)) {
    const role = req.cookies.get("demo_role")?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }
  return NextResponse.next();
}

const clerkAuthProxy = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isAppRoute(req) || isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  if (isAdminRoute(req)) {
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  return NextResponse.next();
});

export default DEMO ? demoProxy : clerkAuthProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

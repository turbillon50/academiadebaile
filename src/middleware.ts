import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Middleware de autenticación y autorización por rol.
 * - /app/*   → requiere sesión (cualquier rol).
 * - /admin/* → requiere rol "admin".
 * Las rutas públicas (landing, clases, precios, etc.) quedan abiertas.
 */
const isAppRoute = createRouteMatcher(["/app(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isAppRoute(req) || isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  if (isAdminRoute(req)) {
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (metadata?.role !== "admin") {
      // Sin permisos de admin: lo mandamos a su panel de alumno.
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Excluye assets estáticos e internos de Next; incluye API.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

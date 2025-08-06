import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Permite el acceso libre a la ruta de login
  if (request.nextUrl.pathname.startsWith("/auth/signin")) {
    return NextResponse.next();
  }

  // Si no hay token, redirige al login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Si hay token, permite continuar
  return NextResponse.next();
}

// Opcional: define las rutas protegidas
export const config = {
  matcher: [
    "/((?!_next|api|auth/signin|favicon.ico|images).*)",
  ],
};
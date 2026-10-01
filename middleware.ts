import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "nails_admin_session";

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= 32 ? s : "dev-only-insecure-secret-change-me-0000000000";
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Verifica la firma HMAC-SHA256 y la expiración del token (compatible con Edge).
 * Devuelve el payload decodificado si es válido, o null.
 */
async function verifyToken(token: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSecret()) as unknown as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(signature) as unknown as BufferSource,
      new TextEncoder().encode(`${header}.${payload}`) as unknown as BufferSource
    );
    if (!valid) return null;

    const decoded = JSON.parse(
      new TextDecoder().decode(b64urlToBytes(payload) as unknown as BufferSource)
    );
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function isManager(rol?: string): boolean {
  return rol === "OWNER" || rol === "ADMIN";
}

// Secciones reservadas a la dueña / administración (las trabajadoras no acceden).
const MANAGER_PAGE_PREFIXES = [
  "/admin/caja",
  "/admin/clientes",
  "/admin/servicios",
  "/admin/publicaciones",
  "/admin/galeria",
  "/admin/faq",
  "/admin/testimonios",
  "/admin/horarios",
  "/admin/equipo",
  "/admin/configuracion",
];

const MANAGER_API_PREFIXES = [
  "/api/admin/settings",
  "/api/admin/services",
  "/api/admin/faq",
  "/api/admin/gallery",
  "/api/admin/posts",
  "/api/admin/staff",
  "/api/admin/customers",
  "/api/admin/business-hours",
  "/api/admin/timeblocks",
  "/api/admin/upload",
  "/api/admin/users",
  "/api/admin/testimonials",
  "/api/admin/caja",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea =
    (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) ||
    pathname.startsWith("/api/admin");

  // Las rutas de login/logout de la API no requieren sesión.
  if (
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout")
  ) {
    return NextResponse.next();
  }

  if (!isAdminArea) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  const isApi = pathname.startsWith("/api/");

  // No autenticado
  if (!payload) {
    if (isApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado pero sin permisos de administración
  const manager = isManager(payload.rol);

  if (!manager) {
    const dashboardBlocked = pathname === "/admin";
    const pageBlocked = MANAGER_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
    const apiBlocked = MANAGER_API_PREFIXES.some((p) => pathname.startsWith(p));

    if (apiBlocked) {
      return NextResponse.json(
        { error: "No tienes permiso para esta acción." },
        { status: 403 }
      );
    }
    if (dashboardBlocked || pageBlocked) {
      return NextResponse.redirect(new URL("/admin/citas", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

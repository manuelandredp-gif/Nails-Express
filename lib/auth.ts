import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { JwtService, SessionPayload } from "./infrastructure/security/jwt.service";
import { isManagerRol } from "./domain/constants";

export type AdminSession = Omit<SessionPayload, "exp">;

const COOKIE_NAME = "nails_admin_session";

/** OWNER y ADMIN tienen acceso total (caja, edición, configuración). */
export function isManager(rol?: string | null): boolean {
  return isManagerRol(rol);
}

/** Páginas solo para dueña/admin: redirige a las trabajadoras a su vista de citas. */
export async function requireManager(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.rol)) redirect("/admin/citas");
  return session;
}

/** Páginas para cualquier usuario logueado (incluye trabajadoras). */
export async function requireSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = JwtService.verify(token);
  if (!verified) return null;

  // Verify user still exists and is active in database
  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
  });

  if (!user || !user.activo) return null;

  // Sesión invalidada (p. ej. tras cambiar la contraseña): el token quedó viejo.
  if ((verified.tokenVersion ?? 0) !== user.tokenVersion) return null;

  return {
    userId: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol as any,
    staffId: user.staffId,
  };
}

export async function setAdminSession(user: {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  staffId?: string | null;
  tokenVersion?: number;
}) {
  const token = JwtService.sign(
    {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol as any,
      staffId: user.staffId,
      tokenVersion: user.tokenVersion ?? 0,
    },
    2 // la sesión del panel dura 2 días
  );

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // el panel admin no se enlaza desde sitios externos → anti-CSRF
    path: "/",
    maxAge: 60 * 60 * 24 * 2, // 2 días (sesión más corta)
  });
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

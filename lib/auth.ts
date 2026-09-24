import { cookies } from "next/headers";
import { prisma } from "./db";

export interface AdminSession {
  userId: string;
  email: string;
  nombre: string;
  rol: "OWNER" | "ADMIN" | "RECEPCION" | "MANICURISTA";
  staffId?: string | null;
}

const COOKIE_NAME = "nails_admin_session";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    ) as AdminSession;

    // Verify user is active in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.activo) return null;

    return {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol as any,
      staffId: user.staffId,
    };
  } catch (err) {
    return null;
  }
}

export async function setAdminSession(user: {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  staffId?: string | null;
}) {
  const sessionData: AdminSession = {
    userId: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol as any,
    staffId: user.staffId,
  };

  const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

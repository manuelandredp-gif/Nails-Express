import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/infrastructure/security/password";
import { withManager, readJson, HttpError } from "@/lib/http/api";
import { userPatchSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** Actualiza una trabajadora: activar/desactivar, cambiar nombre, rol, reasignar staff o resetear contraseña. */
export const PATCH = withManager(async (req, { params }, session) => {
  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) throw new HttpError(404, "Usuario no encontrado.");

  // La cuenta de la dueña (OWNER) y la propia cuenta no se tocan desde aquí.
  if (target.rol === "OWNER" || target.id === session.userId) {
    throw new HttpError(403, "Esta cuenta no se puede modificar desde aquí.");
  }

  const body = await readJson(req, userPatchSchema);
  const data: Record<string, unknown> = {};
  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.activo !== undefined) data.activo = body.activo;
  if (body.staffId !== undefined) data.staffId = body.staffId ?? null;
  if (body.rol !== undefined) data.rol = body.rol;
  if (body.password) {
    data.passwordHash = hashPassword(body.password);
    data.tokenVersion = { increment: 1 }; // cierra las sesiones abiertas de esa cuenta
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, nombre: true, email: true, rol: true, activo: true, staffId: true, createdAt: true },
  });

  return NextResponse.json({ success: true, user });
});

/** Elimina el acceso de una trabajadora. */
export const DELETE = withManager(async (_req, { params }, session) => {
  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) throw new HttpError(404, "Usuario no encontrado.");
  if (target.rol === "OWNER" || target.id === session.userId) {
    throw new HttpError(403, "Esta cuenta no se puede eliminar desde aquí.");
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});

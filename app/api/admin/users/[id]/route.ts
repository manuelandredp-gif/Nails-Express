import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isManager } from "@/lib/auth";
import { hashPassword } from "@/lib/infrastructure/security/password";

export const dynamic = "force-dynamic";

/** Actualiza una trabajadora: activar/desactivar, cambiar nombre, resetear contraseña o reasignar staff. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Solo se pueden gestionar trabajadoras desde aquí (no otras dueñas/admins).
    if (isManager(target.rol)) {
      return NextResponse.json(
        { error: "No se puede modificar una cuenta de administración desde aquí." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data: any = {};

    if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
    if (body.activo !== undefined) data.activo = Boolean(body.activo);
    if (body.staffId !== undefined)
      data.staffId = body.staffId ? String(body.staffId) : null;
    if (body.password) {
      if (String(body.password).length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres." },
          { status: 400 }
        );
      }
      data.passwordHash = hashPassword(String(body.password));
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        staffId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar la trabajadora." },
      { status: 500 }
    );
  }
}

/** Elimina el acceso de una trabajadora. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }
    if (isManager(target.rol)) {
      return NextResponse.json(
        { error: "No se puede eliminar una cuenta de administración." },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar la trabajadora." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isManager } from "@/lib/auth";
import { hashPassword } from "@/lib/infrastructure/security/password";

export const dynamic = "force-dynamic";

/** Lista los usuarios con acceso al panel (dueña, admin y trabajadoras). */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
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

    const staff = await prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    });

    return NextResponse.json({ users, staff });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar el equipo." },
      { status: 500 }
    );
  }
}

/** Crea la cuenta de acceso de una empleada con el rol que asigne la administración. */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const staffId = body.staffId ? String(body.staffId) : null;

    // Rol asignado por la administración
    const ROLES_PERMITIDOS = ["MANICURISTA", "RECEPCION", "ADMIN"];
    const rol = ROLES_PERMITIDOS.includes(String(body.rol))
      ? String(body.rol)
      : "MANICURISTA";

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo." },
        { status: 409 }
      );
    }

    // Una manicurista solo puede tener una cuenta de acceso.
    if (staffId) {
      const yaVinculada = await prisma.user.findFirst({ where: { staffId } });
      if (yaVinculada) {
        return NextResponse.json(
          { error: "Esa manicurista ya tiene una cuenta de acceso." },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash: hashPassword(password),
        rol,
        staffId,
        activo: true,
      },
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

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al crear la trabajadora." },
      { status: 500 }
    );
  }
}

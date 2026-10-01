import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import {
  hashPassword,
  verifyPassword,
} from "@/lib/infrastructure/security/password";

export const dynamic = "force-dynamic";

/** Permite a cualquier usuario logueado cambiar su propia contraseña. */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { actual, nueva } = await request.json();
    if (!actual || !nueva) {
      return NextResponse.json(
        { error: "Ingresa tu contraseña actual y la nueva." },
        { status: 400 }
      );
    }
    if (String(nueva).length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    if (!verifyPassword(String(actual), user.passwordHash)) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(String(nueva)) },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al cambiar la contraseña." },
      { status: 500 }
    );
  }
}

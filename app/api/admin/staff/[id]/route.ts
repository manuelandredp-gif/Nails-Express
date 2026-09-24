import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { nombre, color, bio, activo } = await request.json();
    const dataToUpdate: any = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre;
    if (color !== undefined) dataToUpdate.color = color;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar manicurista." },
      { status: 500 }
    );
  }
}

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

    const { pregunta, respuesta, visible } = await request.json();
    const dataToUpdate: any = {};
    if (pregunta !== undefined) dataToUpdate.pregunta = pregunta;
    if (respuesta !== undefined) dataToUpdate.respuesta = respuesta;
    if (visible !== undefined) dataToUpdate.visible = visible;

    const faq = await prisma.faq.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, faq });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar pregunta frecuente." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.faq.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar FAQ." },
      { status: 500 }
    );
  }
}

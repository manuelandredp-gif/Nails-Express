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

    const { visible, categoria, altText } = await request.json();
    const dataToUpdate: any = {};
    if (visible !== undefined) dataToUpdate.visible = visible;
    if (categoria !== undefined) dataToUpdate.categoria = categoria;
    if (altText !== undefined) dataToUpdate.altText = altText;

    const item = await prisma.galleryItem.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar imagen." },
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

    await prisma.galleryItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar imagen." },
      { status: 500 }
    );
  }
}

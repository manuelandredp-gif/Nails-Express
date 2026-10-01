import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

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

    const body = await request.json();
    const {
      titulo,
      slug,
      extracto,
      contenidoHtml,
      imagenPortada,
      categoria,
      estado,
      destacado,
    } = body;

    const dataToUpdate: any = {};
    if (titulo !== undefined) dataToUpdate.titulo = titulo;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (extracto !== undefined) dataToUpdate.extracto = extracto;
    if (contenidoHtml !== undefined)
      dataToUpdate.contenidoHtml = contenidoHtml;
    if (imagenPortada !== undefined)
      dataToUpdate.imagenPortada = imagenPortada;
    if (categoria !== undefined) dataToUpdate.categoria = categoria;
    if (estado !== undefined) dataToUpdate.estado = estado;
    if (destacado !== undefined) dataToUpdate.destacado = Boolean(destacado);

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, post: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar post." },
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

    await prisma.post.delete({ where: { id: params.id } });
    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar post." },
      { status: 500 }
    );
  }
}

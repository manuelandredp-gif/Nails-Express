import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isManager } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const data: any = {};
    if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
    if (body.texto !== undefined) data.texto = String(body.texto).trim();
    if (body.servicio !== undefined)
      data.servicio = body.servicio ? String(body.servicio).trim() : null;
    if (body.avatar !== undefined)
      data.avatar = body.avatar ? String(body.avatar).trim() : null;
    if (body.visible !== undefined) data.visible = Boolean(body.visible);
    if (body.estrellas !== undefined)
      data.estrellas = Math.min(5, Math.max(1, parseInt(String(body.estrellas), 10) || 5));
    if (body.orden !== undefined) data.orden = parseInt(String(body.orden), 10) || 0;

    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data,
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, testimonial });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar testimonio." },
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
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.testimonial.delete({ where: { id: params.id } });
    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar testimonio." },
      { status: 500 }
    );
  }
}

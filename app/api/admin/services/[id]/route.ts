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
      nombre,
      precio,
      precioDesde,
      duracionMinutos,
      bufferMinutos,
      descripcionCorta,
      descripcionLarga,
      activo,
      destacado,
      imagenPrincipal,
      staffIds,
    } = body;

    const dataToUpdate: any = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre;
    if (precio !== undefined) dataToUpdate.precio = parseFloat(precio);
    if (precioDesde !== undefined) dataToUpdate.precioDesde = Boolean(precioDesde);
    if (duracionMinutos !== undefined)
      dataToUpdate.duracionMinutos = parseInt(duracionMinutos, 10);
    if (bufferMinutos !== undefined)
      dataToUpdate.bufferMinutos = parseInt(bufferMinutos, 10);
    if (descripcionCorta !== undefined)
      dataToUpdate.descripcionCorta = descripcionCorta;
    if (descripcionLarga !== undefined)
      dataToUpdate.descripcionLarga = descripcionLarga;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);
    if (destacado !== undefined) dataToUpdate.destacado = Boolean(destacado);
    if (imagenPrincipal !== undefined)
      dataToUpdate.imagenPrincipal = imagenPrincipal;

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    if (staffIds && Array.isArray(staffIds)) {
      await prisma.staffService.deleteMany({
        where: { serviceId: params.id },
      });
      for (const stId of staffIds) {
        await prisma.staffService.create({
          data: { staffId: stId, serviceId: params.id },
        });
      }
    }

    revalidatePublicSite();
    return NextResponse.json({ success: true, service: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar servicio." },
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

    await prisma.service.delete({ where: { id: params.id } });
    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar servicio." },
      { status: 500 }
    );
  }
}

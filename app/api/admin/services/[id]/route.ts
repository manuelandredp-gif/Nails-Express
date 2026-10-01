import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager } from "@/lib/http/api";

export const dynamic = "force-dynamic";

export const PATCH = withManager(async (req, { params }) => {
  const body = await req.json().catch(() => ({}));
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

  const data: Record<string, unknown> = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (precio !== undefined) data.precio = parseFloat(precio);
  if (precioDesde !== undefined) data.precioDesde = Boolean(precioDesde);
  if (duracionMinutos !== undefined) data.duracionMinutos = parseInt(duracionMinutos, 10);
  if (bufferMinutos !== undefined) data.bufferMinutos = parseInt(bufferMinutos, 10);
  if (descripcionCorta !== undefined) data.descripcionCorta = descripcionCorta;
  if (descripcionLarga !== undefined) data.descripcionLarga = descripcionLarga;
  if (activo !== undefined) data.activo = Boolean(activo);
  if (destacado !== undefined) data.destacado = Boolean(destacado);
  if (imagenPrincipal !== undefined) data.imagenPrincipal = imagenPrincipal;

  const updated = await prisma.service.update({ where: { id: params.id }, data });

  if (staffIds && Array.isArray(staffIds)) {
    await prisma.staffService.deleteMany({ where: { serviceId: params.id } });
    for (const stId of staffIds) {
      await prisma.staffService.create({ data: { staffId: stId, serviceId: params.id } });
    }
  }

  revalidatePublicSite();
  return NextResponse.json({ success: true, service: updated });
});

export const DELETE = withManager(async (_req, { params }) => {
  await prisma.service.delete({ where: { id: params.id } });
  revalidatePublicSite();
  return NextResponse.json({ success: true });
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";
import { staffPatchSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const PATCH = withManager(async (req, { params }) => {
  const b = await readJson(req, staffPatchSchema);
  const data: Record<string, unknown> = {};
  if (b.nombre !== undefined) data.nombre = b.nombre;
  if (b.color !== undefined) data.color = b.color;
  if (b.bio !== undefined) data.bio = b.bio;
  if (b.foto) data.foto = b.foto;
  if (b.activo !== undefined) data.activo = b.activo;
  if (b.dni !== undefined) data.dni = b.dni || null;
  if (b.telefono !== undefined) data.telefono = b.telefono || null;
  if (b.email !== undefined) data.email = b.email || null;
  if (b.direccion !== undefined) data.direccion = b.direccion || null;

  const staff = await prisma.staff.update({ where: { id: params.id }, data });
  revalidatePublicSite();
  return NextResponse.json({ success: true, staff });
});

/**
 * Elimina a la empleada. Si tiene citas registradas no se puede borrar
 * (se perdería el historial): en ese caso se desactiva.
 */
export const DELETE = withManager(async (_req, { params }) => {
  const citas = await prisma.appointment.count({ where: { staffId: params.id } });

  // Siempre se elimina su cuenta de acceso.
  await prisma.user.deleteMany({ where: { staffId: params.id } });

  if (citas > 0) {
    await prisma.staff.update({ where: { id: params.id }, data: { activo: false } });
    revalidatePublicSite();
    return NextResponse.json({
      success: true,
      desactivada: true,
      mensaje: `Tiene ${citas} citas en el historial, así que se desactivó (no aparecerá en la agenda ni en la web).`,
    });
  }

  await prisma.staffService.deleteMany({ where: { staffId: params.id } });
  await prisma.timeBlock.deleteMany({ where: { staffId: params.id } });
  await prisma.staff.delete({ where: { id: params.id } });

  revalidatePublicSite();
  return NextResponse.json({ success: true, desactivada: false });
});

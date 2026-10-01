import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";
import { testimonialPatchSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const PATCH = withManager(async (req, { params }) => {
  const b = await readJson(req, testimonialPatchSchema);
  const data: Record<string, unknown> = {};
  if (b.nombre !== undefined) data.nombre = b.nombre;
  if (b.texto !== undefined) data.texto = b.texto;
  if (b.servicio !== undefined) data.servicio = b.servicio || null;
  if (b.avatar !== undefined) data.avatar = b.avatar || null;
  if (b.visible !== undefined) data.visible = b.visible;
  if (b.estrellas !== undefined) data.estrellas = b.estrellas;
  if (b.orden !== undefined) data.orden = b.orden;

  const testimonial = await prisma.testimonial.update({ where: { id: params.id }, data });
  revalidatePublicSite();
  return NextResponse.json({ success: true, testimonial });
});

export const DELETE = withManager(async (_req, { params }) => {
  await prisma.testimonial.delete({ where: { id: params.id } });
  revalidatePublicSite();
  return NextResponse.json({ success: true });
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager } from "@/lib/http/api";

export const dynamic = "force-dynamic";

export const PATCH = withManager(async (req, { params }) => {
  const body = await req.json().catch(() => ({}));
  const { titulo, slug, extracto, contenidoHtml, imagenPortada, categoria, estado, destacado } = body;

  const data: Record<string, unknown> = {};
  if (titulo !== undefined) data.titulo = titulo;
  if (slug !== undefined) data.slug = slug;
  if (extracto !== undefined) data.extracto = extracto;
  if (contenidoHtml !== undefined) data.contenidoHtml = contenidoHtml;
  if (imagenPortada !== undefined) data.imagenPortada = imagenPortada;
  if (categoria !== undefined) data.categoria = categoria;
  if (estado !== undefined) data.estado = estado;
  if (destacado !== undefined) data.destacado = Boolean(destacado);

  const updated = await prisma.post.update({ where: { id: params.id }, data });
  revalidatePublicSite();
  return NextResponse.json({ success: true, post: updated });
});

export const DELETE = withManager(async (_req, { params }) => {
  await prisma.post.delete({ where: { id: params.id } });
  revalidatePublicSite();
  return NextResponse.json({ success: true });
});

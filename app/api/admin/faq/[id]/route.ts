import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const faqPatch = z
  .object({
    pregunta: z.string().trim().min(1).max(500).optional(),
    respuesta: z.string().trim().min(1).max(5000).optional(),
    visible: z.boolean().optional(),
  })
  .strict();

export const PATCH = withManager(async (req, { params }) => {
  const b = await readJson(req, faqPatch);
  const data: Record<string, unknown> = {};
  if (b.pregunta !== undefined) data.pregunta = b.pregunta;
  if (b.respuesta !== undefined) data.respuesta = b.respuesta;
  if (b.visible !== undefined) data.visible = b.visible;

  const faq = await prisma.faq.update({ where: { id: params.id }, data });
  revalidatePublicSite();
  return NextResponse.json({ success: true, faq });
});

export const DELETE = withManager(async (_req, { params }) => {
  await prisma.faq.delete({ where: { id: params.id } });
  revalidatePublicSite();
  return NextResponse.json({ success: true });
});

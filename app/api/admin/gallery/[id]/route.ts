import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const galleryPatch = z
  .object({
    visible: z.boolean().optional(),
    categoria: z.string().trim().max(60).optional(),
    altText: z.string().trim().max(200).optional(),
  })
  .strict();

export const PATCH = withManager(async (req, { params }) => {
  const b = await readJson(req, galleryPatch);
  const data: Record<string, unknown> = {};
  if (b.visible !== undefined) data.visible = b.visible;
  if (b.categoria !== undefined) data.categoria = b.categoria;
  if (b.altText !== undefined) data.altText = b.altText;

  const item = await prisma.galleryItem.update({ where: { id: params.id }, data });
  revalidatePublicSite();
  return NextResponse.json({ success: true, item });
});

export const DELETE = withManager(async (_req, { params }) => {
  await prisma.galleryItem.delete({ where: { id: params.id } });
  revalidatePublicSite();
  return NextResponse.json({ success: true });
});

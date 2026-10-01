import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const galleryCreate = z.object({
  imagen: z.string().trim().min(1),
  categoria: z.string().trim().max(60).optional(),
  altText: z.string().trim().max(200).optional(),
});

export const GET = withManager(async () => {
  const items = await prisma.galleryItem.findMany({ orderBy: { orden: "asc" } });
  return NextResponse.json({ items });
});

export const POST = withManager(async (req) => {
  const { imagen, categoria, altText } = await readJson(req, galleryCreate);
  const count = await prisma.galleryItem.count();
  const item = await prisma.galleryItem.create({
    data: {
      imagen,
      categoria: categoria || "Manicure",
      altText: altText || "Diseño Nails Express",
      orden: count + 1,
      visible: true,
    },
  });
  revalidatePublicSite();
  return NextResponse.json({ success: true, item }, { status: 201 });
});

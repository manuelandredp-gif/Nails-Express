import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";
import { testimonialCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const GET = withManager(async () => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { orden: "asc" } });
  return NextResponse.json({ testimonials });
});

export const POST = withManager(async (req) => {
  const b = await readJson(req, testimonialCreateSchema);
  const count = await prisma.testimonial.count();

  const testimonial = await prisma.testimonial.create({
    data: {
      nombre: b.nombre,
      texto: b.texto,
      estrellas: b.estrellas ?? 5,
      servicio: b.servicio || null,
      avatar: b.avatar || null,
      visible: b.visible === undefined ? true : b.visible,
      orden: count + 1,
    },
  });

  revalidatePublicSite();
  return NextResponse.json({ success: true, testimonial }, { status: 201 });
});

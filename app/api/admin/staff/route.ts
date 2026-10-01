import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";
import { staffCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const GET = withManager(async () => {
  const staff = await prisma.staff.findMany({
    include: { servicios: { include: { service: true } } },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json({ staff });
});

export const POST = withManager(async (req) => {
  const b = await readJson(req, staffCreateSchema);
  const count = await prisma.staff.count();

  const staff = await prisma.staff.create({
    data: {
      nombre: b.nombre,
      foto: b.foto || "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400",
      color: b.color || "#5CC6BF",
      bio: b.bio || "Manicurista profesional",
      dni: b.dni || null,
      telefono: b.telefono || null,
      email: b.email || null,
      direccion: b.direccion || null,
      activo: true,
      orden: count + 1,
    },
  });

  revalidatePublicSite();
  return NextResponse.json({ success: true, staff }, { status: 201 });
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, HttpError } from "@/lib/http/api";

export const dynamic = "force-dynamic";

export const GET = withManager(async () => {
  const services = await prisma.service.findMany({
    include: { category: true, staff: { include: { staff: true } } },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json({ services });
});

export const POST = withManager(async (req) => {
  const body = await req.json().catch(() => ({}));
  const {
    nombre,
    slug,
    categoryId,
    precio,
    precioDesde,
    duracionMinutos,
    bufferMinutos,
    descripcionCorta,
    descripcionLarga,
    imagenPrincipal,
    caracteristicas,
    coloresPopulares,
    destacado,
    activo,
    staffIds = [],
  } = body;

  if (!nombre || !categoryId) {
    throw new HttpError(400, "Nombre y categoría son obligatorios.");
  }

  const service = await prisma.service.create({
    data: {
      nombre,
      slug:
        slug ||
        String(nombre)
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      categoryId,
      precio: parseFloat(precio),
      precioDesde: Boolean(precioDesde),
      duracionMinutos: parseInt(duracionMinutos, 10),
      bufferMinutos: parseInt(bufferMinutos, 10) || 15,
      descripcionCorta: descripcionCorta || "",
      descripcionLarga: descripcionLarga || "",
      imagenPrincipal:
        imagenPrincipal ||
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
      caracteristicas: JSON.stringify(caracteristicas || []),
      coloresPopulares: JSON.stringify(coloresPopulares || []),
      destacado: Boolean(destacado),
      activo: activo !== undefined ? Boolean(activo) : true,
    },
  });

  for (const stId of staffIds) {
    await prisma.staffService.create({ data: { staffId: stId, serviceId: service.id } });
  }

  revalidatePublicSite();
  return NextResponse.json({ success: true, service }, { status: 201 });
});

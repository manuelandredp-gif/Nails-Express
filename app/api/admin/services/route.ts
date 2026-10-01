import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: true,
        staff: { include: { staff: true } },
      },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar servicios." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
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

    const service = await prisma.service.create({
      data: {
        nombre,
        slug:
          slug ||
          nombre
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

    // Assign staff
    for (const stId of staffIds) {
      await prisma.staffService.create({
        data: { staffId: stId, serviceId: service.id },
      });
    }

    revalidatePublicSite();
    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating service:", err);
    return NextResponse.json(
      { error: err.message || "Error al crear servicio." },
      { status: 500 }
    );
  }
}

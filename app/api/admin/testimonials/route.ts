import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isManager } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { orden: "asc" },
    });
    return NextResponse.json({ testimonials });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar testimonios." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const texto = String(body.texto || "").trim();
    if (!nombre || !texto) {
      return NextResponse.json(
        { error: "Nombre y testimonio son obligatorios." },
        { status: 400 }
      );
    }

    const count = await prisma.testimonial.count();
    const estrellas = Math.min(5, Math.max(1, parseInt(String(body.estrellas ?? 5), 10) || 5));

    const testimonial = await prisma.testimonial.create({
      data: {
        nombre,
        texto,
        estrellas,
        servicio: body.servicio ? String(body.servicio).trim() : null,
        avatar: body.avatar ? String(body.avatar).trim() : null,
        visible: body.visible === undefined ? true : Boolean(body.visible),
        orden: count + 1,
      },
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al crear testimonio." },
      { status: 500 }
    );
  }
}

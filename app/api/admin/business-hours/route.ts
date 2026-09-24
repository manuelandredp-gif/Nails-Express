import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hours = await prisma.businessHours.findMany({
      orderBy: { diaSemana: "asc" },
    });
    return NextResponse.json({ hours });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al obtener horarios." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { hours } = await request.json();

    for (const h of hours) {
      await prisma.businessHours.update({
        where: { id: h.id },
        data: {
          horaApertura: h.horaApertura,
          horaCierre: h.horaCierre,
          cerrado: Boolean(h.cerrado),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar horarios." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al obtener configuración." },
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

    const body = await request.json();

    const updated = await prisma.settings.update({
      where: { id: "default" },
      data: {
        nombreNegocio: body.nombreNegocio,
        telefono: body.telefono,
        whatsapp: body.whatsapp,
        email: body.email,
        direccion: body.direccion,
        horarioVisible: body.horarioVisible,
        moneda: body.moneda,
        anticipacionMinimaHoras: parseInt(body.anticipacionMinimaHoras, 10),
        maximoDiasAdelante: parseInt(body.maximoDiasAdelante, 10),
        intervaloSlotsMinutos: parseInt(body.intervaloSlotsMinutos, 10),
        horasLimiteCancelacion: parseInt(body.horasLimiteCancelacion, 10),
        heroKicker: body.heroKicker,
        heroTitulo: body.heroTitulo,
        heroSubtitulo: body.heroSubtitulo,
        heroBoton: body.heroBoton,
        nosotrosTitulo: body.nosotrosTitulo,
        nosotrosTexto: body.nosotrosTexto,
        nosotrosBoton: body.nosotrosBoton,
        metricasClientes: body.metricasClientes,
        metricasCalificacion: body.metricasCalificacion,
        metricasAnos: body.metricasAnos,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar configuración." },
      { status: 500 }
    );
  }
}

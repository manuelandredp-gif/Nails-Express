import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Mantenimiento: borra los datos de PRUEBA para empezar a usar el sistema
 * con datos reales. Solo dueña/admin y con confirmación explícita.
 *
 * Borra: citas (y su historial), premios y clientas.
 * Con `incluirManicuristas: true` borra también las manicuristas de ejemplo,
 * sus cuentas de acceso, sus bloqueos de horario y sus vínculos con servicios.
 * NO toca: servicios, configuración, testimonios, galería, blog ni FAQs.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.confirmar !== "BORRAR PRUEBAS") {
      return NextResponse.json(
        {
          error:
            'Confirmación requerida: envía { "confirmar": "BORRAR PRUEBAS" }.',
        },
        { status: 400 }
      );
    }
    const incluirManicuristas = Boolean(body.incluirManicuristas);

    // Conteos previos (para informar qué se borró)
    const [citas, clientas, premios, manicuristas] = await Promise.all([
      prisma.appointment.count(),
      prisma.customer.count(),
      prisma.reward.count(),
      prisma.staff.count(),
    ]);

    const ops = [
      prisma.appointmentLog.deleteMany({}),
      prisma.appointment.deleteMany({}),
      prisma.reward.deleteMany({}),
      prisma.customer.deleteMany({}),
    ];

    if (incluirManicuristas) {
      ops.push(
        // Cuentas de acceso de trabajadoras vinculadas a una manicurista
        prisma.user.deleteMany({ where: { staffId: { not: null } } }) as any,
        prisma.staffService.deleteMany({}) as any,
        prisma.timeBlock.deleteMany({}) as any,
        prisma.staff.deleteMany({}) as any
      );
    }

    await prisma.$transaction(ops);

    return NextResponse.json({
      success: true,
      borrado: {
        citas,
        clientas,
        premios,
        manicuristas: incluirManicuristas ? manicuristas : 0,
      },
    });
  } catch (err: any) {
    console.error("Error en mantenimiento:", err);
    return NextResponse.json(
      { error: "Error al limpiar los datos de prueba." },
      { status: 500 }
    );
  }
}

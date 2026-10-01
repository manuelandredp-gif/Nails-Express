import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { withManager, readJson } from "@/lib/http/api";
import { maintenanceSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/**
 * Mantenimiento: borra los datos de PRUEBA para empezar con datos reales.
 * Solo dueña/admin, con confirmación explícita (validada por el esquema).
 * NO toca: servicios, configuración, testimonios, galería, blog ni FAQs.
 */
export const POST = withManager(async (req) => {
  const { incluirManicuristas } = await readJson(req, maintenanceSchema);

  const [citas, clientas, premios, manicuristas] = await Promise.all([
    prisma.appointment.count(),
    prisma.customer.count(),
    prisma.reward.count(),
    prisma.staff.count(),
  ]);

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.appointmentLog.deleteMany({}),
    prisma.appointment.deleteMany({}),
    prisma.reward.deleteMany({}),
    prisma.customer.deleteMany({}),
  ];

  if (incluirManicuristas) {
    ops.push(
      prisma.user.deleteMany({ where: { staffId: { not: null } } }),
      prisma.staffService.deleteMany({}),
      prisma.timeBlock.deleteMany({}),
      prisma.staff.deleteMany({})
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
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookingService } from "@/lib/application/booking.service";
import { withSession, HttpError } from "@/lib/http/api";
import { soloVeSusCitas } from "@/lib/domain/constants";

export const dynamic = "force-dynamic";

export const GET = withSession(async (req, _ctx, session) => {
  const { searchParams } = new URL(req.url);
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  const staffId = searchParams.get("staffId");
  const status = searchParams.get("status");

  const whereClause: Record<string, unknown> = {};

  // Las manicuristas vinculadas solo ven sus propias citas (Recepción, todas).
  if (soloVeSusCitas(session.rol) && session.staffId) {
    whereClause.staffId = session.staffId;
  } else if (staffId && staffId !== "all") {
    whereClause.staffId = staffId;
  }

  if (startStr && endStr) {
    whereClause.startAt = { gte: new Date(startStr), lte: new Date(endStr) };
  }
  if (status && status !== "all") {
    whereClause.estado = status;
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      customer: true,
      service: true,
      staff: true,
      logs: { orderBy: { fecha: "desc" } },
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ appointments });
});

// Walk-in / cita manual desde el panel. Cualquier usuario logueado puede registrarla.
export const POST = withSession(async (req) => {
  const body = await req.json().catch(() => {
    throw new HttpError(400, "El cuerpo de la solicitud no es válido.");
  });
  const { serviceId, startAt, staffId, nombre, celular, email, notasCliente, origen = "ADMIN" } = body;

  try {
    const appointment = await bookingService.createBooking({
      serviceId,
      startAt,
      staffId,
      nombre,
      celular,
      email,
      notasCliente,
      origen,
    });
    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err: any) {
    // Los errores de reserva (horario ocupado, datos faltantes) son del cliente.
    throw new HttpError(err?.status === 409 ? 409 : 400, err?.message || "Error al agendar la cita.");
  }
});

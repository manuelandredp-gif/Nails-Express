import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/booking";
import { differenceInHours, addMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    const appointment = await prisma.appointment.findUnique({
      where: { codigo: code.toUpperCase() },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "No se encontró ninguna cita con ese código." },
        { status: 404 }
      );
    }

    // Si se pasa teléfono, verificar que coincida
    if (phone) {
      const normPhone = normalizePhone(phone);
      if (
        !appointment.customer.celular.includes(normPhone.replace("+51", "")) &&
        !appointment.customer.celular.includes(normPhone)
      ) {
        return NextResponse.json(
          { error: "El celular no coincide con el registro de la cita." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error("Error retrieving booking:", error);
    return NextResponse.json(
      { error: "Error al consultar la cita." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await request.json();
    const { action, motivo, newStartAt } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { codigo: code.toUpperCase() },
      include: { customer: true, service: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada." },
        { status: 404 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    const cancelLimitHours = settings?.horasLimiteCancelacion ?? 12;

    const now = new Date();
    const hoursDifference = differenceInHours(
      new Date(appointment.startAt),
      now
    );

    if (action === "CANCELAR") {
      if (hoursDifference < cancelLimitHours) {
        return NextResponse.json(
          {
            error: `Solo se pueden cancelar citas con al menos ${cancelLimitHours} horas de anticipación. Por favor comunícate directamente por WhatsApp.`,
          },
          { status: 400 }
        );
      }

      const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          estado: "CANCELADA",
          canceladoPor: "CLIENTE",
          motivoCancelacion: motivo || "Cancelado por el cliente desde la web",
        },
      });

      await prisma.appointmentLog.create({
        data: {
          appointmentId: appointment.id,
          accion: "CANCELACION_CITA",
          detalle: `Cancelada por el cliente. Motivo: ${motivo || "Sin motivo especificado"}`,
          realizadoPor: "CLIENTE_WEB",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cita cancelada con éxito.",
        appointment: updated,
      });
    }

    if (action === "REPROGRAMAR") {
      if (!newStartAt) {
        return NextResponse.json(
          { error: "Debes seleccionar una nueva fecha y hora." },
          { status: 400 }
        );
      }

      if (hoursDifference < cancelLimitHours) {
        return NextResponse.json(
          {
            error: `Solo se pueden reprogramar citas con al menos ${cancelLimitHours} horas de anticipación.`,
          },
          { status: 400 }
        );
      }

      const newStart = new Date(newStartAt);
      const durationWithBuffer =
        appointment.service.duracionMinutos + appointment.service.bufferMinutos;
      const newEnd = addMinutes(newStart, durationWithBuffer);

      // Verificar que la manicurista esté libre
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: appointment.id },
          staffId: appointment.staffId,
          estado: { in: ["PENDIENTE", "CONFIRMADA"] },
          startAt: { lt: newEnd },
          endAt: { gt: newStart },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "El nuevo horario seleccionado no está disponible." },
          { status: 409 }
        );
      }

      const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          startAt: newStart,
          endAt: newEnd,
          estado: "CONFIRMADA",
        },
      });

      await prisma.appointmentLog.create({
        data: {
          appointmentId: appointment.id,
          accion: "REPROGRAMACION_CITA",
          detalle: `Reprogramada por el cliente a ${newStart.toISOString()}`,
          realizadoPor: "CLIENTE_WEB",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cita reprogramada con éxito.",
        appointment: updated,
      });
    }

    return NextResponse.json(
      { error: "Acción no reconocida." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error al actualizar la cita." },
      { status: 500 }
    );
  }
}

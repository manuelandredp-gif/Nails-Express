import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { addMinutes } from "date-fns";
import { awardStampForAppointment } from "@/lib/application/loyalty.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        service: true,
        staff: true,
        logs: { orderBy: { fecha: "desc" } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al obtener la cita." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { service: true, customer: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Role MANICURISTA can only mark completed or no-show
    if (session.rol === "MANICURISTA") {
      if (appointment.staffId !== session.staffId) {
        return NextResponse.json(
          { error: "Solo puedes modificar tus propias citas." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      estado,
      startAt,
      endAt,
      staffId,
      notasInternas,
      motivoCancelacion,
    } = body;

    const dataToUpdate: any = {};
    const logDetails: string[] = [];

    // 1. Move or change staff (Validate zero overlap)
    if (startAt || staffId) {
      const newStaffId = staffId || appointment.staffId;
      const newStart = startAt ? new Date(startAt) : appointment.startAt;
      let newEnd = endAt ? new Date(endAt) : appointment.endAt;

      // If only start changed, calculate newEnd based on duration + buffer
      if (startAt && !endAt) {
        const totalDuration =
          appointment.service.duracionMinutos + appointment.service.bufferMinutos;
        newEnd = addMinutes(newStart, totalDuration);
      }

      // Check overlap with active appointments
      const conflictApp = await prisma.appointment.findFirst({
        where: {
          id: { not: appointment.id },
          staffId: newStaffId,
          estado: { in: ["PENDIENTE", "CONFIRMADA"] },
          startAt: { lt: newEnd },
          endAt: { gt: newStart },
        },
      });

      if (conflictApp) {
        return NextResponse.json(
          {
            error:
              "Conflicto de horario: la manicurista ya tiene una cita reservada en este intervalo.",
          },
          { status: 409 }
        );
      }

      // Check overlap with TimeBlocks
      const conflictBlock = await prisma.timeBlock.findFirst({
        where: {
          OR: [{ staffId: null }, { staffId: newStaffId }],
          startAt: { lt: newEnd },
          endAt: { gt: newStart },
        },
      });

      if (conflictBlock) {
        return NextResponse.json(
          {
            error: `Conflicto de horario: periodo bloqueado (${conflictBlock.motivo}).`,
          },
          { status: 409 }
        );
      }

      dataToUpdate.startAt = newStart;
      dataToUpdate.endAt = newEnd;
      dataToUpdate.staffId = newStaffId;
      logDetails.push(`Horario/Staff modificado a ${newStart.toISOString()}`);
    }

    // 2. Status change
    if (estado && estado !== appointment.estado) {
      dataToUpdate.estado = estado;
      logDetails.push(`Estado cambiado de ${appointment.estado} a ${estado}`);

      // Handle inasistencia stats
      if (estado === "NO_ASISTIO" && appointment.estado !== "NO_ASISTIO") {
        await prisma.customer.update({
          where: { id: appointment.customerId },
          data: { inasistencias: { increment: 1 } },
        });
      }

      if (estado === "CANCELADA") {
        dataToUpdate.canceladoPor = "ADMIN";
        dataToUpdate.motivoCancelacion =
          motivoCancelacion || "Cancelada por administración";
      }
    }

    // 3. Notes
    if (notasInternas !== undefined) {
      dataToUpdate.notasInternas = notasInternas;
      logDetails.push("Notas internas actualizadas");
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: dataToUpdate,
      include: { customer: true, service: true, staff: true },
    });

    // Write audit log
    if (logDetails.length > 0) {
      await prisma.appointmentLog.create({
        data: {
          appointmentId: appointment.id,
          accion: "MODIFICACION_ADMIN",
          detalle: logDetails.join(". "),
          realizadoPor: session.nombre,
        },
      });
    }

    // Sello de fidelidad: al marcar la cita como COMPLETADA se otorga un sello.
    let loyalty = null;
    if (estado === "COMPLETADA" && appointment.estado !== "COMPLETADA") {
      try {
        loyalty = await awardStampForAppointment(appointment.id);
      } catch (e) {
        console.error("No se pudo otorgar el sello de fidelidad:", e);
      }
    }

    return NextResponse.json({ success: true, appointment: updated, loyalty });
  } catch (err: any) {
    console.error("Error updating appointment:", err);
    return NextResponse.json(
      { error: err.message || "Error al actualizar la cita." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar la cita." },
      { status: 500 }
    );
  }
}

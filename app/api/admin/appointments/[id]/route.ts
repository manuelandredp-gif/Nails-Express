import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addMinutes } from "date-fns";
import { awardStampForAppointment } from "@/lib/application/loyalty.service";
import { withSession, withManager, readJson, HttpError } from "@/lib/http/api";
import { appointmentPatchSchema } from "@/lib/validation/schemas";
import { ESTADOS_ACTIVOS, soloVeSusCitas, isManagerRol } from "@/lib/domain/constants";
import { logError } from "@/lib/infrastructure/logger";

export const dynamic = "force-dynamic";

export const GET = withSession(async (_req, { params }, session) => {
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
    throw new HttpError(404, "Cita no encontrada");
  }

  // Las manicuristas vinculadas solo pueden consultar sus propias citas.
  if (soloVeSusCitas(session.rol) && session.staffId && appointment.staffId !== session.staffId) {
    throw new HttpError(403, "Solo puedes ver tus propias citas.");
  }

  return NextResponse.json({ appointment });
});

export const PATCH = withSession(async (req, { params }, session) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { service: true, customer: true },
  });

  if (!appointment) {
    throw new HttpError(404, "Cita no encontrada");
  }

  const esManager = isManagerRol(session.rol);

  // Las manicuristas vinculadas solo gestionan sus propias citas (Recepción, todas).
  if (
    !esManager &&
    soloVeSusCitas(session.rol) &&
    session.staffId &&
    appointment.staffId !== session.staffId
  ) {
    throw new HttpError(403, "Solo puedes modificar tus propias citas.");
  }

  const body = await readJson(req, appointmentPatchSchema);
  let { estado, startAt, endAt, staffId, notasInternas, motivoCancelacion, pagado, metodoPago, resenaEstrellas, resenaTexto } = body;

  // Restricción de campos para trabajadoras: solo atender/cobrar/reseñar.
  if (!esManager) {
    startAt = undefined;
    endAt = undefined;
    staffId = undefined;
    notasInternas = undefined;
    motivoCancelacion = undefined;
    if (estado && estado !== "COMPLETADA" && estado !== "NO_ASISTIO") {
      throw new HttpError(403, "No tienes permiso para este cambio de estado.");
    }
  }

  const dataToUpdate: Record<string, unknown> = {};
  const logDetails: string[] = [];

  // Pago
  if (pagado !== undefined) {
    dataToUpdate.pagado = pagado;
    if (pagado) {
      dataToUpdate.pagadoEn = new Date();
      if (metodoPago) dataToUpdate.metodoPago = metodoPago;
      logDetails.push(`Cobro registrado${metodoPago ? ` (${metodoPago})` : ""}`);
    } else {
      dataToUpdate.pagadoEn = null;
      dataToUpdate.metodoPago = null;
      logDetails.push("Cobro anulado (marcada como no pagada)");
    }
  }
  // Reseña privada del cliente
  if (resenaEstrellas !== undefined) dataToUpdate.resenaEstrellas = resenaEstrellas;
  if (resenaTexto !== undefined) dataToUpdate.resenaTexto = resenaTexto || null;

  // 1. Mover o reasignar (validar que no haya solapamiento)
  if (startAt || staffId) {
    const newStaffId = staffId || appointment.staffId;
    const newStart = startAt ? new Date(startAt) : appointment.startAt;
    let newEnd = endAt ? new Date(endAt) : appointment.endAt;

    if (startAt && !endAt) {
      const totalDuration =
        appointment.service.duracionMinutos + appointment.service.bufferMinutos;
      newEnd = addMinutes(newStart, totalDuration);
    }

    const conflictApp = await prisma.appointment.findFirst({
      where: {
        id: { not: appointment.id },
        staffId: newStaffId,
        estado: { in: [...ESTADOS_ACTIVOS] },
        startAt: { lt: newEnd },
        endAt: { gt: newStart },
      },
    });
    if (conflictApp) {
      throw new HttpError(
        409,
        "Conflicto de horario: la manicurista ya tiene una cita reservada en este intervalo."
      );
    }

    const conflictBlock = await prisma.timeBlock.findFirst({
      where: {
        OR: [{ staffId: null }, { staffId: newStaffId }],
        startAt: { lt: newEnd },
        endAt: { gt: newStart },
      },
    });
    if (conflictBlock) {
      throw new HttpError(
        409,
        `Conflicto de horario: periodo bloqueado (${conflictBlock.motivo}).`
      );
    }

    dataToUpdate.startAt = newStart;
    dataToUpdate.endAt = newEnd;
    dataToUpdate.staffId = newStaffId;
    logDetails.push(`Horario/Staff modificado a ${newStart.toISOString()}`);
  }

  // Regla de negocio: no se puede completar una cita sin cobro registrado
  // (salvo que el cobro venga en esta misma petición).
  if (
    estado === "COMPLETADA" &&
    appointment.estado !== "COMPLETADA" &&
    !appointment.pagado &&
    pagado !== true
  ) {
    throw new HttpError(409, "Registra el cobro antes de marcar la cita como completada.");
  }

  // 2. Cambio de estado
  if (estado && estado !== appointment.estado) {
    dataToUpdate.estado = estado;
    logDetails.push(`Estado cambiado de ${appointment.estado} a ${estado}`);

    if (estado === "NO_ASISTIO" && appointment.estado !== "NO_ASISTIO") {
      await prisma.customer.update({
        where: { id: appointment.customerId },
        data: { inasistencias: { increment: 1 } },
      });
    }
    if (estado === "CANCELADA") {
      dataToUpdate.canceladoPor = "ADMIN";
      dataToUpdate.motivoCancelacion = motivoCancelacion || "Cancelada por administración";
    }
  }

  // 3. Notas internas
  if (notasInternas !== undefined) {
    dataToUpdate.notasInternas = notasInternas;
    logDetails.push("Notas internas actualizadas");
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: dataToUpdate,
    include: { customer: true, service: true, staff: true },
  });

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

  // Sello de fidelidad al completar.
  let loyalty = null;
  if (estado === "COMPLETADA" && appointment.estado !== "COMPLETADA") {
    try {
      loyalty = await awardStampForAppointment(appointment.id);
    } catch (e) {
      logError("loyalty_award_failed", e, { appointmentId: appointment.id });
    }
  }

  return NextResponse.json({ success: true, appointment: updated, loyalty });
});

export const DELETE = withManager(async (_req, { params }) => {
  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});

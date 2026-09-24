import { prisma } from "./db";
import { intervalsOverlap, TIMEZONE } from "./availability";
import { addMinutes } from "date-fns";

export interface CreateBookingInput {
  serviceId: string;
  startAt: string; // ISO string
  staffId?: string;
  nombre: string;
  celular: string;
  email?: string;
  notasCliente?: string;
  origen?: "WEB" | "ADMIN" | "WHATSAPP" | "TELEFONO";
}

/**
 * Generates short uppercase code e.g. "NX-7K3P"
 */
export function generateBookingCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude confusing 0, 1, I, O
  let code = "NX-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Normalizes cellphone for Peru (+51)
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+51")) return cleaned;
  if (cleaned.startsWith("51") && cleaned.length >= 11) return `+${cleaned}`;
  if (cleaned.length === 9) return `+51${cleaned}`;
  return cleaned;
}

/**
 * Transactional booking creation guaranteeing zero overlaps
 */
export async function createBooking(input: CreateBookingInput) {
  const {
    serviceId,
    startAt,
    staffId: requestedStaffId,
    nombre,
    celular,
    email,
    notasCliente,
    origen = "WEB",
  } = input;

  const slotStart = new Date(startAt);

  // 1. Fetch service info
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      staff: {
        where: { staff: { activo: true } },
        include: { staff: true },
      },
    },
  });

  if (!service || !service.activo) {
    throw new Error("El servicio seleccionado no está disponible.");
  }

  const durationWithBuffer = service.duracionMinutos + service.bufferMinutos;
  const slotEnd = addMinutes(slotStart, durationWithBuffer);

  // 2. Determine eligible staff
  let eligibleStaff = service.staff.map((s) => s.staff);
  if (requestedStaffId) {
    eligibleStaff = eligibleStaff.filter((s) => s.id === requestedStaffId);
  }

  if (eligibleStaff.length === 0) {
    throw new Error("No hay manicuristas disponibles para este servicio.");
  }

  // 3. Concurrency check inside Prisma Transaction
  return await prisma.$transaction(async (tx) => {
    // Check conflicts for candidate staff
    const conflictingAppointments = await tx.appointment.findMany({
      where: {
        staffId: { in: eligibleStaff.map((s) => s.id) },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        startAt: { lt: slotEnd },
        endAt: { gt: slotStart },
      },
    });

    const conflictingTimeBlocks = await tx.timeBlock.findMany({
      where: {
        OR: [
          { staffId: null },
          { staffId: { in: eligibleStaff.map((s) => s.id) } },
        ],
        startAt: { lt: slotEnd },
        endAt: { gt: slotStart },
      },
    });

    // Filter staff who have no conflicts
    const availableStaff = eligibleStaff.filter((st) => {
      const hasBlock = conflictingTimeBlocks.some(
        (tb) => tb.staffId === null || tb.staffId === st.id
      );
      if (hasBlock) return false;

      const hasApp = conflictingAppointments.some(
        (app) => app.staffId === st.id
      );
      if (hasApp) return false;

      return true;
    });

    if (availableStaff.length === 0) {
      throw new Error(
        "Lo sentimos, ese horario acaba de ser reservado por otra persona. Por favor elige otro horario."
      );
    }

    // 4. If multiple staff are available, choose the one with the fewest appointments today
    let assignedStaff = availableStaff[0];
    if (availableStaff.length > 1) {
      const startOfDay = new Date(slotStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(slotStart);
      endOfDay.setHours(23, 59, 59, 999);

      const staffCounts = await Promise.all(
        availableStaff.map(async (st) => {
          const count = await tx.appointment.count({
            where: {
              staffId: st.id,
              startAt: { gte: startOfDay, lte: endOfDay },
              estado: { in: ["PENDIENTE", "CONFIRMADA", "COMPLETADA"] },
            },
          });
          return { staff: st, count };
        })
      );

      staffCounts.sort((a, b) => a.count - b.count);
      assignedStaff = staffCounts[0].staff;
    }

    // 5. Upsert customer
    const normalizedPhone = normalizePhone(celular);
    let customer = await tx.customer.findUnique({
      where: { celular: normalizedPhone },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          nombre: nombre.trim(),
          celular: normalizedPhone,
          email: email?.trim() || null,
          totalCitas: 1,
          ultimaVisita: slotStart,
        },
      });
    } else {
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          nombre: nombre.trim() || customer.nombre,
          email: email?.trim() || customer.email,
          totalCitas: { increment: 1 },
          ultimaVisita: slotStart,
        },
      });
    }

    // 6. Generate unique booking code
    let bookingCode = generateBookingCode();
    let codeExists = await tx.appointment.findUnique({
      where: { codigo: bookingCode },
    });
    while (codeExists) {
      bookingCode = generateBookingCode();
      codeExists = await tx.appointment.findUnique({
        where: { codigo: bookingCode },
      });
    }

    // 7. Create Appointment
    const appointment = await tx.appointment.create({
      data: {
        codigo: bookingCode,
        customerId: customer.id,
        serviceId: service.id,
        staffId: assignedStaff.id,
        startAt: slotStart,
        endAt: slotEnd,
        precio: service.precio,
        estado: "CONFIRMADA",
        origen,
        notasCliente: notasCliente?.trim() || null,
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    });

    // 8. Create audit log
    await tx.appointmentLog.create({
      data: {
        appointmentId: appointment.id,
        accion: "CREACION_CITA",
        detalle: `Cita reservada desde ${origen}. Manicurista asignada: ${assignedStaff.nombre}.`,
        realizadoPor: origen === "WEB" ? "CLIENTE_WEB" : "ADMIN",
      },
    });

    return appointment;
  });
}

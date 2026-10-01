import { addMinutes } from "date-fns";
import crypto from "crypto";
import { prisma } from "../db";
import { notifications } from "./notifications.service";
import {
  PrismaAppointmentRepository,
  PrismaCustomerRepository,
  PrismaServiceRepository,
} from "../infrastructure/database/prisma-repositories";

/** true si el error proviene de la restricción de exclusión (solapamiento) de PostgreSQL. */
function isOverlapViolation(err: any): boolean {
  const msg = String(err?.message || "");
  return (
    err?.code === "23P01" ||
    err?.meta?.code === "23P01" ||
    msg.includes("no_overlap_per_staff") ||
    msg.includes("exclusion") ||
    msg.includes("23P01")
  );
}

const OVERLAP_MESSAGE =
  "Lo sentimos, ese horario acaba de ser reservado por otra persona. Por favor elige otro horario.";

export interface CreateBookingDTO {
  serviceId: string;
  startAt: string;
  staffId?: string;
  nombre: string;
  celular: string;
  email?: string;
  notasCliente?: string;
  notasInternas?: string;
  origen?: "WEB" | "ADMIN" | "WHATSAPP" | "TELEFONO";
  estado?: "PENDIENTE" | "CONFIRMADA";
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+51")) return cleaned;
  if (cleaned.startsWith("51") && cleaned.length >= 11) return `+${cleaned}`;
  if (cleaned.length === 9) return `+51${cleaned}`;
  return cleaned;
}

export function generateSecureBookingCode(): string {
  // NX- + 6 caracteres del alfabeto sin ambiguos (32^6 ≈ 1.07 mil millones)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(6);
  let result = "NX-";
  for (let i = 0; i < 6; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export class BookingService {
  constructor(
    private appointmentRepo = new PrismaAppointmentRepository(),
    private customerRepo = new PrismaCustomerRepository(),
    private serviceRepo = new PrismaServiceRepository()
  ) {}

  async createBooking(input: CreateBookingDTO) {
    const {
      serviceId,
      startAt,
      staffId: requestedStaffId,
      nombre,
      celular,
      email,
      notasCliente,
      notasInternas,
      origen = "WEB",
      estado = "CONFIRMADA",
    } = input;

    const slotStart = new Date(startAt);

    // 1. Fetch service info
    const service = await this.serviceRepo.findById(serviceId);
    if (!service || !service.activo) {
      throw new Error("El servicio seleccionado no está disponible.");
    }

    const durationWithBuffer = service.duracionMinutos + service.bufferMinutos;
    const slotEnd = addMinutes(slotStart, durationWithBuffer);

    // 2. Determine eligible staff
    let eligibleStaff = (service.staff || []).map((s: any) => s.staff);
    if (requestedStaffId) {
      eligibleStaff = eligibleStaff.filter((s: any) => s.id === requestedStaffId);
    }

    if (eligibleStaff.length === 0) {
      throw new Error("No hay manicuristas disponibles para este servicio.");
    }

    // 3. Transacción con reintentos: cubre colisión de código y conflictos de
    //    serialización/solapamiento (la restricción de exclusión de PostgreSQL
    //    garantiza a nivel de base que dos citas nunca se solapen por manicurista).
    let lastErr: any;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const appointment = await this.runBookingTransaction({
          eligibleStaff,
          service,
          slotStart,
          slotEnd,
          nombre,
          celular,
          email,
          notasCliente,
          notasInternas,
          origen,
          estado,
        });

        // 9. Notificar confirmación al cliente (no bloquea la reserva si falla).
        notifications
          .sendBookingConfirmation({
            toEmail: appointment.customer.email,
            toPhone: appointment.customer.celular,
            customerName: appointment.customer.nombre,
            serviceName: appointment.service.nombre,
            startAt: appointment.startAt,
            bookingCode: appointment.codigo,
            price: appointment.precio,
          })
          .catch((e) => console.error("No se pudo enviar la confirmación:", e));

        return appointment;
      } catch (err: any) {
        lastErr = err;
        if (isOverlapViolation(err)) {
          throw new Error(OVERLAP_MESSAGE);
        }
        // Colisión de código único o conflicto de serialización: reintentar.
        const msg = String(err?.message || "");
        if (
          err?.code === "P2002" ||
          msg.includes("40001") ||
          msg.includes("could not serialize") ||
          msg.includes("write conflict") ||
          msg.includes("deadlock")
        ) {
          continue;
        }
        throw err;
      }
    }
    throw lastErr || new Error("No se pudo crear la reserva.");
  }

  private async runBookingTransaction(ctx: {
    eligibleStaff: any[];
    service: any;
    slotStart: Date;
    slotEnd: Date;
    nombre: string;
    celular: string;
    email?: string;
    notasCliente?: string;
    notasInternas?: string;
    origen: string;
    estado: string;
  }) {
    const {
      eligibleStaff,
      service,
      slotStart,
      slotEnd,
      nombre,
      celular,
      email,
      notasCliente,
      notasInternas,
      origen,
      estado,
    } = ctx;

    return await prisma.$transaction(
      async (tx) => {
      const eligibleStaffIds = eligibleStaff.map((s: any) => s.id);

      // Check conflicting appointments
      const conflictingAppointments = await tx.appointment.findMany({
        where: {
          staffId: { in: eligibleStaffIds },
          estado: { in: ["PENDIENTE", "CONFIRMADA"] },
          startAt: { lt: slotEnd },
          endAt: { gt: slotStart },
        },
      });

      // Check conflicting time blocks
      const conflictingTimeBlocks = await tx.timeBlock.findMany({
        where: {
          OR: [
            { staffId: null },
            { staffId: { in: eligibleStaffIds } },
          ],
          startAt: { lt: slotEnd },
          endAt: { gt: slotStart },
        },
      });

      const busyStaffIds = new Set<string>();
      conflictingAppointments.forEach((a) => busyStaffIds.add(a.staffId));
      conflictingTimeBlocks.forEach((b) => {
        if (!b.staffId) {
          eligibleStaffIds.forEach((id: string) => busyStaffIds.add(id));
        } else {
          busyStaffIds.add(b.staffId);
        }
      });

      const availableStaff = eligibleStaff.filter((s: any) => !busyStaffIds.has(s.id));

      if (availableStaff.length === 0) {
        throw new Error(
          "Lo sentimos, ese horario acaba de ser reservado por otra persona. Por favor elige otro horario."
        );
      }

      // 4. Assign staff (fair load balancing)
      let assignedStaff = availableStaff[0];
      if (availableStaff.length > 1) {
        const dayStart = new Date(slotStart);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(slotStart);
        dayEnd.setHours(23, 59, 59, 999);

        const counts = await Promise.all(
          availableStaff.map(async (st: any) => {
            const count = await tx.appointment.count({
              where: {
                staffId: st.id,
                startAt: { gte: dayStart, lte: dayEnd },
                estado: { in: ["PENDIENTE", "CONFIRMADA", "COMPLETADA"] },
              },
            });
            return { staff: st, count };
          })
        );
        counts.sort((a, b) => a.count - b.count);
        assignedStaff = counts[0].staff;
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

      // 6. Generate secure unique booking code
      const bookingCode = generateSecureBookingCode();

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
          estado,
          origen,
          notasCliente: notasCliente?.trim() || null,
          notasInternas: notasInternas?.trim() || null,
        },
        include: {
          customer: true,
          service: true,
          staff: true,
        },
      });

      // 8. Audit log
      await tx.appointmentLog.create({
        data: {
          appointmentId: appointment.id,
          accion: "CREACION_CITA",
          detalle: `Cita reservada desde ${origen}. Manicurista asignada: ${assignedStaff.nombre}.`,
          realizadoPor: origen === "WEB" ? "CLIENTE_WEB" : "ADMIN",
        },
      });

      return appointment;
      },
      { isolationLevel: "Serializable" }
    );
  }
}

export const bookingService = new BookingService();

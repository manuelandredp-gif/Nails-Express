import { addMinutes } from "date-fns";
import crypto from "crypto";
import { prisma } from "../db";
import {
  PrismaAppointmentRepository,
  PrismaCustomerRepository,
  PrismaServiceRepository,
} from "../infrastructure/database/prisma-repositories";

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
  // 6 uppercase alphanumeric characters with high entropy (36^6 = 2.17 billion combinations)
  const bytes = crypto.randomBytes(4);
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "NX-";
  for (let i = 0; i < 5; i++) {
    result += chars[bytes[i % bytes.length] % chars.length];
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

    // 3. Concurrency check inside Prisma Transaction
    return await prisma.$transaction(async (tx) => {
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
    });
  }
}

export const bookingService = new BookingService();

import { prisma } from "./db";
import { parseISO, addMinutes, format, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const TIMEZONE = "America/Lima";

export interface TimeSlot {
  time: string; // "10:00"
  startAt: string; // ISO string
  endAt: string; // ISO string
  available: boolean;
  availableStaffIds: string[];
}

export interface DayAvailability {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  slots: TimeSlot[];
}

/**
 * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
 */
export function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Calculates available slots for a given service, date, and optional staff.
 */
export async function getAvailableSlots(params: {
  serviceId: string;
  dateStr: string; // "YYYY-MM-DD"
  staffId?: string;
}): Promise<DayAvailability> {
  const { serviceId, dateStr, staffId } = params;

  // 1. Fetch settings
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });
  const minNoticeHours = settings?.anticipacionMinimaHoras ?? 2;
  const slotIntervalMinutes = settings?.intervaloSlotsMinutos ?? 30;

  // 2. Fetch service
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
    return { date: dateStr, isClosed: true, slots: [] };
  }

  const totalDurationMinutes = service.duracionMinutos + service.bufferMinutos;

  // Filter staff who perform this service
  let qualifiedStaff = service.staff.map((s) => s.staff);
  if (staffId) {
    qualifiedStaff = qualifiedStaff.filter((st) => st.id === staffId);
  }

  if (qualifiedStaff.length === 0) {
    return { date: dateStr, isClosed: true, slots: [] };
  }

  // 3. Determine day of week in Peru timezone
  // Date string is YYYY-MM-DD
  const [yearStr, monthStr, dayNumStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayNumStr, 10);

  // Reference date in America/Lima
  const targetDateLocal = new Date(year, month, day, 12, 0, 0);
  const dayOfWeek = targetDateLocal.getDay(); // 0 = Domingo, 1 = Lunes, ...

  // 4. Fetch business hours for this day of week
  const businessHours = await prisma.businessHours.findFirst({
    where: { diaSemana: dayOfWeek },
  });

  if (!businessHours || businessHours.cerrado) {
    return { date: dateStr, isClosed: true, slots: [] };
  }

  // Parse open and close times: e.g. "09:00", "20:00"
  const [openHour, openMin] = businessHours.horaApertura.split(":").map(Number);
  const [closeHour, closeMin] = businessHours.horaCierre.split(":").map(Number);

  // 5. Query existing active appointments for target date
  // Construct search window in UTC from start of day to end of day in Lima
  const startOfDayLocal = new Date(year, month, day, 0, 0, 0);
  const endOfDayLocal = new Date(year, month, day, 23, 59, 59);

  const appointments = await prisma.appointment.findMany({
    where: {
      estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      startAt: { gte: startOfDayLocal, lte: endOfDayLocal },
      staffId: { in: qualifiedStaff.map((s) => s.id) },
    },
  });

  // Query time blocks (feriados, descansos, etc.)
  const timeBlocks = await prisma.timeBlock.findMany({
    where: {
      startAt: { lte: endOfDayLocal },
      endAt: { gte: startOfDayLocal },
      OR: [
        { staffId: null }, // local completo cerrado
        { staffId: { in: qualifiedStaff.map((s) => s.id) } },
      ],
    },
  });

  // Current time + minimum notice in Lima
  const now = new Date();
  const minBookingTime = addMinutes(now, minNoticeHours * 60);

  // 6. Generate time slots
  const slots: TimeSlot[] = [];

  let currentSlotLocal = new Date(year, month, day, openHour, openMin, 0);
  const closingTimeLocal = new Date(year, month, day, closeHour, closeMin, 0);

  while (true) {
    const slotEndLocal = addMinutes(currentSlotLocal, totalDurationMinutes);

    // Stop if the service + buffer would exceed business hours
    if (isAfter(slotEndLocal, closingTimeLocal)) {
      break;
    }

    const timeLabel = format(currentSlotLocal, "HH:mm");
    const isPastMinNotice = isBefore(currentSlotLocal, minBookingTime);

    // Check which staff members are free for this slot
    const availableStaffForSlot: string[] = [];

    if (!isPastMinNotice) {
      for (const staffMember of qualifiedStaff) {
        // Check global or staff-specific time blocks
        const hasTimeBlock = timeBlocks.some((tb) => {
          if (tb.staffId === null || tb.staffId === staffMember.id) {
            return intervalsOverlap(
              currentSlotLocal,
              slotEndLocal,
              new Date(tb.startAt),
              new Date(tb.endAt)
            );
          }
          return false;
        });

        if (hasTimeBlock) {
          continue; // staff busy with block
        }

        // Check appointments for this staff
        const hasConflict = appointments.some((app) => {
          if (app.staffId === staffMember.id) {
            return intervalsOverlap(
              currentSlotLocal,
              slotEndLocal,
              new Date(app.startAt),
              new Date(app.endAt)
            );
          }
          return false;
        });

        if (!hasConflict) {
          availableStaffForSlot.push(staffMember.id);
        }
      }
    }

    const isAvailable = availableStaffForSlot.length > 0;

    slots.push({
      time: timeLabel,
      startAt: currentSlotLocal.toISOString(),
      endAt: slotEndLocal.toISOString(),
      available: isAvailable,
      availableStaffIds: availableStaffForSlot,
    });

    // Advance by interval (e.g. 30 min or 60 min)
    currentSlotLocal = addMinutes(currentSlotLocal, slotIntervalMinutes);
  }

  return {
    date: dateStr,
    isClosed: false,
    slots,
  };
}

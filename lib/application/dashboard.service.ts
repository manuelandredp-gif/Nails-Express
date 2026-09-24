import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
} from "date-fns";
import {
  PrismaAppointmentRepository,
  PrismaServiceRepository,
  PrismaStaffRepository,
} from "../infrastructure/database/prisma-repositories";
import { prisma } from "../db";

export interface DashboardMetricsDTO {
  todayAppointments: any[];
  weekCount: number;
  monthRevenue: number;
  todayRevenue: number;
  noShowRate: string;
  allNoShowCount: number;
  totalFinished: number;
  totalSlotsCapacity: number;
  bookedToday: number;
  occupancyPercent: number;
  activeApp: any | null;
  activeRemainingMin: number;
  activeElapsedPercent: number;
  nextApp: any | null;
  topServices: any[];
  allStaff: any[];
  allServices: any[];
  currency: string;
}

export class DashboardService {
  constructor(
    private appointmentRepo = new PrismaAppointmentRepository(),
    private serviceRepo = new PrismaServiceRepository(),
    private staffRepo = new PrismaStaffRepository()
  ) {}

  async getDashboardMetrics(referenceDate = new Date()): Promise<DashboardMetricsDTO> {
    const todayStart = startOfDay(referenceDate);
    const todayEnd = endOfDay(referenceDate);
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);

    const [
      todayAppointments,
      weekCount,
      monthAppointments,
      allCompletedCount,
      allNoShowCount,
      topServices,
      settings,
      allStaff,
      allServices,
    ] = await Promise.all([
      this.appointmentRepo.findTodayAppointments(todayStart, todayEnd),
      this.appointmentRepo.countInRange(weekStart, weekEnd),
      this.appointmentRepo.findRevenueInRange(monthStart, monthEnd),
      this.appointmentRepo.countByStatus("COMPLETADA"),
      this.appointmentRepo.countByStatus("NO_ASISTIO"),
      this.serviceRepo.findTopServices(4),
      prisma.settings.findUnique({ where: { id: "default" } }),
      this.staffRepo.findActive(),
      this.serviceRepo.findActive(),
    ]);

    const currency = settings?.moneda || "S/";

    const todayRevenue = todayAppointments
      .filter((a) => a.estado === "CONFIRMADA" || a.estado === "COMPLETADA")
      .reduce((acc, curr) => acc + curr.precio, 0);

    const monthRevenue = monthAppointments.reduce(
      (acc, curr) => acc + curr.precio,
      0
    );

    const totalFinished = allCompletedCount + allNoShowCount;
    const noShowRate =
      totalFinished > 0
        ? ((allNoShowCount / totalFinished) * 100).toFixed(1)
        : "0.0";

    // Capacity calculations
    const totalSlotsCapacity = Math.max(1, allStaff.length * 9);
    const bookedToday = todayAppointments.filter((a) => a.estado !== "CANCELADA").length;
    const occupancyPercent = Math.min(100, Math.round((bookedToday / totalSlotsCapacity) * 100));

    // Active in salon now
    const activeApp = todayAppointments.find(
      (a) =>
        a.estado === "CONFIRMADA" &&
        referenceDate >= new Date(a.startAt) &&
        referenceDate <= new Date(a.endAt)
    ) || null;

    // Next upcoming appointment
    const nextApp = todayAppointments.find(
      (a) => a.estado === "CONFIRMADA" && new Date(a.startAt) > referenceDate
    ) || null;

    let activeElapsedPercent = 0;
    let activeRemainingMin = 0;
    if (activeApp) {
      const totalMin = differenceInMinutes(
        new Date(activeApp.endAt),
        new Date(activeApp.startAt)
      );
      const elapsedMin = differenceInMinutes(referenceDate, new Date(activeApp.startAt));
      activeElapsedPercent = Math.min(
        100,
        Math.max(0, Math.round((elapsedMin / (totalMin || 1)) * 100))
      );
      activeRemainingMin = Math.max(
        0,
        differenceInMinutes(new Date(activeApp.endAt), referenceDate)
      );
    }

    return {
      todayAppointments,
      weekCount,
      monthRevenue,
      todayRevenue,
      noShowRate,
      allNoShowCount,
      totalFinished,
      totalSlotsCapacity,
      bookedToday,
      occupancyPercent,
      activeApp,
      activeRemainingMin,
      activeElapsedPercent,
      nextApp,
      topServices,
      allStaff,
      allServices,
      currency,
    };
  }
}

export const dashboardService = new DashboardService();

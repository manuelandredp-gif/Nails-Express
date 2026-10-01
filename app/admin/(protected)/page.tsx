import React from "react";
import { dashboardService } from "@/lib/application/dashboard.service";
import { getSiteSettings } from "@/lib/site-content";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { es } from "date-fns/locale";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import SalonCapacityBar from "@/components/admin/dashboard/SalonCapacityBar";
import DashboardKpiGrid from "@/components/admin/dashboard/DashboardKpiGrid";
import LiveSalonTracker from "@/components/admin/dashboard/LiveSalonTracker";
import TodayScheduleTable from "@/components/admin/dashboard/TodayScheduleTable";
import TopServicesWidget from "@/components/admin/dashboard/TopServicesWidget";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import { requireManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireManager();
  const now = new Date();
  const weekAgo = startOfDay(subDays(now, 6));
  const [metrics, settings, weekAppts] = await Promise.all([
    dashboardService.getDashboardMetrics(now),
    getSiteSettings(),
    prisma.appointment.findMany({
      where: {
        estado: { in: ["CONFIRMADA", "COMPLETADA"] },
        startAt: { gte: weekAgo, lte: endOfDay(now) },
      },
      select: { startAt: true, precio: true },
    }),
  ]);

  // Serie de ingresos de los últimos 7 días
  const revenueSeries = Array.from({ length: 7 }).map((_, idx) => {
    const day = subDays(now, 6 - idx);
    const dStart = startOfDay(day).getTime();
    const dEnd = endOfDay(day).getTime();
    const monto = weekAppts
      .filter((a) => {
        const t = new Date(a.startAt).getTime();
        return t >= dStart && t <= dEnd;
      })
      .reduce((acc, a) => acc + a.precio, 0);
    return { label: format(day, "EEE", { locale: es }), monto };
  });

  const confirmedCount = metrics.todayAppointments.filter(
    (a) => a.estado === "CONFIRMADA"
  ).length;

  return (
    <div className="space-y-8">
      {/* 1. Header with navigation and walk-in trigger */}
      <DashboardHeader
        now={now}
        allStaff={metrics.allStaff}
        allServices={metrics.allServices}
        currency={metrics.currency}
      />

      {/* 2. Salon Capacity Bar */}
      <SalonCapacityBar
        bookedToday={metrics.bookedToday}
        totalSlotsCapacity={metrics.totalSlotsCapacity}
        occupancyPercent={metrics.occupancyPercent}
        allStaff={metrics.allStaff}
        todayAppointments={metrics.todayAppointments}
      />

      {/* 3. KPI Cards Grid with trends */}
      <DashboardKpiGrid
        todayAppointmentsCount={metrics.todayAppointments.length}
        confirmedCount={confirmedCount}
        weekCount={metrics.weekCount}
        currency={metrics.currency}
        todayRevenue={metrics.todayRevenue}
        monthRevenue={metrics.monthRevenue}
        noShowRate={metrics.noShowRate}
        allNoShowCount={metrics.allNoShowCount}
        totalFinished={metrics.totalFinished}
        badgeCitasHoy={settings.dashBadgeCitasHoy}
        subCitasHoy={settings.dashSubCitasHoy}
        badgeSemana={settings.dashBadgeSemana}
        badgeIngresos={settings.dashBadgeIngresos}
        badgeInasistencia={settings.dashBadgeInasistencia}
      />

      {/* 4. Live Salon Tracker */}
      <LiveSalonTracker
        activeApp={metrics.activeApp}
        activeRemainingMin={metrics.activeRemainingMin}
        activeElapsedPercent={metrics.activeElapsedPercent}
        nextApp={metrics.nextApp}
      />

      {/* 4b. Gráfico de ingresos de la semana */}
      <RevenueChart data={revenueSeries} currency={metrics.currency} />

      {/* 5. Main Content: Today's Schedule (8 cols) & Top Services (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <TodayScheduleTable
            todayAppointments={metrics.todayAppointments}
            currency={metrics.currency}
          />
        </div>
        <div className="lg:col-span-4">
          <TopServicesWidget topServices={metrics.topServices} />
        </div>
      </div>
    </div>
  );
}

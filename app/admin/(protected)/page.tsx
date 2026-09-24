import React from "react";
import { dashboardService } from "@/lib/application/dashboard.service";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import SalonCapacityBar from "@/components/admin/dashboard/SalonCapacityBar";
import DashboardKpiGrid from "@/components/admin/dashboard/DashboardKpiGrid";
import LiveSalonTracker from "@/components/admin/dashboard/LiveSalonTracker";
import TodayScheduleTable from "@/components/admin/dashboard/TodayScheduleTable";
import TopServicesWidget from "@/components/admin/dashboard/TopServicesWidget";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const metrics = await dashboardService.getDashboardMetrics(now);

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
      />

      {/* 4. Live Salon Tracker */}
      <LiveSalonTracker
        activeApp={metrics.activeApp}
        activeRemainingMin={metrics.activeRemainingMin}
        activeElapsedPercent={metrics.activeElapsedPercent}
        nextApp={metrics.nextApp}
      />

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

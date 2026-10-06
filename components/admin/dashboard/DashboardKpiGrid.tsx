import React from "react";
import { Clock, Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface DashboardKpiGridProps {
  todayAppointmentsCount: number;
  confirmedCount: number;
  weekCount: number;
  currency: string;
  todayRevenue: number;
  monthRevenue: number;
  noShowRate: string;
  allNoShowCount: number;
  totalFinished: number;
  badgeCitasHoy?: string;
  subCitasHoy?: string;
  badgeSemana?: string;
  badgeIngresos?: string;
  badgeInasistencia?: string;
}

export default function DashboardKpiGrid({
  todayAppointmentsCount,
  confirmedCount,
  weekCount,
  currency,
  todayRevenue,
  monthRevenue,
  noShowRate,
  allNoShowCount,
  totalFinished,
  badgeCitasHoy = "+14% vs ayer",
  subCitasHoy = "100% libre de cruces",
  badgeSemana = "+8% semanal",
  badgeIngresos = "Proyección activa",
  badgeInasistencia = "Bajo control",
}: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Citas Hoy */}
      <div className="bg-gradient-to-br from-[#E6F6F4] to-white p-5 rounded-[18px] border border-[#CDEEEA] shadow-2xs space-y-3 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        <div className="flex items-center justify-between text-[#8E8E8E]">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Citas Hoy
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#E6F6F4] text-primary flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-[#1A1A1A]">
            {todayAppointmentsCount}
          </div>
          {badgeCitasHoy && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {badgeCitasHoy}
            </span>
          )}
        </div>
        <div className="text-xs text-[#6B6B6B] flex items-center justify-between">
          <span>{confirmedCount} pendientes</span>
          {subCitasHoy && (
            <span className="text-[10px] text-gray-400 font-mono">{subCitasHoy}</span>
          )}
        </div>
      </div>

      {/* Card 2: Citas Semana */}
      <div className="bg-gradient-to-br from-[#EAF1FF] to-white p-5 rounded-[18px] border border-[#D4E2FB] shadow-2xs space-y-3 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        <div className="flex items-center justify-between text-[#8E8E8E]">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Esta Semana
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-[#1A1A1A]">{weekCount}</div>
          {badgeSemana && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-[#E6F6F4] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {badgeSemana}
            </span>
          )}
        </div>
        <div className="text-xs text-[#6B6B6B]">
          Total agendadas y confirmadas
        </div>
      </div>

      {/* Card 3: Ingresos Estimados Hoy */}
      <div className="bg-gradient-to-br from-[#E9F7EF] to-white p-5 rounded-[18px] border border-[#CDEBD9] shadow-2xs space-y-3 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div className="flex items-center justify-between text-[#8E8E8E]">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Ingresos Hoy
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-emerald-600">
            {currency} {todayRevenue.toFixed(0)}
          </div>
          {badgeIngresos && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {badgeIngresos}
            </span>
          )}
        </div>
        <div className="text-xs text-[#6B6B6B]">
          Mes acumulado: {currency} {monthRevenue.toFixed(0)}
        </div>
      </div>

      {/* Card 4: Tasa de Inasistencia */}
      <div className="bg-gradient-to-br from-[#E6F6F4] to-white p-5 rounded-[18px] border border-[#CFEDEA] shadow-2xs space-y-3 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-1 bg-[#3EA59E]" />
        <div className="flex items-center justify-between text-[#8E8E8E]">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Inasistencia
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#E6F6F4] text-[#3EA59E] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-[#1A1A1A]">
            {noShowRate}%
          </div>
          {badgeInasistencia && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> {badgeInasistencia}
            </span>
          )}
        </div>
        <div className="text-xs text-[#6B6B6B]">
          {allNoShowCount} faltas de {totalFinished} citas históricas
        </div>
      </div>
    </div>
  );
}

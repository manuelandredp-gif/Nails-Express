import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Plus } from "lucide-react";
import WalkInQuickModal from "@/components/admin/WalkInQuickModal";

interface DashboardHeaderProps {
  now: Date;
  allStaff: any[];
  allServices: any[];
  currency: string;
}

export default function DashboardHeader({
  now,
  allStaff,
  allServices,
  currency,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Dashboard
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-[#E6F6F4] px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            En vivo
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5 capitalize">
          {format(now, "EEEE d 'de' MMMM, yyyy", { locale: es })} • Tacna, Perú
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <WalkInQuickModal
          staffList={allStaff}
          servicesList={allServices}
          currency={currency}
        />

        <Link
          href="/admin/agenda"
          className="btn-primary text-xs sm:text-sm py-2 px-3.5 inline-flex items-center gap-2 shadow-xs"
        >
          <Calendar className="w-4 h-4" />
          <span>Ver Agenda</span>
        </Link>

        <Link
          href="/admin/citas?nueva=true"
          className="btn-blush text-xs sm:text-sm py-2 px-3.5 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cita</span>
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import { Activity } from "lucide-react";

interface SalonCapacityBarProps {
  bookedToday: number;
  totalSlotsCapacity: number;
  occupancyPercent: number;
  allStaff: any[];
  todayAppointments: any[];
}

export default function SalonCapacityBar({
  bookedToday,
  totalSlotsCapacity,
  occupancyPercent,
  allStaff,
  todayAppointments,
}: SalonCapacityBarProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#ECECEC] p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E6F6F4] text-primary flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Capacidad y Ocupación del Salón Hoy
            </h2>
            <p className="text-xs text-[#8E8E8E]">
              {bookedToday} de {totalSlotsCapacity} turnos ocupados ({occupancyPercent}% de capacidad estimada)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            {allStaff.map((st) => {
              const count = todayAppointments.filter(
                (a) => a.staffId === st.id && a.estado !== "CANCELADA"
              ).length;
              return (
                <span
                  key={st.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${st.color}15`,
                    color: st.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: st.color }}
                  />
                  {st.nombre}: {count} citas
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            occupancyPercent > 80
              ? "bg-gradient-to-r from-primary to-[#3EA59E]"
              : "bg-gradient-to-r from-primary/80 to-primary"
          }`}
          style={{ width: `${Math.max(8, occupancyPercent)}%` }}
        />
      </div>
    </div>
  );
}

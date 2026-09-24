import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Clock } from "lucide-react";

interface LiveSalonTrackerProps {
  activeApp: any | null;
  activeRemainingMin: number;
  activeElapsedPercent: number;
  nextApp: any | null;
}

export default function LiveSalonTracker({
  activeApp,
  activeRemainingMin,
  activeElapsedPercent,
  nextApp,
}: LiveSalonTrackerProps) {
  if (activeApp) {
    return (
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] text-white rounded-[20px] p-6 shadow-md border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              En Atención Ahora Mismo
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            {activeApp.customer.nombre} • {activeApp.service.nombre}
          </h3>
          <p className="text-xs text-gray-300 flex items-center gap-2">
            <span>Manicurista:</span>
            <span
              className="font-bold px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: `${activeApp.staff.color}30`,
                color: "#FFFFFF",
                border: `1px solid ${activeApp.staff.color}`,
              }}
            >
              {activeApp.staff.nombre}
            </span>
            <span>•</span>
            <span>
              Horario: {format(new Date(activeApp.startAt), "HH:mm")} -{" "}
              {format(new Date(activeApp.endAt), "HH:mm")}
            </span>
          </p>
        </div>

        <div className="min-w-[220px] space-y-2 bg-white/10 p-4 rounded-xl border border-white/10">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-300">Tiempo restante:</span>
            <span className="text-white font-mono font-bold">
              {activeRemainingMin} min
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${activeElapsedPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-400 text-right">
            {activeElapsedPercent}% completado
          </div>
        </div>
      </div>
    );
  }

  if (nextApp) {
    return (
      <div className="bg-[#FAF3F3] border border-[#F2DADA] rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8707A]/15 text-[#E8707A] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#E8707A] uppercase tracking-wider">
              Próxima Cita en Salón
            </span>
            <h3 className="text-base font-bold text-[#1A1A1A]">
              {nextApp.customer.nombre} — {nextApp.service.nombre}
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              Inicia a las {format(new Date(nextApp.startAt), "HH:mm")} con {nextApp.staff.nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/agenda"
            className="text-xs font-bold text-primary hover:underline px-3 py-1.5 rounded-lg bg-white border border-gray-200"
          >
            Abrir en agenda →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

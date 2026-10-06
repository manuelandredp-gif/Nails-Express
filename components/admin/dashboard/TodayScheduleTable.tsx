import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Scissors } from "lucide-react";

interface TodayScheduleTableProps {
  todayAppointments: any[];
  currency: string;
}

export default function TodayScheduleTable({
  todayAppointments,
  currency,
}: TodayScheduleTableProps) {
  return (
    <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            Citas programadas para hoy
          </h2>
          <p className="text-xs text-[#6B6B6B]">
            Seguimiento en tiempo real de la jornada sin cruces
          </p>
        </div>
        <Link
          href="/admin/agenda"
          className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
        >
          <span>Ver agenda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {todayAppointments.length === 0 ? (
        <div className="text-center py-12 text-[#8E8E8E] text-sm">
          No hay citas programadas para hoy. ¡Todo el día está libre para atención al paso!
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {todayAppointments.map((app) => (
            <div
              key={app.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 text-center shrink-0 pt-0.5">
                  <span className="text-sm font-bold text-[#1A1A1A]">
                    {format(new Date(app.startAt), "HH:mm")}
                  </span>
                  <span className="block text-[0.65rem] text-[#8E8E8E]">
                    {format(new Date(app.endAt), "HH:mm")}
                  </span>
                </div>

                <div className="border-l-2 border-primary pl-3">
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    {app.customer.nombre}
                  </p>
                  <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5 mt-0.5">
                    <Scissors className="w-3 h-3 text-primary" />
                    <span>{app.service.nombre}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#3EA59E]">
                      {currency} {app.precio.toFixed(0)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span
                  className="text-[0.65rem] px-2.5 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: `${app.staff.color}20`,
                    color: app.staff.color,
                  }}
                >
                  {app.staff.nombre}
                </span>
                <span
                  className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                    app.estado === "CONFIRMADA"
                      ? "bg-green-100 text-green-700"
                      : app.estado === "COMPLETADA"
                      ? "bg-blue-100 text-blue-700"
                      : app.estado === "CANCELADA"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {app.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

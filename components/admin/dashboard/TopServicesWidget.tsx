import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TopServicesWidgetProps {
  topServices: any[];
}

export default function TopServicesWidget({ topServices }: TopServicesWidgetProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-[#1A1A1A]">
          Servicios más reservados
        </h3>
        <div className="space-y-3">
          {topServices.map((srv, i) => (
            <div
              key={srv.id}
              className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 text-xs font-bold text-[#8E8E8E]">
                  #{i + 1}
                </span>
                <span className="font-semibold text-[#1A1A1A] truncate max-w-[150px]">
                  {srv.nombre}
                </span>
              </div>
              <span className="text-xs font-bold text-primary bg-[#E6F6F4] px-2 py-0.5 rounded-full">
                {srv._count?.citas || 0} citas
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FAF3F3] rounded-[18px] border border-[#F2DADA] p-6 space-y-3">
        <h3 className="text-base font-bold text-[#1A1A1A]">
          Reglas de Agendamiento
        </h3>
        <p className="text-xs text-[#6B6B6B] leading-relaxed">
          El motor garantiza cero solapamiento por manicurista. Las citas canceladas liberan el horario de forma inmediata.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/configuracion"
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Ajustar horarios e intervalos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

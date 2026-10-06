import React from "react";
import Image from "next/image";
import { Clock, Check } from "lucide-react";
import { ServiceItem } from "../types";

interface StepServiceSelectProps {
  services: ServiceItem[];
  selectedService: ServiceItem | null;
  onSelect: (srv: ServiceItem) => void;
  currency: string;
}

export default function StepServiceSelect({
  services,
  selectedService,
  onSelect,
  currency,
}: StepServiceSelectProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          1. Elige tu tratamiento de uñas
        </h2>
        <p className="text-xs text-[#8E8E8E] mt-1">
          Selecciona el servicio que deseas realizarte con nuestras especialistas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => {
          const isSelected = selectedService?.id === srv.id;
          return (
            <div
              key={srv.id}
              onClick={() => onSelect(srv)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center relative ${
                isSelected
                  ? "border-primary bg-[#E6F6F4]/30 ring-2 ring-primary/40 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs"
              }`}
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                <Image
                  src={srv.imagenPrincipal}
                  alt={srv.nombre}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {srv.category?.nombre || "Especialidad"}
                </span>
                <h3 className="text-sm font-bold text-[#1A1A1A] truncate">
                  {srv.nombre}
                </h3>
                <p className="text-xs text-[#6B6B6B] line-clamp-1 mt-0.5">
                  {srv.descripcionCorta}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-black text-[#3EA59E]">
                    {currency} {srv.precio.toFixed(0)}
                  </span>
                  <span className="text-xs text-[#8E8E8E] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {srv.duracionMinutos} min
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Sun, Moon, Loader2 } from "lucide-react";
import { StaffItem } from "../types";

interface StepDateTimeSelectProps {
  dates: Date[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  staffList: StaffItem[];
  selectedStaffId: string | null;
  onSelectStaff: (id: string | null) => void;
  shiftFilter: "all" | "morning" | "afternoon";
  onSelectShift: (s: "all" | "morning" | "afternoon") => void;
  loadingSlots: boolean;
  slots: { time: string; available: boolean; staffName?: string; startAt?: string }[];
  selectedSlot: string | null;
  onSelectSlot: (slotIso: string) => void;
}

export default function StepDateTimeSelect({
  dates,
  selectedDate,
  onSelectDate,
  staffList,
  selectedStaffId,
  onSelectStaff,
  shiftFilter,
  onSelectShift,
  loadingSlots,
  slots,
  selectedSlot,
  onSelectSlot,
}: StepDateTimeSelectProps) {
  // Filter slots by morning / afternoon
  const filteredSlots = slots.filter((slot) => {
    const slotHour = parseInt(slot.time.split(":")[0], 10);
    if (shiftFilter === "morning") return slotHour < 14;
    if (shiftFilter === "afternoon") return slotHour >= 14;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          2. Fecha y hora de tu cita
        </h2>
        <p className="text-xs text-[#8E8E8E] mt-1">
          Disponibilidad en tiempo real sin cruces de horarios.
        </p>
      </div>

      {/* Date Carousel */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
          <span>Selecciona el día:</span>
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((d, i) => {
            const dateStr = format(d, "yyyy-MM-dd");
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-white shadow-xs scale-102"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {format(d, "EEE", { locale: es })}
                </span>
                <span className="text-lg font-black my-0.5">
                  {format(d, "d")}
                </span>
                <span className="text-[10px] opacity-80">
                  {format(d, "MMM", { locale: es })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Staff Choice */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-700">
          ¿Prefieres alguna manicurista en particular?
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectStaff(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedStaffId === null
                ? "bg-primary text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Cualquiera disponible (Más rápido)
          </button>
          {staffList.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStaff(st.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedStaffId === st.id
                  ? "border-primary bg-[#E6F6F4] text-primary"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {st.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Shift filter tabs */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <span className="text-xs font-semibold text-gray-500 mr-2">Turno:</span>
        <button
          type="button"
          onClick={() => onSelectShift("all")}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
            shiftFilter === "all"
              ? "bg-[#1A1A1A] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => onSelectShift("morning")}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
            shiftFilter === "morning"
              ? "bg-[#1A1A1A] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Sun className="w-3 h-3 text-amber-500" />
          <span>Mañana (09:00 - 13:30)</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectShift("afternoon")}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
            shiftFilter === "afternoon"
              ? "bg-[#1A1A1A] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Moon className="w-3 h-3 text-primary" />
          <span>Tarde (14:00 - 20:00)</span>
        </button>
      </div>

      {/* Available Slots Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Horarios disponibles:</span>
        </label>

        {loadingSlots ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Consultando agenda en vivo...</span>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 text-xs">
            No hay horarios disponibles en este turno para el día seleccionado. Por favor elige otra fecha o turno.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {filteredSlots.map((slot, idx) => {
              // Usar el instante real que calcula la API (ya anclado a America/Lima).
              // Fallback al formato antiguo solo si no viniera startAt.
              const slotIso = slot.startAt || `${selectedDate}T${slot.time}:00`;
              const isSelected = selectedSlot === slotIso;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectSlot(slotIso)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all relative ${
                    isSelected
                      ? "bg-primary text-white shadow-xs scale-105 ring-2 ring-primary/40"
                      : slot.available
                      ? "bg-white border border-gray-200 text-[#1A1A1A] hover:border-primary hover:bg-[#E6F6F4]/20"
                      : "bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed line-through"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

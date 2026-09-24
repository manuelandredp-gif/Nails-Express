"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Sparkles,
  Scissors,
  Download,
  CalendarPlus,
  MessageCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfToday,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export interface ServiceWizardItem {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  precioDesde: boolean;
  duracionMinutos: number;
  categoria?: { nombre: string };
}

interface BookingWizardProps {
  services: ServiceWizardItem[];
  preselectedSlug?: string;
}

export default function BookingWizard({
  services,
  preselectedSlug,
}: BookingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Steps: 1 = Servicio, 2 = Fecha y hora, 3 = Tus datos, 4 = Confirmación
  const [step, setStep] = useState(1);

  // Step 1: Selected Service
  const [selectedService, setSelectedService] =
    useState<ServiceWizardItem | null>(null);

  // Step 2: Selected Date & Time
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isDayClosed, setIsDayClosed] = useState(false);

  // Step 3: Customer Details
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    notasCliente: "",
    aceptaPolitica: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Step 4: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Initialize preselected service from query or prop
  useEffect(() => {
    const slug = preselectedSlug || searchParams.get("service");
    if (slug && services.length > 0) {
      const match = services.find((s) => s.slug === slug);
      if (match) {
        setSelectedService(match);
      }
    } else if (services.length > 0 && !selectedService) {
      // Default to second or first item (e.g. Manicure en Gel)
      const defaultMatch =
        services.find((s) => s.slug === "manicure-en-gel") || services[0];
      setSelectedService(defaultMatch);
    }
  }, [services, preselectedSlug, searchParams]);

  // Fetch slots whenever service or date changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `/api/availability?serviceId=${selectedService.id}&date=${dateStr}`
        );
        const data = await res.json();

        if (res.ok) {
          setIsDayClosed(data.isClosed);
          setAvailableSlots(data.slots || []);
        } else {
          setIsDayClosed(true);
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedDate]);

  // Trigger celebration on step 4
  useEffect(() => {
    if (step === 4) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#5CC6BF", "#E8707A", "#F9E3E3", "#FFD700"],
      });
    }
  }, [step]);

  // Step 1 -> Step 2
  const handleServiceNext = () => {
    if (!selectedService) {
      toast.error("Por favor selecciona un servicio.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Step 2 -> Step 3
  const handleDateTimeNext = () => {
    if (!selectedSlot) {
      toast.error("Por favor selecciona un horario disponible.");
      return;
    }
    setStep(3);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Step 3: Submit Booking -> Step 4
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || formData.nombre.length < 2) {
      toast.error("Por favor ingresa tu nombre completo.");
      return;
    }

    if (!formData.celular.trim() || formData.celular.length < 8) {
      toast.error("Por favor ingresa un número de celular válido.");
      return;
    }

    if (!formData.aceptaPolitica) {
      toast.error("Debes aceptar la política de privacidad.");
      return;
    }

    const slotObj = availableSlots.find((s) => s.time === selectedSlot);
    if (!slotObj) {
      toast.error("El horario seleccionado no es válido.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        serviceId: selectedService!.id,
        startAt: slotObj.startAt,
        nombre: formData.nombre.trim(),
        celular: formData.celular.trim(),
        email: formData.email.trim() || undefined,
        notasCliente: formData.notasCliente.trim() || undefined,
        origen: "WEB",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No se pudo crear la reserva.");
        // Refresh availability if conflict
        if (res.status === 409) {
          setStep(2);
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          const refreshRes = await fetch(
            `/api/availability?serviceId=${selectedService!.id}&date=${dateStr}`
          );
          const refreshData = await refreshRes.json();
          setAvailableSlots(refreshData.slots || []);
        }
        return;
      }

      setConfirmedBooking(data.booking);
      setStep(4);
      toast.success("¡Cita confirmada con éxito!");
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar generation helpers
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDayOfWeek = (getDay(startOfMonth(currentMonth)) + 6) % 7; // Monday = 0
  const emptyDaysAtStart = Array.from({ length: startDayOfWeek });

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    if (!confirmedBooking) return "#";
    const start = new Date(confirmedBooking.startAt)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(confirmedBooking.endAt)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(
      `Cita Nails Express: ${confirmedBooking.servicio}`
    );
    const details = encodeURIComponent(
      `Código de reserva: ${confirmedBooking.codigo}\nManicurista: ${confirmedBooking.manicurista}\nPrecio: S/ ${confirmedBooking.precio}`
    );
    const location = encodeURIComponent("Av. San Martín 456, Tacna, Perú");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  // Generate .ICS file download
  const downloadIcsFile = () => {
    if (!confirmedBooking) return;
    const start = new Date(confirmedBooking.startAt)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(confirmedBooking.endAt)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nails Express//Reservas//ES
BEGIN:VEVENT
UID:${confirmedBooking.codigo}@nailsexpress.com
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:Cita Nails Express: ${confirmedBooking.servicio}
DESCRIPTION:Reserva código ${confirmedBooking.codigo}. Manicurista: ${confirmedBooking.manicurista}
LOCATION:Av. San Martín 456, Tacna, Perú
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cita-nails-express-${confirmedBooking.codigo}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* 4-Step Header Stepper (Exactly as images 04, 05, 06) */}
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Bar */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />

          {/* Active Progress Bar */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 z-0"
            style={{
              width:
                step === 1
                  ? "0%"
                  : step === 2
                  ? "33%"
                  : step === 3
                  ? "66%"
                  : "100%",
            }}
          />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                step >= 1
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              1
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                step === 1 ? "text-primary font-semibold" : "text-[#6B6B6B]"
              }`}
            >
              Servicio
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                step >= 2
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              2
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                step === 2 ? "text-primary font-semibold" : "text-[#6B6B6B]"
              }`}
            >
              Fecha y hora
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                step >= 3
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              3
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                step === 3 ? "text-primary font-semibold" : "text-[#6B6B6B]"
              }`}
            >
              Tus datos
            </span>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                step === 4
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              4
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                step === 4 ? "text-primary font-semibold" : "text-[#6B6B6B]"
              }`}
            >
              Confirmación
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PASO 1: SELECCIONAR SERVICIO (Reference Image 04)              */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Selecciona tu servicio
            </h1>
            <p className="mt-2 text-base text-[#6B6B6B]">
              Elige el servicio que más se adapte a ti.
            </p>
          </div>

          {/* 3x2 Grid of service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((srv) => {
              const isSelected = selectedService?.id === srv.id;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setSelectedService(srv)}
                  className={`p-6 rounded-[14px] text-center border transition-all duration-200 flex flex-col items-center justify-center min-h-[110px] ${
                    isSelected
                      ? "bg-[#E6F6F4] border-primary text-[#1A1A1A] shadow-sm ring-1 ring-primary"
                      : "bg-white border-[#ECECEC] text-[#1A1A1A] hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <span className="text-base font-bold leading-snug">
                    {srv.nombre}
                  </span>
                  <span className="text-xs text-[#E8707A] font-semibold mt-1">
                    {srv.precioDesde ? "Desde " : ""}S/ {srv.precio.toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="pt-8 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline text-sm py-2.5 px-6 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <button
              type="button"
              onClick={handleServiceNext}
              disabled={!selectedService}
              className="btn-primary text-sm py-2.5 px-8 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PASO 2: FECHA Y HORA (Reference Image 05)                     */}
      {/* ============================================================== */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Selecciona fecha y hora
            </h1>
            <p className="mt-2 text-base text-[#6B6B6B]">
              Elige el día y horario que mejor te convenga.
            </p>
          </div>

          {/* Two Columns: Calendar on Left, Timeslots on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Monthly Calendar */}
            <div className="md:col-span-6 bg-white border border-[#ECECEC] rounded-[18px] p-6 shadow-sm">
              {/* Month Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Mes anterior"
                >
                  <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
                </button>
                <span className="text-base font-bold text-[#1A1A1A] capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Mes siguiente"
                >
                  <ArrowRight className="w-4 h-4 text-[#1A1A1A]" />
                </button>
              </div>

              {/* Day headers: L M M J V S D */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8E8E8E] mb-3">
                <span>L</span>
                <span>M</span>
                <span>M</span>
                <span>J</span>
                <span>V</span>
                <span>S</span>
                <span>D</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {emptyDaysAtStart.map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}

                {daysInMonth.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = isBefore(day, today);
                  const isSunday = getDay(day) === 0;
                  const isDisabled = isPast || isSunday;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedDate(day)}
                      className={`h-10 w-10 mx-auto rounded-full text-sm flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-primary text-white font-bold shadow-sm"
                          : isDisabled
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-[#1A1A1A] hover:bg-gray-100 font-medium"
                      }`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Available Hours Grid */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Horarios disponibles
                </h3>
                <p className="text-xs text-[#6B6B6B] capitalize mt-0.5">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>

              {loadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#6B6B6B]">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <span className="text-xs">Consultando disponibilidad en tiempo real...</span>
                </div>
              ) : isDayClosed ? (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-[14px] text-center text-sm text-[#6B6B6B]">
                  El salón se encuentra cerrado este día. Por favor elige otra fecha.
                </div>
              ) : availableSlots.filter((s) => s.available).length === 0 ? (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-[14px] text-center text-sm text-[#6B6B6B]">
                  No quedan horarios libres para este día. Por favor selecciona otra fecha.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots
                    .filter((s) => s.available)
                    .map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-3 px-2 rounded-[12px] text-sm font-semibold border transition-all duration-200 ${
                            isSelected
                              ? "bg-[#E6F6F4] border-primary text-[#1A1A1A] ring-1 ring-primary shadow-sm"
                              : "bg-white border-[#ECECEC] text-[#1A1A1A] hover:border-gray-300 hover:bg-gray-50/50"
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

          {/* Action Bar */}
          <div className="pt-8 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-outline text-sm py-2.5 px-6 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <button
              type="button"
              onClick={handleDateTimeNext}
              disabled={!selectedSlot}
              className="btn-primary text-sm py-2.5 px-8 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PASO 3: TUS DATOS (Mismo lenguaje visual exacto)               */}
      {/* ============================================================== */}
      {step === 3 && (
        <form
          onSubmit={handleSubmitBooking}
          className="space-y-8 animate-in fade-in-50 duration-300"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Tus datos de contacto
            </h1>
            <p className="mt-2 text-base text-[#6B6B6B]">
              Completa tus datos para confirmar tu cita y enviarte el recordatorio.
            </p>
          </div>

          {/* Summary Strip */}
          <div className="bg-[#FAF3F3] border border-[#F2DADA] rounded-[14px] p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#8E8E8E] block">Servicio elegido:</span>
              <span className="text-sm font-bold text-[#1A1A1A]">
                {selectedService?.nombre}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#8E8E8E] block">Fecha y horario:</span>
              <span className="text-sm font-bold text-[#1A1A1A] capitalize">
                {format(selectedDate, "d 'de' MMMM", { locale: es })} • {selectedSlot} hrs
              </span>
            </div>
            <div>
              <span className="text-xs text-[#8E8E8E] block">Total:</span>
              <span className="text-sm font-bold text-[#E8707A]">
                S/ {selectedService?.precio.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Form fields with fine 1px borders */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
              >
                Nombre completo *
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej. Valeria Mendoza"
                className="w-full px-4 py-3 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="celular"
                  className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
                >
                  WhatsApp / Celular *
                </label>
                <input
                  id="celular"
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value })
                  }
                  placeholder="Ej. 952 123 456"
                  className="w-full px-4 py-3 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
                >
                  Correo electrónico (Opcional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="valeria@ejemplo.com"
                  className="w-full px-4 py-3 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notas"
                className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
              >
                Notas o preferencias especiales (Opcional)
              </label>
              <textarea
                id="notas"
                rows={3}
                value={formData.notasCliente}
                onChange={(e) =>
                  setFormData({ ...formData, notasCliente: e.target.value })
                }
                placeholder="¿Tienes alguna preferencia de color, referencia de diseño o detalle?"
                className="w-full px-4 py-3 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors resize-none"
              />
            </div>

            {/* Privacy acceptance */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aceptaPolitica}
                  onChange={(e) =>
                    setFormData({ ...formData, aceptaPolitica: e.target.checked })
                  }
                  className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs text-[#6B6B6B] leading-relaxed">
                  Acepto las políticas de privacidad y tratamiento de datos personales conforme a la Ley N° 29733 (Perú).
                </span>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-8 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-outline text-sm py-2.5 px-6 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm py-3 px-8 inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar reserva</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* PASO 4: CONFIRMACIÓN DE CITA (Reference Image 06)              */}
      {/* ============================================================== */}
      {step === 4 && confirmedBooking && (
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-400">
          {/* Calendar Check Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E6F6F4] text-primary mx-auto mb-2 border border-[#C5EDE8]">
            <CalendarIcon className="w-10 h-10" strokeWidth={1.5} />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              ¡Cita confirmada!
            </h1>
            <p className="mt-2 text-base text-[#6B6B6B]">
              Tu cita ha sido reservada con éxito. Código:{" "}
              <strong className="text-primary font-bold">
                {confirmedBooking.codigo}
              </strong>
            </p>
          </div>

          {/* Blush Pink 3-Column Strip (Matching Image 06 exactly) */}
          <div className="bg-[#FBEDED] rounded-[18px] p-6 sm:p-8 border border-[#F5D8D8] grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-center">
            {/* Column 1: Date & Time */}
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs">
                <CalendarIcon className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] capitalize">
                  {format(new Date(confirmedBooking.startAt), "EEEE d 'de' MMMM", {
                    locale: es,
                  })}
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  {format(new Date(confirmedBooking.startAt), "HH:mm")} hrs
                </p>
              </div>
            </div>

            {/* Column 2: Service & Price */}
            <div className="flex items-center space-x-3.5 border-y md:border-y-0 md:border-x border-[#F0D0D0] py-4 md:py-0 md:px-4">
              <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs">
                <Scissors className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {confirmedBooking.servicio}
                </p>
                <p className="text-xs text-[#E8707A] font-semibold">
                  S/ {confirmedBooking.precio}
                </p>
              </div>
            </div>

            {/* Column 3: Location */}
            <div className="flex items-center space-x-3.5 md:pl-2">
              <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Nails Express</p>
                <p className="text-xs text-[#6B6B6B]">Av. San Martín 456, Tacna</p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Exact styling of Image 06 */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={downloadIcsFile}
              className="btn-primary py-3 px-8 text-sm font-semibold inline-flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Agregar a mi calendario</span>
            </button>

            <a
              href={`/mis-citas?code=${confirmedBooking.codigo}&phone=${confirmedBooking.celular}`}
              className="btn-outline py-3 px-8 text-sm font-semibold inline-flex items-center gap-2"
            >
              <span>Ver mis citas</span>
            </a>
          </div>

          {/* WhatsApp Notification Link */}
          <div className="pt-2">
            <a
              href={`https://wa.me/51952123456?text=${encodeURIComponent(
                `¡Hola Nails Express! Acabo de reservar mi cita para ${confirmedBooking.servicio} el ${format(
                  new Date(confirmedBooking.startAt),
                  "d/MM/yyyy HH:mm"
                )} (Código: ${confirmedBooking.codigo}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-xs text-[#6B6B6B] hover:text-primary transition-colors gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              <span>Enviar confirmación por WhatsApp al estudio</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

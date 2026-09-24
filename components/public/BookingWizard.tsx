"use client";

import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { ServiceItem, StaffItem, BookingState } from "./booking/types";
import StepServiceSelect from "./booking/steps/StepServiceSelect";
import StepDateTimeSelect from "./booking/steps/StepDateTimeSelect";
import StepClientDetails from "./booking/steps/StepClientDetails";
import StepConfirmationTicket from "./booking/steps/StepConfirmationTicket";

interface BookingWizardProps {
  services: ServiceItem[];
  staffList?: StaffItem[];
  currency?: string;
  preselectedSlug?: string;
}

export default function BookingWizard({
  services,
  staffList = [],
  currency = "S/",
  preselectedSlug,
}: BookingWizardProps) {
  const searchParams = useSearchParams();
  const initialServiceSlug = preselectedSlug || searchParams.get("service");

  const [state, setState] = useState<BookingState>({
    step: 1,
    selectedService: null,
    selectedDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    selectedSlot: null,
    selectedStaffId: null,
    nombre: "",
    celular: "",
    email: "",
    notasCliente: "",
    confirmedBooking: null,
    shiftFilter: "all",
  });

  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Set initial service from query param if available
  useEffect(() => {
    if (initialServiceSlug && services.length > 0) {
      const match = services.find((s) => s.slug === initialServiceSlug);
      if (match) {
        setState((prev) => ({ ...prev, selectedService: match, step: 2 }));
      }
    } else if (services.length > 0 && !state.selectedService) {
      setState((prev) => ({ ...prev, selectedService: services[0] }));
    }
  }, [initialServiceSlug, services]);

  // Fetch slots whenever service, date, or staff changes
  useEffect(() => {
    if (!state.selectedService || !state.selectedDate) return;

    let isMounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const staffParam = state.selectedStaffId ? `&staffId=${state.selectedStaffId}` : "";
        const res = await fetch(
          `/api/availability?serviceId=${state.selectedService?.id}&date=${state.selectedDate}${staffParam}`
        );
        const data = await res.json();
        if (isMounted) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        if (isMounted) toast.error("Error al cargar disponibilidad.");
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [state.selectedService?.id, state.selectedDate, state.selectedStaffId]);

  // Next 14 dates for date carousel
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  // Submit appointment
  const handleSubmitBooking = async () => {
    if (!state.selectedService || !state.selectedSlot || !state.nombre.trim() || !state.celular.trim()) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: state.selectedService.id,
          startAt: state.selectedSlot,
          staffId: state.selectedStaffId || undefined,
          nombre: state.nombre.trim(),
          celular: state.celular.trim(),
          email: state.email.trim() || undefined,
          notasCliente: state.notasCliente.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No se pudo procesar la reserva.");
      } else {
        setState((prev) => ({
          ...prev,
          confirmedBooking: data.booking,
          step: 4,
        }));
        toast.success("¡Cita reservada con éxito!");
      }
    } catch (err) {
      toast.error("Error de conexión al procesar la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-10">
      {/* Step Indicator Header (Steps 1-3) */}
      {state.step < 4 && (
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    state.step === s
                      ? "bg-primary text-white shadow-xs"
                      : state.step > s
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {state.step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-bold ${
                    state.step === s ? "text-[#1A1A1A]" : "text-gray-400"
                  }`}
                >
                  {s === 1 ? "Servicio" : s === 2 ? "Fecha y Hora" : "Tus Datos"}
                </span>
                {s < 3 && <span className="text-gray-300 mx-1">›</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-[#E6F6F4] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Garantía Cero Solapamiento</span>
          </div>
        </div>
      )}

      {/* Step 1: Service Select */}
      {state.step === 1 && (
        <StepServiceSelect
          services={services}
          selectedService={state.selectedService}
          onSelect={(srv) => setState((prev) => ({ ...prev, selectedService: srv, step: 2 }))}
          currency={currency}
        />
      )}

      {/* Step 2: Date & Slot Select */}
      {state.step === 2 && (
        <StepDateTimeSelect
          dates={dates}
          selectedDate={state.selectedDate}
          onSelectDate={(d) => setState((prev) => ({ ...prev, selectedDate: d, selectedSlot: null }))}
          staffList={staffList}
          selectedStaffId={state.selectedStaffId}
          onSelectStaff={(id) => setState((prev) => ({ ...prev, selectedStaffId: id, selectedSlot: null }))}
          shiftFilter={state.shiftFilter}
          onSelectShift={(s) => setState((prev) => ({ ...prev, shiftFilter: s }))}
          loadingSlots={loadingSlots}
          slots={slots}
          selectedSlot={state.selectedSlot}
          onSelectSlot={(slotIso) => setState((prev) => ({ ...prev, selectedSlot: slotIso }))}
        />
      )}

      {/* Step 3: Client Details */}
      {state.step === 3 && (
        <StepClientDetails
          nombre={state.nombre}
          onChangeNombre={(v) => setState((prev) => ({ ...prev, nombre: v }))}
          celular={state.celular}
          onChangeCelular={(v) => setState((prev) => ({ ...prev, celular: v }))}
          email={state.email}
          onChangeEmail={(v) => setState((prev) => ({ ...prev, email: v }))}
          notasCliente={state.notasCliente}
          onChangeNotas={(v) => setState((prev) => ({ ...prev, notasCliente: v }))}
          selectedService={state.selectedService}
          selectedSlot={state.selectedSlot}
          currency={currency}
        />
      )}

      {/* Step 4: Confirmation Ticket */}
      {state.step === 4 && (
        <StepConfirmationTicket
          booking={state.confirmedBooking}
          currency={currency}
        />
      )}

      {/* Wizard Footer Controls (Steps 1-3) */}
      {state.step < 4 && (
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
          {state.step > 1 ? (
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, step: (prev.step - 1) as any }))}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <div />
          )}

          {state.step === 2 && (
            <button
              type="button"
              disabled={!state.selectedSlot}
              onClick={() => setState((prev) => ({ ...prev, step: 3 }))}
              className="btn-primary text-xs sm:text-sm py-2.5 px-6 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <span>Continuar con mis datos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {state.step === 3 && (
            <button
              type="button"
              disabled={submitting || !state.nombre.trim() || !state.celular.trim()}
              onClick={handleSubmitBooking}
              className="btn-primary text-xs sm:text-sm py-3 px-8 inline-flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando reserva...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar mi Cita</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

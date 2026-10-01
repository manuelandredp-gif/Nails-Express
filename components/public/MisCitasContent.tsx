"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  AlertCircle,
  XCircle,
  CalendarDays,
  CheckCircle,
  Loader2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import StampCard from "@/components/public/StampCard";

export default function MisCitasContent({
  nombreNegocio = "Nails Express",
  direccion = "",
}: {
  nombreNegocio?: string;
  direccion?: string;
}) {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const qCode = searchParams.get("code");
    const qPhone = searchParams.get("phone");
    if (qCode) setCode(qCode);
    if (qPhone) setPhone(qPhone);

    if (qCode) {
      searchAppointment(qCode, qPhone || "");
    }
  }, [searchParams]);

  const searchAppointment = async (searchCode: string, searchPhone: string) => {
    if (!searchCode.trim()) {
      toast.error("Por favor ingresa tu código de reserva (ej. NX-7K3P)");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/bookings/${encodeURIComponent(searchCode.trim())}${
        searchPhone ? `?phone=${encodeURIComponent(searchPhone.trim())}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No se encontró la cita.");
        setAppointment(null);
        setLoyalty(null);
      } else {
        setAppointment(data.appointment);
        setLoyalty(data.loyalty || null);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Ocurrió un error al buscar la cita.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchAppointment(code, phone);
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${appointment.codigo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CANCELAR",
          phone: phone || appointment?.customer?.celular,
          motivo: cancelReason.trim() || "Cancelado por el cliente",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No se pudo cancelar la cita.");
      } else {
        toast.success("Cita cancelada con éxito.");
        setAppointment(data.appointment);
        setCancelModalOpen(false);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Error al cancelar la cita.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-white min-h-[75vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Consultar mi cita
          </h1>
          <p className="mt-2 text-base text-[#6B6B6B]">
            Ingresa el código de tu reserva para ver los detalles, reprogramar o cancelar.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-[#FAF3F3] border border-[#F2DADA] rounded-[18px] p-6 mb-10 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="code"
                className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
              >
                Código de reserva *
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej. NX-7K3P"
                className="w-full px-4 py-2.5 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm bg-white font-mono uppercase"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
              >
                Celular (Opcional para validación)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 952 123 456"
                className="w-full px-4 py-2.5 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Consultar cita</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tarjeta de sellos de fidelidad */}
        {appointment && loyalty && <StampCard loyalty={loyalty} />}

        {/* Appointment Card */}
        {appointment && (
          <div className="bg-white border border-[#ECECEC] rounded-[18px] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-300">
            {/* Header info with status pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <span className="text-xs text-[#8E8E8E] block">Código de reserva</span>
                <span className="text-xl font-bold text-primary font-mono">
                  {appointment.codigo}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  appointment.estado === "CONFIRMADA"
                    ? "bg-green-100 text-green-700"
                    : appointment.estado === "COMPLETADA"
                    ? "bg-blue-100 text-blue-700"
                    : appointment.estado === "CANCELADA"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {appointment.estado}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="flex items-start space-x-3">
                <Scissors className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#8E8E8E] block">Servicio</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {appointment.service?.nombre}
                  </span>
                  <span className="block text-xs text-[#E8707A] font-semibold mt-0.5">
                    S/ {appointment.precio}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#8E8E8E] block">Manicurista</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {appointment.staff?.nombre}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#8E8E8E] block">Fecha y Hora</span>
                  <span className="font-semibold text-[#1A1A1A] capitalize">
                    {format(new Date(appointment.startAt), "EEEE d 'de' MMMM", {
                      locale: es,
                    })}
                  </span>
                  <span className="block text-xs text-[#6B6B6B]">
                    {format(new Date(appointment.startAt), "HH:mm")} hrs
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#8E8E8E] block">Local</span>
                  <span className="font-semibold text-[#1A1A1A]">{nombreNegocio}</span>
                  <span className="block text-xs text-[#6B6B6B]">
                    {direccion}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Cancel if status is CONFIRMADA */}
            {appointment.estado === "CONFIRMADA" && (
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[#8E8E8E]">
                  * Cancelaciones permitidas hasta con 12 h de anticipación.
                </p>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelar esta cita</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 shadow-xl">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                ¿Deseas cancelar tu cita?
              </h3>
              <p className="text-sm text-[#6B6B6B]">
                Tu horario quedará libre para otra persona. Por favor cuéntanos el motivo brevemente.
              </p>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo de cancelación (opcional)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary resize-none"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-btn font-medium"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-btn font-medium inline-flex items-center gap-2"
                >
                  {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirmar cancelación</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Zap, X, Clock, Scissors, User, Phone, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StaffItem {
  id: string;
  nombre: string;
  color: string;
}

interface ServiceItem {
  id: string;
  nombre: string;
  precio: number;
  duracionMinutos: number;
}

interface WalkInQuickModalProps {
  staffList: StaffItem[];
  servicesList: ServiceItem[];
  currency?: string;
}

export default function WalkInQuickModal({
  staffList,
  servicesList,
  currency = "S/",
}: WalkInQuickModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const now = new Date();
  // Format local datetime string: YYYY-MM-DDTHH:mm
  const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [form, setForm] = useState({
    nombre: "",
    celular: "",
    serviceId: servicesList[0]?.id || "",
    staffId: staffList[0]?.id || "",
    startAt: localDatetime,
    notasInternas: "Cliente al paso (Walk-in)",
  });

  const selectedService = servicesList.find((s) => s.id === form.serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error("Por favor ingresa el nombre de la clienta.");
      return;
    }
    if (!form.serviceId || !form.staffId) {
      toast.error("Selecciona servicio y manicurista.");
      return;
    }

    setLoading(true);
    try {
      // Calculate endAt based on service duration
      const startDate = new Date(form.startAt);
      const duration = selectedService?.duracionMinutos || 60;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          celular: form.celular.trim() || "000000000",
          serviceId: form.serviceId,
          staffId: form.staffId,
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
          notasCliente: "Cliente al paso / Recepción rápida",
          notasInternas: form.notasInternas,
          estado: "CONFIRMADA",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No se pudo registrar la cita. Verifica que no haya conflicto.");
      } else {
        toast.success(`¡Cita registrada con éxito! Código: ${data.appointment?.codigo || ""}`);
        setIsOpen(false);
        setForm({
          nombre: "",
          celular: "",
          serviceId: servicesList[0]?.id || "",
          staffId: staffList[0]?.id || "",
          startAt: localDatetime,
          notasInternas: "Cliente al paso (Walk-in)",
        });
        router.refresh();
      }
    } catch (err) {
      toast.error("Error de conexión al registrar cita al paso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3.5 rounded-full font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all hover:scale-102 active:scale-98"
      >
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span>Cliente al Paso</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Registro Rápido: Cliente al Paso
                </h3>
                <p className="text-xs text-[#8E8E8E]">
                  Ingreso directo en salón sin reserva previa
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre de la clienta *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gabriela Flores"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Celular / WhatsApp (opcional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="Ej. 952 123 456"
                    value={form.celular}
                    onChange={(e) => setForm({ ...form, celular: e.target.value })}
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                  >
                    {servicesList.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.nombre} ({currency} {srv.precio})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Manicurista *
                  </label>
                  <select
                    value={form.staffId}
                    onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                    className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hora de inicio (ahora)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none font-mono"
                  />
                </div>
                {selectedService && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Duración estimada: {selectedService.duracionMinutos} min • Total a cobrar: {currency} {selectedService.precio.toFixed(0)}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Validando agenda...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Iniciar Atención Ahora</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

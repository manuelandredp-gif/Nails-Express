import React from "react";
import { X, Loader2, CheckCircle, User, Phone, Clock } from "lucide-react";

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  creating: boolean;
  onSubmit: (e: React.FormEvent) => void;
  form: {
    nombre: string;
    celular: string;
    serviceId: string;
    staffId: string;
    startAt: string;
    notasCliente: string;
  };
  onChangeForm: (newForm: any) => void;
  servicesList: any[];
  staffList: any[];
}

export default function ManualBookingModal({
  isOpen,
  onClose,
  creating,
  onSubmit,
  form,
  onChangeForm,
  servicesList,
  staffList,
}: ManualBookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#1A1A1A]">Nueva Cita Manual</h3>
        <p className="text-xs text-[#8E8E8E] mt-1">
          Agenda un turno directo desde recepción con validación anti-colisión.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nombre de la Clienta *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carmen Quispe"
              value={form.nombre}
              onChange={(e) => onChangeForm({ ...form, nombre: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Celular / WhatsApp *
            </label>
            <input
              type="tel"
              required
              placeholder="Ej. 952 123 456"
              value={form.celular}
              onChange={(e) => onChangeForm({ ...form, celular: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Servicio *
              </label>
              <select
                value={form.serviceId}
                onChange={(e) => onChangeForm({ ...form, serviceId: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white"
              >
                {servicesList.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.nombre} (S/ {srv.precio})
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
                onChange={(e) => onChangeForm({ ...form, staffId: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white"
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
              Fecha y Hora de Inicio *
            </label>
            <input
              type="datetime-local"
              required
              value={form.startAt}
              onChange={(e) => onChangeForm({ ...form, startAt: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Crear Cita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from "react";
import { X, Loader2, Clock } from "lucide-react";

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: any[];
  form: {
    staffId: string;
    startAt: string;
    endAt: string;
    motivo: string;
  };
  onChangeForm: (newForm: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export default function TimeBlockModal({
  isOpen,
  onClose,
  staffList,
  form,
  onChangeForm,
  onSubmit,
  submitting,
}: TimeBlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#1A1A1A]">Bloquear Horario</h3>
        <p className="text-xs text-[#8E8E8E] mt-1">
          Inhabilita turnos por refrigerio, capacitación o ausencia temporal.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Personal Afectado
            </label>
            <select
              value={form.staffId}
              onChange={(e) => onChangeForm({ ...form, staffId: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white"
            >
              <option value="">Todo el salón (Bloqueo general)</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  Solo {st.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Motivo del Bloqueo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Almuerzo / Descanso"
              value={form.motivo}
              onChange={(e) => onChangeForm({ ...form, motivo: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="datetime-local"
                required
                value={form.startAt}
                onChange={(e) => onChangeForm({ ...form, startAt: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="datetime-local"
                required
                value={form.endAt}
                onChange={(e) => onChangeForm({ ...form, endAt: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary font-mono"
              />
            </div>
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
              disabled={submitting}
              className="btn-outline text-xs py-2 px-5 inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Bloqueando...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Confirmar Bloqueo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  X,
  User,
  Clock,
  Scissors,
  DollarSign,
  Phone,
  MessageCircle,
  FileText,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface AppointmentDetailDrawerProps {
  isOpen: boolean;
  appointment: any | null;
  onClose: () => void;
  internalNotes: string;
  onChangeInternalNotes: (notes: string) => void;
  onSaveNotes: () => void;
  onStatusChange: (status: string) => void;
  savingStatus: boolean;
}

export default function AppointmentDetailDrawer({
  isOpen,
  appointment,
  onClose,
  internalNotes,
  onChangeInternalNotes,
  onSaveNotes,
  onStatusChange,
  savingStatus,
}: AppointmentDetailDrawerProps) {
  if (!isOpen || !appointment) return null;

  const app = appointment;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8E8E8E] font-mono">
                {app.codigo}
              </span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Detalle de la Cita
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* Status Badge & Actions */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  Estado actual:
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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

              <div className="pt-2 border-t border-gray-200/60 flex flex-wrap gap-2">
                <button
                  disabled={savingStatus}
                  onClick={() => onStatusChange("COMPLETADA")}
                  className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Completar</span>
                </button>

                <button
                  disabled={savingStatus}
                  onClick={() => onStatusChange("NO_ASISTIO")}
                  className="btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>No Asistió</span>
                </button>

                <button
                  disabled={savingStatus}
                  onClick={() => onStatusChange("CANCELADA")}
                  className="text-xs font-semibold text-red-600 hover:bg-red-50 py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Cliente
              </h4>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-base text-[#1A1A1A]">
                    {app.customer.nombre}
                  </p>
                  <p className="text-xs text-gray-500">{app.customer.celular}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${app.customer.celular}`}
                    className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${app.customer.celular.replace(
                      /\+/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Service & Staff */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Servicio & Asignación
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-primary" />
                    <span>Servicio:</span>
                  </span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {app.service.nombre}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>Manicurista:</span>
                  </span>
                  <span
                    className="font-bold px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${app.staff.color}20`,
                      color: app.staff.color,
                    }}
                  >
                    {app.staff.nombre}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Horario:</span>
                  </span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {format(new Date(app.startAt), "HH:mm")} -{" "}
                    {format(new Date(app.endAt), "HH:mm")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>Precio:</span>
                  </span>
                  <span className="font-black text-[#3EA59E] text-base">
                    S/ {app.precio.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Notas Internas
                </h4>
                <button
                  onClick={onSaveNotes}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Guardar nota
                </button>
              </div>
              <textarea
                value={internalNotes}
                onChange={(e) => onChangeInternalNotes(e.target.value)}
                rows={3}
                placeholder="Añade notas del salón (ej. diseño específico, tono de esmalte, observación técnica)..."
                className="w-full text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

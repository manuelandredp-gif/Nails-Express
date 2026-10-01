"use client";

import React from "react";
import { X } from "lucide-react";
import type { AppointmentItem } from "./types";
import { METODOS_PAGO } from "./helpers";

interface Props {
  appointment: AppointmentItem;
  busy: boolean;
  /** true si al cobrar la cita debe completarse automáticamente. */
  completeAfterPay: boolean;
  onClose: () => void;
  /** Registra el cobro con el método elegido (o null si no se especifica). */
  onPay: (metodoPago: string | null) => void;
}

/** Modal de cobro: elige el método de pago (Efectivo/Yape/Plin/Tarjeta). */
export default function PayModal({ appointment, busy, completeAfterPay, onClose, onPay }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Registrar cobro</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {appointment.customer.nombre} · S/ {appointment.precio.toFixed(0)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 font-medium">¿Cómo pagó la clienta?</p>
        {completeAfterPay && (
          <p className="text-[0.7rem] text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
            Al registrar el cobro, la cita se marcará como completada (suma el
            sello) y podrás evaluar a la clienta.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {METODOS_PAGO.map((m) => (
            <button
              key={m.id}
              disabled={busy}
              onClick={() => onPay(m.id)}
              className="py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
        <button
          disabled={busy}
          onClick={() => onPay(null)}
          className="w-full text-[0.7rem] text-gray-400 hover:text-gray-600 underline disabled:opacity-50"
        >
          Solo marcar como pagada (sin método)
        </button>
      </div>
    </div>
  );
}

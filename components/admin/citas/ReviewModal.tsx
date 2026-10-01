"use client";

import React, { useState } from "react";
import { Star, X } from "lucide-react";
import type { AppointmentItem } from "./types";

interface Props {
  appointment: AppointmentItem;
  busy: boolean;
  onClose: () => void;
  onSave: (estrellas: number | null, texto: string) => void;
}

/** Evaluación privada de la clienta (estrellas + nota). No se publica en la web. */
export default function ReviewModal({ appointment, busy, onClose, onSave }: Props) {
  const [estrellas, setEstrellas] = useState<number>(appointment.resenaEstrellas || 0);
  const [texto, setTexto] = useState<string>(appointment.resenaTexto || "");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Reseña privada</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {appointment.customer.nombre} · {appointment.service.nombre}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[0.7rem] text-gray-400">
          Solo la ves vos en el panel. No se publica en la web.
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Calificación</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEstrellas(n === estrellas ? 0 : n)}
                className="p-1"
              >
                <Star
                  className={`w-7 h-7 ${n <= estrellas ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nota</label>
          <textarea
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. Clienta muy puntual, le gustó el tono nude, volver a ofrecer diseño floral."
            className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button onClick={onClose} className="btn-outline text-xs py-2 px-4">
            Cancelar
          </button>
          <button
            onClick={() => onSave(estrellas || null, texto)}
            disabled={busy}
            className="btn-primary text-xs py-2 px-5 disabled:opacity-50"
          >
            {busy ? "Guardando..." : "Guardar reseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

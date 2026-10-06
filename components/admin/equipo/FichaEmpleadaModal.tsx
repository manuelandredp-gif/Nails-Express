"use client";

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { FichaDraft, inputCls } from "./shared";

interface Props {
  initial: FichaDraft;
  busy: boolean;
  onClose: () => void;
  onSave: (draft: FichaDraft) => void;
}

/** Modal para crear o editar la ficha de una empleada (nombre, DNI, contacto, color). */
export default function FichaEmpleadaModal({ initial, busy, onClose, onSave }: Props) {
  const [ficha, setFicha] = useState<FichaDraft>(initial);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-[#1A1A1A]">
            {ficha.staffId ? "Editar empleada" : "Nueva empleada"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-[#6B6B6B]">Nombre completo *</span>
              <input
                value={ficha.nombre}
                onChange={(e) => setFicha({ ...ficha, nombre: e.target.value })}
                placeholder="Ej. Valentina Castro"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#6B6B6B]">DNI</span>
              <input
                value={ficha.dni}
                onChange={(e) => setFicha({ ...ficha, dni: e.target.value })}
                placeholder="12345678"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#6B6B6B]">Teléfono</span>
              <input
                value={ficha.telefono}
                onChange={(e) => setFicha({ ...ficha, telefono: e.target.value })}
                placeholder="+51 999 999 999"
                className={inputCls}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-[#6B6B6B]">Correo</span>
              <input
                type="email"
                value={ficha.email}
                onChange={(e) => setFicha({ ...ficha, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className={inputCls}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-[#6B6B6B]">Dirección</span>
              <input
                value={ficha.direccion}
                onChange={(e) => setFicha({ ...ficha, direccion: e.target.value })}
                placeholder="Av. ..., Tacna"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#6B6B6B]">Color en la agenda</span>
              <input
                type="color"
                value={ficha.color}
                onChange={(e) => setFicha({ ...ficha, color: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-[#E1F4F1] cursor-pointer"
              />
            </label>
          </div>
          <p className="text-[0.7rem] text-[#8E8E8E]">
            * La empleada aparece en la agenda al guardarla. Luego dale su acceso al
            panel con el botón «Dar acceso» y asígnale un rol.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-[#ECECEC] flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="text-sm py-2 px-4 rounded-lg border border-[#E1F4F1] text-[#6B6B6B] hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(ficha)}
            disabled={busy}
            className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {busy ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

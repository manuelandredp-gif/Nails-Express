"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

/**
 * Zona de mantenimiento: borra los datos de PRUEBA (citas, clientas, premios
 * y, opcionalmente, las manicuristas de ejemplo) para empezar con datos reales.
 */
export default function MaintenanceCard() {
  const [incluirManicuristas, setIncluirManicuristas] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const handleClean = async () => {
    const ok1 = window.confirm(
      "Esto borrará TODAS las citas, clientas y premios" +
        (incluirManicuristas ? ", y también las manicuristas con sus accesos" : "") +
        ".\n\nNo borra servicios, textos de la web, testimonios, galería ni blog.\n\n¿Continuar?"
    );
    if (!ok1) return;
    const typed = window.prompt('Para confirmar, escribe: BORRAR');
    if (!typed || typed.trim().toUpperCase() !== "BORRAR") {
      toast.info("Cancelado. No se borró nada.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmar: "BORRAR PRUEBAS",
          incluirManicuristas,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const b = data.borrado;
      const msg = `Listo: ${b.citas} citas, ${b.clientas} clientas y ${b.premios} premios borrados` +
        (incluirManicuristas ? `, más ${b.manicuristas} manicuristas de ejemplo.` : ".");
      setResultado(msg);
      toast.success("Datos de prueba eliminados.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-red-50/60 border-b border-red-100 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="font-bold text-[#1A1A1A]">Zona de mantenimiento</h2>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-[#6B6B6B]">
          ¿Estuviste haciendo pruebas? Este botón borra{" "}
          <strong>todas las citas, clientas y premios</strong> para que empieces
          de cero con datos reales. No toca tus servicios, los textos de la web,
          testimonios, galería ni blog.
        </p>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1A1A1A]">
          <input
            type="checkbox"
            checked={incluirManicuristas}
            onChange={(e) => setIncluirManicuristas(e.target.checked)}
            className="w-4 h-4 accent-red-500"
          />
          Borrar también las manicuristas de ejemplo (y sus accesos)
        </label>
        {incluirManicuristas && (
          <p className="text-[0.7rem] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Después de borrarlas, agrega a tus manicuristas reales en{" "}
            <strong>Horarios y Equipo</strong> — la web necesita al menos una
            para recibir reservas.
          </p>
        )}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleClean}
            disabled={busy}
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-2.5 px-5 transition-colors disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
            {busy ? "Borrando..." : "Borrar datos de prueba"}
          </button>
          {resultado && (
            <p className="text-xs font-semibold text-emerald-700">{resultado}</p>
          )}
        </div>
      </div>
    </div>
  );
}

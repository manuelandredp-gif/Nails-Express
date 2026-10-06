"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";

export default function ChangePasswordForm() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (nueva !== repetir) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setActual("");
      setNueva("");
      setRepetir("");
      toast.success("Contraseña actualizada correctamente.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]";

  return (
    <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-[#F0FAF9] to-[#F0FBFA] border-b border-[#F0D9E0] flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-[#3EA59E]" />
        <h2 className="font-bold text-[#1A1A1A]">Cambiar mi contraseña</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-[#6B6B6B]">
            Contraseña actual
          </span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className={inputCls + " pr-10"}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 translate-y-[2px] text-[#8E8E8E]"
              tabIndex={-1}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#6B6B6B]">
            Nueva contraseña
          </span>
          <input
            type={show ? "text" : "password"}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className={inputCls}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#6B6B6B]">
            Repetir nueva contraseña
          </span>
          <input
            type={show ? "text" : "password"}
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {busy ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

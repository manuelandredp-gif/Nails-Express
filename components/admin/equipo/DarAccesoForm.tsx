"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ROLES, inputCls } from "./shared";

interface Props {
  emailInicial?: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (datos: { email: string; password: string; rol: string }) => void;
}

/** Formulario inline para darle a una empleada su cuenta de acceso y rol. */
export default function DarAccesoForm({ emailInicial = "", busy, onCancel, onSubmit }: Props) {
  const [email, setEmail] = useState(emailInicial);
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("MANICURISTA");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="mt-3 p-4 rounded-xl bg-[#FDF2F6] border border-[#F0D9E0] space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">
            Correo (para iniciar sesión)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">Contraseña</span>
          <div className="mt-1 relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-[#E6D3DA] px-3 py-2 pr-9 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B8890]"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>
      </div>

      <div>
        <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">Rol en el panel</span>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRol(r.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-colors ${
                rol === r.id
                  ? "border-[#E26D9A] bg-white ring-2 ring-[#F3A6BC]/50"
                  : "border-[#E6D3DA] bg-white/60 hover:bg-white"
              }`}
            >
              <span className="font-bold text-[#1A1A1A] block">{r.label}</span>
              <span className="text-[0.65rem] text-[#9B8890] leading-tight block mt-0.5">
                {r.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-xs py-2 px-3 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSubmit({ email, password, rol })}
          disabled={busy}
          className="btn-primary text-xs py-2 px-4 disabled:opacity-60"
        >
          {busy ? "Creando..." : "Crear acceso"}
        </button>
      </div>
    </div>
  );
}

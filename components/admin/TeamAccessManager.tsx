"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserPlus,
  Lock,
} from "lucide-react";

interface Cuenta {
  userId: string;
  email: string;
  activo: boolean;
}

interface Manicurista {
  staffId: string;
  nombre: string;
  foto: string;
  color: string;
  cuenta: Cuenta | null;
}

interface Manager {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface Props {
  manicuristas: Manicurista[];
  managers: Manager[];
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Dueña",
  ADMIN: "Administración",
};

export default function TeamAccessManager({ manicuristas, managers }: Props) {
  const [rows, setRows] = useState<Manicurista[]>(manicuristas);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Formulario inline "dar acceso": staffId actualmente abierto
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const updateRow = (staffId: string, cuenta: Cuenta | null) =>
    setRows((prev) =>
      prev.map((r) => (r.staffId === staffId ? { ...r, cuenta } : r))
    );

  const startGiveAccess = (m: Manicurista) => {
    setOpenForm(m.staffId);
    setEmail("");
    setPassword("");
    setShowPwd(false);
  };

  const handleGiveAccess = async (m: Manicurista) => {
    if (!email.trim() || !password) {
      toast.error("Escribe un correo y una contraseña.");
      return;
    }
    setBusyId(m.staffId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: m.nombre,
          email,
          password,
          staffId: m.staffId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear acceso");
      updateRow(m.staffId, {
        userId: data.user.id,
        email: data.user.email,
        activo: data.user.activo,
      });
      setOpenForm(null);
      toast.success(`${m.nombre} ya puede iniciar sesión.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const patchUser = async (
    m: Manicurista,
    body: any,
    okMsg: string
  ) => {
    if (!m.cuenta) return;
    setBusyId(m.staffId);
    try {
      const res = await fetch(`/api/admin/users/${m.cuenta.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      updateRow(m.staffId, {
        userId: data.user.id,
        email: data.user.email,
        activo: data.user.activo,
      });
      toast.success(okMsg);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (m: Manicurista) => {
    const nueva = window.prompt(
      `Nueva contraseña para ${m.nombre} (mínimo 6 caracteres):`
    );
    if (!nueva) return;
    if (nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    await patchUser(m, { password: nueva }, "Contraseña actualizada.");
  };

  const handleRemoveAccess = async (m: Manicurista) => {
    if (!m.cuenta) return;
    if (
      !window.confirm(
        `¿Quitar el acceso de ${m.nombre}? Ya no podrá iniciar sesión (seguirá apareciendo en la agenda).`
      )
    )
      return;
    setBusyId(m.staffId);
    try {
      const res = await fetch(`/api/admin/users/${m.cuenta.userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      updateRow(m.staffId, null);
      toast.success("Acceso eliminado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          Equipo y Accesos
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
          Dale una cuenta a cada manicurista para que entre al panel. Verá{" "}
          <strong>solo sus citas</strong>: podrá atender, cobrar y poner sellos,
          pero <strong>no verá la caja ni editará la web</strong>.
        </p>
      </div>

      {/* Manicuristas */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5CC6BF]" />
          <h2 className="font-bold text-[#1A1A1A]">Mis manicuristas</h2>
          <span className="ml-auto text-xs text-[#9B8890]">
            {rows.filter((r) => r.cuenta).length}/{rows.length} con acceso
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#9B8890]">
            Aún no tienes manicuristas. Agrégalas primero en{" "}
            <strong>Horarios y Equipo</strong>.
          </p>
        ) : (
          <ul className="divide-y divide-[#F3F3F3]">
            {rows.map((m) => (
              <li key={m.staffId} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {m.nombre}
                      {m.cuenta && !m.cuenta.activo && (
                        <span className="ml-2 text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          Desactivada
                        </span>
                      )}
                    </p>
                    {m.cuenta ? (
                      <p className="text-xs text-emerald-700 truncate inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {m.cuenta.email}
                      </p>
                    ) : (
                      <p className="text-xs text-[#9B8890] inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Sin acceso al panel
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {m.cuenta ? (
                      <>
                        <button
                          onClick={() =>
                            patchUser(
                              m,
                              { activo: !m.cuenta!.activo },
                              m.cuenta!.activo
                                ? "Acceso desactivado."
                                : "Acceso activado."
                            )
                          }
                          disabled={busyId === m.staffId}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            m.cuenta.activo
                              ? "text-amber-700 border-amber-200 hover:bg-amber-50"
                              : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          {m.cuenta.activo ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleResetPassword(m)}
                          disabled={busyId === m.staffId}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Clave
                        </button>
                        <button
                          onClick={() => handleRemoveAccess(m)}
                          disabled={busyId === m.staffId}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Quitar acceso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : openForm === m.staffId ? null : (
                      <button
                        onClick={() => startGiveAccess(m)}
                        className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Dar acceso
                      </button>
                    )}
                  </div>
                </div>

                {/* Formulario inline para dar acceso */}
                {openForm === m.staffId && !m.cuenta && (
                  <div className="mt-3 p-3 rounded-xl bg-[#FDF2F6] border border-[#F0D9E0] grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="block">
                      <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">
                        Correo (para iniciar sesión)
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="mt-1 w-full rounded-lg border border-[#E6D3DA] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">
                        Contraseña
                      </span>
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
                          {showPwd ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGiveAccess(m)}
                        disabled={busyId === m.staffId}
                        className="btn-primary text-xs py-2 px-3 disabled:opacity-60"
                      >
                        {busyId === m.staffId ? "Creando..." : "Guardar"}
                      </button>
                      <button
                        onClick={() => setOpenForm(null)}
                        className="text-xs py-2 px-3 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cuentas de administración */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-[#1A1A1A]">Administración (acceso total)</h2>
        </div>
        <ul className="divide-y divide-[#F3F3F3]">
          {managers.map((u) => (
            <li key={u.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {u.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {u.nombre}
                </p>
                <p className="text-xs text-[#9B8890] truncate">{u.email}</p>
              </div>
              <span className="ml-auto text-[0.65rem] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                {ROLE_LABEL[u.rol] || u.rol}
              </span>
            </li>
          ))}
        </ul>
        <p className="px-5 py-3 text-[0.7rem] text-[#9B8890] border-t border-[#F3F3F3]">
          Tu cuenta tiene acceso total. Cambia tu contraseña en{" "}
          <strong>Mi cuenta</strong>.
        </p>
      </div>
    </div>
  );
}

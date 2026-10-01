"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  KeyRound,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface TeamUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  staffId: string | null;
  createdAt: string;
}

interface StaffLite {
  id: string;
  nombre: string;
}

interface Props {
  initialUsers: TeamUser[];
  staff: StaffLite[];
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Dueña",
  ADMIN: "Administración",
  RECEPCION: "Recepción",
  MANICURISTA: "Trabajadora",
};

export default function TeamAccessManager({ initialUsers, staff }: Props) {
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Formulario de alta
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffId, setStaffId] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [creating, setCreating] = useState(false);

  const workers = users.filter((u) => u.rol === "MANICURISTA" || u.rol === "RECEPCION");
  const managers = users.filter((u) => u.rol === "OWNER" || u.rol === "ADMIN");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password) {
      toast.error("Completa nombre, correo y contraseña.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, staffId: staffId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear");
      setUsers((prev) => [...prev, data.user]);
      setNombre("");
      setEmail("");
      setPassword("");
      setStaffId("");
      toast.success("Trabajadora creada. Ya puede iniciar sesión.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const patchUser = async (id: string, body: any, okMsg: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      toast.success(okMsg);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (u: TeamUser) => {
    const nueva = window.prompt(
      `Nueva contraseña para ${u.nombre} (mínimo 6 caracteres):`
    );
    if (!nueva) return;
    if (nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    await patchUser(u.id, { password: nueva }, "Contraseña actualizada.");
  };

  const handleDelete = async (u: TeamUser) => {
    if (!window.confirm(`¿Quitar el acceso de ${u.nombre}? Esta acción no se puede deshacer.`))
      return;
    setBusyId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success("Acceso eliminado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const staffName = (id: string | null) =>
    id ? staff.find((s) => s.id === id)?.nombre || "—" : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          Equipo y Accesos
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
          Crea cuentas para tus trabajadoras. Ellas solo verán la agenda y las
          citas: podrán atender, cobrar y poner sellos, pero{" "}
          <strong>no verán la caja ni podrán editar la web</strong>.
        </p>
      </div>

      {/* Alta de trabajadora */}
      <div className="bg-white rounded-2xl border border-[#F0D9E0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-[#FDF2F6] to-[#F0FBFA] border-b border-[#F0D9E0] flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#E26D9A]" />
          <h2 className="font-bold text-[#1A1A1A]">Agregar trabajadora</h2>
        </div>
        <form onSubmit={handleCreate} className="p-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B]">Nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Valentina"
              className="mt-1 w-full rounded-lg border border-[#E6D3DA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B]">
              Correo (para iniciar sesión)
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="valentina@correo.com"
              className="mt-1 w-full rounded-lg border border-[#E6D3DA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B]">Contraseña</span>
            <div className="mt-1 relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-[#E6D3DA] px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]"
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
          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B]">
              Vincular a manicurista (opcional)
            </span>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E6D3DA] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]"
            >
              <option value="">— Sin vincular —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <span className="text-[0.65rem] text-[#9B8890] mt-1 block">
              Si la vinculas, solo verá sus propias citas.
            </span>
          </label>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2 disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              {creating ? "Creando..." : "Crear acceso"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de trabajadoras */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-[#5CC6BF]" />
          <h2 className="font-bold text-[#1A1A1A]">Trabajadoras</h2>
          <span className="ml-auto text-xs text-[#9B8890]">
            {workers.length} con acceso
          </span>
        </div>

        {workers.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#9B8890]">
            Aún no has creado ninguna trabajadora.
          </p>
        ) : (
          <ul className="divide-y divide-[#F3F3F3]">
            {workers.map((u) => (
              <li
                key={u.id}
                className="px-5 py-3.5 flex flex-wrap items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#FDF2F6] text-[#E26D9A] flex items-center justify-center font-bold text-sm shrink-0">
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {u.nombre}
                    {!u.activo && (
                      <span className="ml-2 text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        Desactivada
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#9B8890] truncate">
                    {u.email} · {staffName(u.staffId)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      patchUser(
                        u.id,
                        { activo: !u.activo },
                        u.activo ? "Acceso desactivado." : "Acceso activado."
                      )
                    }
                    disabled={busyId === u.id}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                      u.activo
                        ? "text-amber-700 border-amber-200 hover:bg-amber-50"
                        : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                    title={u.activo ? "Desactivar acceso" : "Activar acceso"}
                  >
                    {u.activo ? (
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
                    onClick={() => handleResetPassword(u)}
                    disabled={busyId === u.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Cambiar contraseña"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Clave
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={busyId === u.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Eliminar acceso"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cuentas de administración (solo lectura) */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-[#1A1A1A]">Administración</h2>
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
          Las cuentas de administración tienen acceso total. Cambia tu propia
          contraseña desde <strong>Configuración → Mi cuenta</strong>.
        </p>
      </div>
    </div>
  );
}

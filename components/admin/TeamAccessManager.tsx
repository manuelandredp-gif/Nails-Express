"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  KeyRound,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  UserPlus,
  Lock,
  Pencil,
  Phone,
  MapPin,
  IdCard,
  Mail,
} from "lucide-react";
import {
  Empleada,
  Manager,
  FichaDraft,
  FICHA_VACIA,
  ROLES,
  ROL_CHIP,
  ROL_NOMBRE,
} from "./equipo/shared";
import FichaEmpleadaModal from "./equipo/FichaEmpleadaModal";
import DarAccesoForm from "./equipo/DarAccesoForm";

interface Props {
  empleadas: Empleada[];
  managers: Manager[];
  miUserId: string;
}

export default function TeamAccessManager({ empleadas, managers, miUserId }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Empleada[]>(empleadas);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal de ficha (crear / editar empleada) y formulario inline de acceso.
  const [ficha, setFicha] = useState<FichaDraft | null>(null);
  const [accesoFor, setAccesoFor] = useState<string | null>(null);

  const updateRow = (staffId: string, patch: Partial<Empleada>) =>
    setRows((prev) =>
      prev.map((r) => (r.staffId === staffId ? { ...r, ...patch } : r))
    );

  /* ---------- CRUD de la ficha (Staff) ---------- */

  const guardarFicha = async (draft: FichaDraft) => {
    if (!draft.nombre.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    const esEdicion = Boolean(draft.staffId);
    setBusyId(draft.staffId || "nueva");
    try {
      const res = await fetch(
        esEdicion ? `/api/admin/staff/${draft.staffId}` : "/api/admin/staff",
        {
          method: esEdicion ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: draft.nombre,
            dni: draft.dni,
            telefono: draft.telefono,
            email: draft.email,
            direccion: draft.direccion,
            color: draft.color,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      if (esEdicion) {
        updateRow(draft.staffId!, {
          nombre: data.staff.nombre,
          dni: data.staff.dni,
          telefono: data.staff.telefono,
          email: data.staff.email,
          direccion: data.staff.direccion,
          color: data.staff.color,
        });
        toast.success("Ficha actualizada.");
      } else {
        setRows((prev) => [
          ...prev,
          {
            staffId: data.staff.id,
            nombre: data.staff.nombre,
            foto: data.staff.foto,
            color: data.staff.color,
            activo: data.staff.activo,
            dni: data.staff.dni,
            telefono: data.staff.telefono,
            email: data.staff.email,
            direccion: data.staff.direccion,
            cuenta: null,
          },
        ]);
        toast.success("Empleada registrada. Ya aparece en la agenda.");
      }
      setFicha(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const eliminarEmpleada = async (m: Empleada) => {
    if (
      !window.confirm(
        `¿Eliminar a ${m.nombre}? Se borra su ficha y su acceso al panel.`
      )
    )
      return;
    setBusyId(m.staffId);
    try {
      const res = await fetch(`/api/admin/staff/${m.staffId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (data.desactivada) {
        updateRow(m.staffId, { activo: false, cuenta: null });
        toast.info(data.mensaje);
      } else {
        setRows((prev) => prev.filter((x) => x.staffId !== m.staffId));
        toast.success("Empleada eliminada.");
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Acceso (User) ---------- */

  const crearAcceso = async (
    m: Empleada,
    datos: { email: string; password: string; rol: string }
  ) => {
    if (!datos.email.trim() || !datos.password) {
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
          email: datos.email,
          password: datos.password,
          staffId: m.staffId,
          rol: datos.rol,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear acceso");
      updateRow(m.staffId, {
        cuenta: {
          userId: data.user.id,
          email: data.user.email,
          rol: data.user.rol,
          activo: data.user.activo,
        },
      });
      setAccesoFor(null);
      toast.success(`${m.nombre} ya puede iniciar sesión como ${ROL_NOMBRE[data.user.rol]}.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const patchCuenta = async (m: Empleada, body: any, okMsg: string) => {
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
        cuenta: {
          userId: data.user.id,
          email: data.user.email,
          rol: data.user.rol,
          activo: data.user.activo,
        },
      });
      toast.success(okMsg);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const resetClave = async (m: Empleada) => {
    const nueva = window.prompt(
      `Nueva contraseña para ${m.nombre} (mínimo 6 caracteres):`
    );
    if (!nueva) return;
    if (nueva.length < 6) {
      toast.error("Mínimo 6 caracteres.");
      return;
    }
    await patchCuenta(m, { password: nueva }, "Contraseña actualizada.");
  };

  const quitarAcceso = async (m: Empleada) => {
    if (!m.cuenta) return;
    if (
      !window.confirm(
        `¿Quitar el acceso de ${m.nombre}? Seguirá en la agenda, pero no podrá iniciar sesión.`
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
      updateRow(m.staffId, { cuenta: null });
      toast.success("Acceso eliminado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Equipo y Accesos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5 max-w-xl">
            Registra a tus empleadas con sus datos, asígnales un rol y dales su
            cuenta para entrar al panel. Todo queda guardado en la base de datos.
          </p>
        </div>
        <button
          onClick={() => setFicha({ ...FICHA_VACIA })}
          className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" /> Agregar empleada
        </button>
      </div>

      {/* Lista de empleadas */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5CC6BF]" />
          <h2 className="font-bold text-[#1A1A1A]">Mi equipo</h2>
          <span className="ml-auto text-xs text-[#9B8890]">
            {rows.filter((r) => r.cuenta).length}/{rows.length} con acceso
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#9B8890]">
            Aún no has registrado empleadas. Usa «Agregar empleada» para crear la
            primera: aparecerá en la agenda y podrás darle acceso al panel.
          </p>
        ) : (
          <ul className="divide-y divide-[#F3F3F3]">
            {rows.map((m) => (
              <li key={m.staffId} className={`px-5 py-4 ${m.activo ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.nombre.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2 flex-wrap">
                      {m.nombre}
                      {m.cuenta && (
                        <span
                          className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold ${ROL_CHIP[m.cuenta.rol] || "bg-gray-100 text-gray-600"}`}
                        >
                          {ROL_NOMBRE[m.cuenta.rol] || m.cuenta.rol}
                        </span>
                      )}
                      {!m.activo && (
                        <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          Inactiva
                        </span>
                      )}
                      {m.cuenta && !m.cuenta.activo && (
                        <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          Acceso suspendido
                        </span>
                      )}
                    </p>

                    {/* Ficha resumida */}
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[0.7rem] text-[#9B8890]">
                      {m.dni && (
                        <span className="inline-flex items-center gap-1">
                          <IdCard className="w-3 h-3" /> DNI {m.dni}
                        </span>
                      )}
                      {m.telefono && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {m.telefono}
                        </span>
                      )}
                      {m.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {m.email}
                        </span>
                      )}
                      {m.direccion && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {m.direccion}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs">
                      {m.cuenta ? (
                        <span className="text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Entra con {m.cuenta.email}
                        </span>
                      ) : (
                        <span className="text-[#9B8890] inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Sin acceso al panel
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() =>
                        setFicha({
                          staffId: m.staffId,
                          nombre: m.nombre,
                          dni: m.dni || "",
                          telefono: m.telefono || "",
                          email: m.email || "",
                          direccion: m.direccion || "",
                          color: m.color,
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>

                    {m.cuenta ? (
                      <>
                        <select
                          value={m.cuenta.rol}
                          disabled={busyId === m.staffId || m.cuenta.userId === miUserId}
                          onChange={(e) =>
                            patchCuenta(
                              m,
                              { rol: e.target.value },
                              `Rol cambiado a ${ROL_NOMBRE[e.target.value]}.`
                            )
                          }
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-[#E6D3DA] bg-white text-[#1A1A1A] disabled:opacity-50"
                          title="Cambiar rol"
                        >
                          {ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            patchCuenta(
                              m,
                              { activo: !m.cuenta!.activo },
                              m.cuenta!.activo ? "Acceso suspendido." : "Acceso activado."
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
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => resetClave(m)}
                          disabled={busyId === m.staffId}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-gray-50 transition-colors disabled:opacity-50"
                          title="Cambiar contraseña"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => quitarAcceso(m)}
                          disabled={busyId === m.staffId}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
                          title="Quitar acceso (mantiene la ficha)"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : accesoFor === m.staffId ? null : (
                      <button
                        onClick={() => setAccesoFor(m.staffId)}
                        className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Dar acceso
                      </button>
                    )}

                    <button
                      onClick={() => eliminarEmpleada(m)}
                      disabled={busyId === m.staffId}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Eliminar empleada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Formulario inline: dar acceso */}
                {accesoFor === m.staffId && !m.cuenta && (
                  <DarAccesoForm
                    emailInicial={m.email || ""}
                    busy={busyId === m.staffId}
                    onCancel={() => setAccesoFor(null)}
                    onSubmit={(datos) => crearAcceso(m, datos)}
                  />
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
          <h2 className="font-bold text-[#1A1A1A]">Administración</h2>
        </div>
        <ul className="divide-y divide-[#F3F3F3]">
          {managers.map((u) => (
            <li key={u.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {u.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">{u.nombre}</p>
                <p className="text-xs text-[#9B8890] truncate">{u.email}</p>
              </div>
              <span className={`ml-auto text-[0.65rem] px-2 py-0.5 rounded-full font-semibold ${ROL_CHIP[u.rol]}`}>
                {ROL_NOMBRE[u.rol] || u.rol}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal ficha: crear / editar empleada */}
      {ficha && (
        <FichaEmpleadaModal
          initial={ficha}
          busy={busyId !== null}
          onClose={() => setFicha(null)}
          onSave={guardarFicha}
        />
      )}
    </div>
  );
}

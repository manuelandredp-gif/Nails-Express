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
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  Pencil,
  X,
  Save,
  Phone,
  MapPin,
  IdCard,
  Mail,
} from "lucide-react";

interface Cuenta {
  userId: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface Empleada {
  staffId: string;
  nombre: string;
  foto: string;
  color: string;
  activo: boolean;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  cuenta: Cuenta | null;
}

interface Manager {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface Props {
  empleadas: Empleada[];
  managers: Manager[];
  miUserId: string;
}

const ROLES = [
  {
    id: "MANICURISTA",
    label: "Manicurista",
    desc: "Solo ve y atiende sus propias citas. Sin caja ni edición.",
  },
  {
    id: "RECEPCION",
    label: "Recepción",
    desc: "Ve y atiende todas las citas. Sin caja ni edición.",
  },
  {
    id: "ADMIN",
    label: "Administradora",
    desc: "Acceso total: caja, clientas, configuración y equipo.",
  },
];

const ROL_CHIP: Record<string, string> = {
  OWNER: "bg-primary/15 text-primary",
  ADMIN: "bg-purple-100 text-purple-700",
  RECEPCION: "bg-blue-100 text-blue-700",
  MANICURISTA: "bg-pink-100 text-pink-700",
};

const ROL_NOMBRE: Record<string, string> = {
  OWNER: "Dueña",
  ADMIN: "Administradora",
  RECEPCION: "Recepción",
  MANICURISTA: "Manicurista",
};

interface FichaDraft {
  staffId?: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  color: string;
}

const FICHA_VACIA: FichaDraft = {
  nombre: "",
  dni: "",
  telefono: "",
  email: "",
  direccion: "",
  color: "#E26D9A",
};

export default function TeamAccessManager({ empleadas, managers, miUserId }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Empleada[]>(empleadas);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal de ficha (crear / editar empleada)
  const [ficha, setFicha] = useState<FichaDraft | null>(null);
  // Formulario inline de acceso
  const [accesoFor, setAccesoFor] = useState<string | null>(null);
  const [accEmail, setAccEmail] = useState("");
  const [accPassword, setAccPassword] = useState("");
  const [accRol, setAccRol] = useState("MANICURISTA");
  const [showPwd, setShowPwd] = useState(false);

  const updateRow = (staffId: string, patch: Partial<Empleada>) =>
    setRows((prev) =>
      prev.map((r) => (r.staffId === staffId ? { ...r, ...patch } : r))
    );

  /* ---------- CRUD de la ficha (Staff) ---------- */

  const guardarFicha = async () => {
    if (!ficha) return;
    if (!ficha.nombre.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    const esEdicion = Boolean(ficha.staffId);
    setBusyId(ficha.staffId || "nueva");
    try {
      const res = await fetch(
        esEdicion ? `/api/admin/staff/${ficha.staffId}` : "/api/admin/staff",
        {
          method: esEdicion ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: ficha.nombre,
            dni: ficha.dni,
            telefono: ficha.telefono,
            email: ficha.email,
            direccion: ficha.direccion,
            color: ficha.color,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      if (esEdicion) {
        updateRow(ficha.staffId!, {
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

  const abrirAcceso = (m: Empleada) => {
    setAccesoFor(m.staffId);
    setAccEmail(m.email || "");
    setAccPassword("");
    setAccRol("MANICURISTA");
    setShowPwd(false);
  };

  const crearAcceso = async (m: Empleada) => {
    if (!accEmail.trim() || !accPassword) {
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
          email: accEmail,
          password: accPassword,
          staffId: m.staffId,
          rol: accRol,
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

  const inputCls =
    "mt-1 w-full rounded-lg border border-[#E6D3DA] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F3A6BC]";

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
                        onClick={() => abrirAcceso(m)}
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
                  <div className="mt-3 p-4 rounded-xl bg-[#FDF2F6] border border-[#F0D9E0] space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">
                          Correo (para iniciar sesión)
                        </span>
                        <input
                          type="email"
                          value={accEmail}
                          onChange={(e) => setAccEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          className={inputCls}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">
                          Contraseña
                        </span>
                        <div className="mt-1 relative">
                          <input
                            type={showPwd ? "text" : "password"}
                            value={accPassword}
                            onChange={(e) => setAccPassword(e.target.value)}
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
                      <span className="text-[0.7rem] font-semibold text-[#6B6B6B]">
                        Rol en el panel
                      </span>
                      <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                        {ROLES.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setAccRol(r.id)}
                            className={`text-left p-2.5 rounded-xl border text-xs transition-colors ${
                              accRol === r.id
                                ? "border-[#E26D9A] bg-white ring-2 ring-[#F3A6BC]/50"
                                : "border-[#E6D3DA] bg-white/60 hover:bg-white"
                            }`}
                          >
                            <span className="font-bold text-[#1A1A1A] block">
                              {r.label}
                            </span>
                            <span className="text-[0.65rem] text-[#9B8890] leading-tight block mt-0.5">
                              {r.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setAccesoFor(null)}
                        className="text-xs py-2 px-3 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => crearAcceso(m)}
                        disabled={busyId === m.staffId}
                        className="btn-primary text-xs py-2 px-4 disabled:opacity-60"
                      >
                        {busyId === m.staffId ? "Creando..." : "Crear acceso"}
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-[#1A1A1A]">
                {ficha.staffId ? "Editar empleada" : "Nueva empleada"}
              </h2>
              <button onClick={() => setFicha(null)} className="text-gray-400 hover:text-gray-600">
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
                  <span className="text-xs font-semibold text-[#6B6B6B]">
                    Color en la agenda
                  </span>
                  <input
                    type="color"
                    value={ficha.color}
                    onChange={(e) => setFicha({ ...ficha, color: e.target.value })}
                    className="mt-1 h-10 w-full rounded-lg border border-[#E6D3DA] cursor-pointer"
                  />
                </label>
              </div>
              <p className="text-[0.7rem] text-[#9B8890]">
                * La empleada aparece en la agenda al guardarla. Luego dale su
                acceso al panel con el botón «Dar acceso» y asígnale un rol.
              </p>
            </div>

            <div className="px-5 py-4 border-t border-[#ECECEC] flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setFicha(null)}
                className="text-sm py-2 px-4 rounded-lg border border-[#E6D3DA] text-[#6B6B6B] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarFicha}
                disabled={busyId !== null}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {busyId ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

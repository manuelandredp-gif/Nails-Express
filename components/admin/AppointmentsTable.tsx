"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  CheckCircle,
  MessageCircle,
  DollarSign,
  Star,
  X,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface AppointmentItem {
  id: string;
  codigo: string;
  startAt: string;
  endAt: string;
  precio: number;
  estado: string;
  origen: string;
  notasCliente?: string | null;
  pagado?: boolean;
  metodoPago?: string | null;
  resenaEstrellas?: number | null;
  resenaTexto?: string | null;
  customer: {
    nombre: string;
    celular: string;
  };
  service: {
    nombre: string;
  };
  staff: {
    nombre: string;
    color: string;
  };
}

interface AppointmentsTableProps {
  initialAppointments: AppointmentItem[];
}

/** Arma el enlace de WhatsApp con un recordatorio prellenado para la clienta. */
function buildReminderLink(app: AppointmentItem): string {
  const digits = app.customer.celular.replace(/[^\d]/g, "");
  const fecha = format(new Date(app.startAt), "EEEE d 'de' MMMM", { locale: es });
  const hora = format(new Date(app.startAt), "HH:mm");
  const nombre = app.customer.nombre.split(" ")[0];
  const msg =
    `Hola ${nombre}! 💅 Te recordamos tu cita en Nails Express ` +
    `el ${fecha} a las ${hora} para ${app.service.nombre}. ` +
    `¡Te esperamos! Si necesitas reprogramar, avísanos por aquí.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

/** Enlace de WhatsApp para pedirle una reseña a la clienta tras atenderla. */
function buildReviewRequestLink(app: AppointmentItem): string {
  const digits = app.customer.celular.replace(/[^\d]/g, "");
  const nombre = app.customer.nombre.split(" ")[0];
  const msg =
    `Hola ${nombre}! 💕 Gracias por visitarnos en Nails Express. ` +
    `¿Cómo quedaron tus uñas? Nos encantaría conocer tu opinión: ` +
    `tu recomendación nos ayuda muchísimo. ¡Y recuerda que cada visita suma un sello para tu premio! 💅✨`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

const METODOS_PAGO = [
  { id: "EFECTIVO", label: "Efectivo", emoji: "💵" },
  { id: "YAPE", label: "Yape", emoji: "📱" },
  { id: "PLIN", label: "Plin", emoji: "📲" },
  { id: "TARJETA", label: "Tarjeta", emoji: "💳" },
];

export default function AppointmentsTable({
  initialAppointments,
}: AppointmentsTableProps) {
  const [appointments, setAppointments] =
    useState<AppointmentItem[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [showHistorial, setShowHistorial] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reviewFor, setReviewFor] = useState<AppointmentItem | null>(null);
  const [payFor, setPayFor] = useState<AppointmentItem | null>(null);
  // Cita que debe completarse automáticamente después de registrar su cobro.
  const [completeAfterPay, setCompleteAfterPay] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((app) => {
    const q = search.toLowerCase();
    const matchSearch =
      app.codigo.toLowerCase().includes(q) ||
      app.customer.nombre.toLowerCase().includes(q) ||
      app.customer.celular.includes(q) ||
      app.service.nombre.toLowerCase().includes(q);

    // Por defecto se ocultan las completadas (quedan en el historial).
    const matchStatus =
      statusFilter === "all"
        ? showHistorial || app.estado !== "COMPLETADA"
        : app.estado === statusFilter;
    const matchOrigin =
      originFilter === "all" ? true : app.origen === originFilter;

    return matchSearch && matchStatus && matchOrigin;
  });

  // Actualiza una cita (estado / pagado / reseña) vía API y refleja el cambio.
  const updateAppointment = async (id: string, data: any, okMsg: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(result.error || "No se pudo actualizar la cita.");
        return false;
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      );
      if (result.loyalty?.reward) {
        toast.success("¡Cita completada! La clienta ganó un premio 🎁");
      } else if (result.loyalty) {
        toast.success(`¡Completada! Sello sumado (${result.loyalty.sellos}/${result.loyalty.meta}) 💅`);
      } else {
        toast.success(okMsg);
      }
      return true;
    } catch {
      toast.error("Error de conexión.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  /**
   * Completa la cita (suma el sello) y abre enseguida la evaluación de la clienta.
   * Si aún no está cobrada, primero abre el modal de cobro y deja la cita en cola
   * para completarse apenas se registre el pago.
   */
  const handleComplete = async (app: AppointmentItem) => {
    if (!app.pagado) {
      toast.info("Primero registra el cobro 💰 Luego se completa sola.");
      setCompleteAfterPay(app.id);
      setPayFor(app);
      return;
    }
    const ok = await updateAppointment(app.id, { estado: "COMPLETADA" }, "Cita completada.");
    if (ok) {
      // Al terminar, sale la evaluación privada de la clienta.
      setReviewFor({ ...app, estado: "COMPLETADA" });
    }
  };

  /** Tras un cobro exitoso: si la cita estaba en cola, la completa y abre la evaluación. */
  const afterPaySuccess = async (app: AppointmentItem) => {
    setPayFor(null);
    if (completeAfterPay === app.id) {
      setCompleteAfterPay(null);
      const ok = await updateAppointment(app.id, { estado: "COMPLETADA" }, "Cita completada.");
      if (ok) setReviewFor({ ...app, pagado: true, estado: "COMPLETADA" });
    }
  };

  const exportCsv = () => {
    const headers = [
      "Codigo",
      "Cliente",
      "Celular",
      "Servicio",
      "Manicurista",
      "Fecha",
      "Hora",
      "Precio",
      "Estado",
      "Origen",
    ];
    const rows = filteredAppointments.map((a) => [
      a.codigo,
      `"${a.customer.nombre}"`,
      a.customer.celular,
      `"${a.service.nombre}"`,
      `"${a.staff.nombre}"`,
      format(new Date(a.startAt), "yyyy-MM-dd"),
      format(new Date(a.startAt), "HH:mm"),
      a.precio,
      a.estado,
      a.origen,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `citas_nails_express_${format(new Date(), "yyyyMMdd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV descargado.");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-[16px] border border-[#ECECEC] flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, código o celular..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary bg-white font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="NO_ASISTIO">No asistió</option>
          </select>

          {/* Origin Filter */}
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary bg-white font-medium"
          >
            <option value="all">Todos los orígenes</option>
            <option value="WEB">Web pública</option>
            <option value="ADMIN">Panel Admin</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="TELEFONO">Teléfono</option>
          </select>

          {/* Toggle historial (completadas) */}
          <button
            onClick={() => setShowHistorial((v) => !v)}
            className={`text-xs py-2 px-3 inline-flex items-center gap-1.5 rounded-lg border transition-colors ${
              showHistorial
                ? "bg-primary text-white border-primary"
                : "border-gray-200 text-gray-600 hover:border-primary"
            }`}
            title="Mostrar u ocultar las citas completadas"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{showHistorial ? "Ocultar completadas" : "Ver historial"}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={exportCsv}
            className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[16px] border border-[#ECECEC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[#8E8E8E] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Manicurista</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {app.codigo}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#1A1A1A]">
                      {app.customer.nombre}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">
                      {app.customer.celular}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                    {app.service.nombre}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#1A1A1A] capitalize">
                      {format(new Date(app.startAt), "d 'de' MMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">
                      {format(new Date(app.startAt), "HH:mm")} -{" "}
                      {format(new Date(app.endAt), "HH:mm")}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold"
                      style={{
                        backgroundColor: `${app.staff.color}20`,
                        color: app.staff.color,
                      }}
                    >
                      {app.staff.nombre}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#E8707A]">
                    S/ {app.precio.toFixed(0)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                          app.estado === "CONFIRMADA"
                            ? "bg-green-100 text-green-700"
                            : app.estado === "COMPLETADA"
                            ? "bg-blue-100 text-blue-700"
                            : app.estado === "CANCELADA"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {app.estado}
                      </span>
                      {app.pagado && (
                        <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-emerald-100 text-emerald-700 inline-flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" /> Pagado
                          {app.metodoPago && (
                            <span className="font-medium opacity-80">
                              · {METODOS_PAGO.find((m) => m.id === app.metodoPago)?.label || app.metodoPago}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Completar (solo si está activa) */}
                      {(app.estado === "CONFIRMADA" || app.estado === "PENDIENTE") && (
                        <button
                          onClick={() => handleComplete(app)}
                          disabled={busyId === app.id}
                          className="px-2 py-1 rounded-lg text-[0.65rem] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center gap-1 disabled:opacity-50"
                          title="Completar: pide el cobro si falta, suma el sello y abre la evaluación"
                        >
                          <Check className="w-3 h-3" /> Completar
                        </button>
                      )}
                      {/* Pagado: al cobrar pregunta el método; si ya está pagado permite anular */}
                      <button
                        onClick={() => {
                          if (app.pagado) {
                            if (window.confirm("¿Anular el cobro de esta cita?")) {
                              updateAppointment(
                                app.id,
                                { pagado: false, metodoPago: null },
                                "Cobro anulado."
                              );
                            }
                          } else {
                            setPayFor(app);
                          }
                        }}
                        disabled={busyId === app.id}
                        className={`px-2 py-1 rounded-lg text-[0.65rem] font-bold inline-flex items-center gap-1 disabled:opacity-50 ${
                          app.pagado
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                        title="Registrar cobro"
                      >
                        <DollarSign className="w-3 h-3" /> {app.pagado ? "Pagado" : "Cobrar"}
                      </button>
                      {/* Reseña privada */}
                      <button
                        onClick={() => setReviewFor(app)}
                        className="px-2 py-1 rounded-lg text-[0.65rem] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center gap-1"
                        title="Nota / reseña privada del cliente"
                      >
                        <Star className={`w-3 h-3 ${app.resenaEstrellas ? "fill-amber-500 text-amber-500" : ""}`} />
                        {app.resenaEstrellas ? app.resenaEstrellas : "Reseña"}
                      </button>
                      {/* WhatsApp: recordatorio si está pendiente, pedir reseña si ya se atendió */}
                      {app.estado === "COMPLETADA" ? (
                        <a
                          href={buildReviewRequestLink(app)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg text-[0.65rem] font-bold bg-green-50 text-green-700 hover:bg-green-100 inline-flex items-center gap-1"
                          title="Pedirle su opinión por WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" /> Pedir reseña
                        </a>
                      ) : (
                        <a
                          href={buildReminderLink(app)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg text-[0.65rem] font-bold bg-green-50 text-green-700 hover:bg-green-100 inline-flex items-center gap-1"
                          title="Enviar recordatorio por WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" /> Recordar
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-xs">
            No se encontraron citas con los filtros seleccionados.
          </div>
        )}
      </div>

      {payFor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Registrar cobro</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {payFor.customer.nombre} · S/ {payFor.precio.toFixed(0)}
                </p>
              </div>
              <button
                onClick={() => {
                  setPayFor(null);
                  setCompleteAfterPay(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 font-medium">¿Cómo pagó la clienta?</p>
            {completeAfterPay === payFor.id && (
              <p className="text-[0.7rem] text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                Al registrar el cobro, la cita se marcará como completada (suma el
                sello) y podrás evaluar a la clienta.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  disabled={busyId === payFor.id}
                  onClick={async () => {
                    const ok = await updateAppointment(
                      payFor.id,
                      { pagado: true, metodoPago: m.id },
                      `Cobro registrado (${m.label}).`
                    );
                    if (ok) await afterPaySuccess(payFor);
                  }}
                  className="py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
            <button
              disabled={busyId === payFor.id}
              onClick={async () => {
                const ok = await updateAppointment(
                  payFor.id,
                  { pagado: true },
                  "Marcada como pagada."
                );
                if (ok) await afterPaySuccess(payFor);
              }}
              className="w-full text-[0.7rem] text-gray-400 hover:text-gray-600 underline disabled:opacity-50"
            >
              Solo marcar como pagada (sin método)
            </button>
          </div>
        </div>
      )}

      {reviewFor && (
        <ReviewModal
          appointment={reviewFor}
          busy={busyId === reviewFor.id}
          onClose={() => setReviewFor(null)}
          onSave={async (estrellas, texto) => {
            const ok = await updateAppointment(
              reviewFor.id,
              { resenaEstrellas: estrellas, resenaTexto: texto },
              "Reseña guardada."
            );
            if (ok) setReviewFor(null);
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({
  appointment,
  busy,
  onClose,
  onSave,
}: {
  appointment: AppointmentItem;
  busy: boolean;
  onClose: () => void;
  onSave: (estrellas: number | null, texto: string) => void;
}) {
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

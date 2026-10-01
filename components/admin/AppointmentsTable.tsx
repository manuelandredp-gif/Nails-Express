"use client";

import React, { useState } from "react";
import { Search, Download, CheckCircle, MessageCircle, DollarSign, Star, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { AppointmentItem } from "./citas/types";
import { METODOS_PAGO, buildReminderLink, buildReviewRequestLink } from "./citas/helpers";
import PayModal from "./citas/PayModal";
import ReviewModal from "./citas/ReviewModal";

interface AppointmentsTableProps {
  initialAppointments: AppointmentItem[];
}

export default function AppointmentsTable({ initialAppointments }: AppointmentsTableProps) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
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
    const matchOrigin = originFilter === "all" ? true : app.origen === originFilter;

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
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
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
   * Si aún no está cobrada, primero abre el modal de cobro y deja la cita en cola.
   */
  const handleComplete = async (app: AppointmentItem) => {
    if (!app.pagado) {
      toast.info("Primero registra el cobro 💰 Luego se completa sola.");
      setCompleteAfterPay(app.id);
      setPayFor(app);
      return;
    }
    const ok = await updateAppointment(app.id, { estado: "COMPLETADA" }, "Cita completada.");
    if (ok) setReviewFor({ ...app, estado: "COMPLETADA" });
  };

  // Registra el cobro desde el modal; si la cita estaba en cola, la completa y evalúa.
  const handlePay = async (app: AppointmentItem, metodoPago: string | null) => {
    const data = metodoPago ? { pagado: true, metodoPago } : { pagado: true };
    const ok = await updateAppointment(
      app.id,
      data,
      metodoPago ? `Cobro registrado (${METODOS_PAGO.find((m) => m.id === metodoPago)?.label}).` : "Marcada como pagada."
    );
    if (!ok) return;
    setPayFor(null);
    if (completeAfterPay === app.id) {
      setCompleteAfterPay(null);
      const done = await updateAppointment(app.id, { estado: "COMPLETADA" }, "Cita completada.");
      if (done) setReviewFor({ ...app, pagado: true, estado: "COMPLETADA" });
    }
  };

  const exportCsv = () => {
    const headers = ["Codigo", "Cliente", "Celular", "Servicio", "Manicurista", "Fecha", "Hora", "Precio", "Estado", "Origen"];
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
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `citas_nails_express_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV descargado.");
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda y filtros */}
      <div className="bg-white p-4 rounded-[16px] border border-[#ECECEC] flex flex-wrap items-center justify-between gap-4">
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

        <div className="flex flex-wrap items-center gap-2">
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

          <button
            onClick={() => setShowHistorial((v) => !v)}
            className={`text-xs py-2 px-3 inline-flex items-center gap-1.5 rounded-lg border transition-colors ${
              showHistorial ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600 hover:border-primary"
            }`}
            title="Mostrar u ocultar las citas completadas"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{showHistorial ? "Ocultar completadas" : "Ver historial"}</span>
          </button>

          <button onClick={exportCsv} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
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
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{app.codigo}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#1A1A1A]">{app.customer.nombre}</p>
                    <p className="text-[0.7rem] text-gray-500">{app.customer.celular}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">{app.service.nombre}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#1A1A1A] capitalize">
                      {format(new Date(app.startAt), "d 'de' MMM, yyyy", { locale: es })}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">
                      {format(new Date(app.startAt), "HH:mm")} - {format(new Date(app.endAt), "HH:mm")}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold"
                      style={{ backgroundColor: `${app.staff.color}20`, color: app.staff.color }}
                    >
                      {app.staff.nombre}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#E8707A]">S/ {app.precio.toFixed(0)}</td>
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
                      <button
                        onClick={() => {
                          if (app.pagado) {
                            if (window.confirm("¿Anular el cobro de esta cita?")) {
                              updateAppointment(app.id, { pagado: false, metodoPago: null }, "Cobro anulado.");
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
                      <button
                        onClick={() => setReviewFor(app)}
                        className="px-2 py-1 rounded-lg text-[0.65rem] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center gap-1"
                        title="Nota / reseña privada del cliente"
                      >
                        <Star className={`w-3 h-3 ${app.resenaEstrellas ? "fill-amber-500 text-amber-500" : ""}`} />
                        {app.resenaEstrellas ? app.resenaEstrellas : "Reseña"}
                      </button>
                      <a
                        href={app.estado === "COMPLETADA" ? buildReviewRequestLink(app) : buildReminderLink(app)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg text-[0.65rem] font-bold bg-green-50 text-green-700 hover:bg-green-100 inline-flex items-center gap-1"
                        title={app.estado === "COMPLETADA" ? "Pedirle su opinión por WhatsApp" : "Enviar recordatorio por WhatsApp"}
                      >
                        <MessageCircle className="w-3 h-3" /> {app.estado === "COMPLETADA" ? "Pedir reseña" : "Recordar"}
                      </a>
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
        <PayModal
          appointment={payFor}
          busy={busyId === payFor.id}
          completeAfterPay={completeAfterPay === payFor.id}
          onClose={() => {
            setPayFor(null);
            setCompleteAfterPay(null);
          }}
          onPay={(metodoPago) => handlePay(payFor, metodoPago)}
        />
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

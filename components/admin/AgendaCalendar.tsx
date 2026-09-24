"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Loader2,
  X,
  History,
  FileText,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface StaffItem {
  id: string;
  nombre: string;
  color: string;
}

interface ServiceItem {
  id: string;
  nombre: string;
  precio: number;
}

interface AgendaCalendarProps {
  staffList: StaffItem[];
  servicesList: ServiceItem[];
  currentRole: string;
}

export default function AgendaCalendar({
  staffList,
  servicesList,
  currentRole,
}: AgendaCalendarProps) {
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState("all");

  // Selected Appointment for Drawer
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  // New Appointment Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    nombre: "",
    celular: "",
    serviceId: servicesList[0]?.id || "",
    staffId: staffList[0]?.id || "",
    startAt: "",
    notasCliente: "",
  });

  // Time Block Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    staffId: "",
    startAt: "",
    endAt: "",
    motivo: "Almuerzo",
  });

  // Fetch appointments and timeblocks
  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/appointments${
          selectedStaff !== "all" ? `?staffId=${selectedStaff}` : ""
        }`
      );
      const data = await res.json();

      const timeBlockRes = await fetch("/api/admin/timeblocks");
      const blockData = await timeBlockRes.json();

      const appEvents = (data.appointments || []).map((app: any) => ({
        id: app.id,
        title: `${app.customer.nombre} • ${app.service.nombre}`,
        start: app.startAt,
        end: app.endAt,
        backgroundColor:
          app.estado === "COMPLETADA"
            ? "#10B981"
            : app.estado === "CANCELADA"
            ? "#EF4444"
            : app.estado === "NO_ASISTIO"
            ? "#9CA3AF"
            : app.staff.color || "#5CC6BF",
        borderColor: "transparent",
        textColor: "#FFFFFF",
        extendedProps: {
          ...app,
          type: "appointment",
        },
      }));

      const blockEvents = (blockData.timeBlocks || []).map((b: any) => ({
        id: `block-${b.id}`,
        title: `🔒 BLOQUEO: ${b.motivo}`,
        start: b.startAt,
        end: b.endAt,
        backgroundColor: "#6B7280",
        borderColor: "#4B5563",
        textColor: "#FFFFFF",
        extendedProps: {
          ...b,
          type: "timeblock",
        },
      }));

      setEvents([...appEvents, ...blockEvents]);
    } catch (err) {
      console.error("Error loading events:", err);
      toast.error("Error al sincronizar la agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [selectedStaff]);

  // Click on event opens Drawer
  const handleEventClick = (clickInfo: any) => {
    const props = clickInfo.event.extendedProps;
    if (props.type === "appointment") {
      setSelectedApp(props);
      setInternalNotes(props.notasInternas || "");
      setDrawerOpen(true);
    } else {
      toast.info(`Periodo bloqueado: ${props.motivo}`);
    }
  };

  // Drag & drop event to reschedule
  const handleEventDrop = async (dropInfo: any) => {
    const { event } = dropInfo;
    const props = event.extendedProps;

    if (props.type !== "appointment") {
      dropInfo.revert();
      return;
    }

    try {
      const res = await fetch(`/api/admin/appointments/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: event.start.toISOString(),
          endAt: event.end?.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "No se puede mover la cita a ese horario.");
        dropInfo.revert();
      } else {
        toast.success("Cita movida y horario actualizado sin conflictos.");
        loadCalendarData();
      }
    } catch (err) {
      toast.error("Error al actualizar la cita.");
      dropInfo.revert();
    }
  };

  // Update appointment status
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedApp) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/appointments/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al actualizar estado.");
      } else {
        toast.success(`Cita marcada como ${newStatus}`);
        setSelectedApp(data.appointment);
        loadCalendarData();
      }
    } catch (err) {
      toast.error("Error al cambiar estado.");
    } finally {
      setSavingStatus(false);
    }
  };

  // Save internal notes
  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      await fetch(`/api/admin/appointments/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notasInternas: internalNotes }),
      });
      toast.success("Notas guardadas.");
      loadCalendarData();
    } catch (err) {
      toast.error("Error al guardar notas.");
    }
  };

  // Create manual appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newForm,
          origen: "ADMIN",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Conflicto al agendar cita.");
      } else {
        toast.success("Cita agendada correctamente.");
        setNewModalOpen(false);
        loadCalendarData();
      }
    } catch (err) {
      toast.error("Error al agendar cita.");
    } finally {
      setCreating(false);
    }
  };

  // Create timeblock
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/timeblocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockForm),
      });

      if (!res.ok) {
        toast.error("Error al crear bloqueo.");
      } else {
        toast.success("Bloqueo de horario creado.");
        setBlockModalOpen(false);
        loadCalendarData();
      }
    } catch (err) {
      toast.error("Error al crear bloqueo.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[16px] border border-[#ECECEC]">
        {/* Staff Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-700">Manicurista:</span>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-primary bg-white"
          >
            <option value="all">Todas las manicuristas</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBlockModalOpen(true)}
            className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bloquear horario</span>
          </button>

          <button
            onClick={() => setNewModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="bg-white p-4 sm:p-6 rounded-[18px] border border-[#ECECEC] shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={esLocale}
          events={events}
          editable={currentRole !== "MANICURISTA"}
          selectable={true}
          slotMinTime="09:00:00"
          slotMaxTime="20:30:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          nowIndicator={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
        />
      </div>

      {/* Slide-over Drawer for Selected Appointment */}
      {drawerOpen && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#8E8E8E] font-mono">
                    {selectedApp.codigo}
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    Detalle de la Cita
                  </h3>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
                {/* Status Badge */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-[12px]">
                  <span className="text-xs font-semibold text-gray-500">
                    Estado actual:
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedApp.estado === "CONFIRMADA"
                        ? "bg-green-100 text-green-700"
                        : selectedApp.estado === "COMPLETADA"
                        ? "bg-blue-100 text-blue-700"
                        : selectedApp.estado === "CANCELADA"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedApp.estado}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Cliente
                  </h4>
                  <div className="bg-white border border-[#ECECEC] p-4 rounded-[12px] space-y-2">
                    <p className="font-bold text-base text-[#1A1A1A]">
                      {selectedApp.customer.nombre}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedApp.customer.celular}</span>
                    </p>
                    {selectedApp.customer.email && (
                      <p className="text-xs text-gray-500">
                        {selectedApp.customer.email}
                      </p>
                    )}
                    {/* Quick WhatsApp Action */}
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${selectedApp.customer.celular.replace(
                          /[^\d]/g,
                          ""
                        )}?text=${encodeURIComponent(
                          `¡Hola ${selectedApp.customer.nombre}! Te escribimos de Nails Express respecto a tu cita.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Abrir WhatsApp del cliente</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Service & Staff */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Servicio & Manicurista
                  </h4>
                  <div className="bg-white border border-[#ECECEC] p-4 rounded-[12px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        {selectedApp.service.nombre}
                      </span>
                      <span className="font-bold text-[#E8707A]">
                        S/ {selectedApp.precio}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Manicurista:{" "}
                      <strong className="text-gray-800">
                        {selectedApp.staff.nombre}
                      </strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      Horario: {format(new Date(selectedApp.startAt), "HH:mm")} -{" "}
                      {format(new Date(selectedApp.endAt), "HH:mm")} hrs (
                      {format(new Date(selectedApp.startAt), "d 'de' MMMM", {
                        locale: es,
                      })}
                      )
                    </p>
                  </div>
                </div>

                {/* Status Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Cambiar Estado
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange("COMPLETADA")}
                      disabled={savingStatus}
                      className="py-2 px-3 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                    >
                      ✔ Completada
                    </button>
                    <button
                      onClick={() => handleStatusChange("NO_ASISTIO")}
                      disabled={savingStatus}
                      className="py-2 px-3 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                    >
                      ⚠ No asistió
                    </button>
                    <button
                      onClick={() => handleStatusChange("CONFIRMADA")}
                      disabled={savingStatus}
                      className="py-2 px-3 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusChange("CANCELADA")}
                      disabled={savingStatus}
                      className="py-2 px-3 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Notas Internas
                  </h4>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Preferencias de diseño, alergias, o detalles..."
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary resize-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Guardar nota
                  </button>
                </div>

                {/* Audit Logs */}
                {selectedApp.logs && selectedApp.logs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Historial de cambios</span>
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedApp.logs.map((log: any) => (
                        <div
                          key={log.id}
                          className="text-[0.7rem] text-gray-500 bg-gray-50 p-2 rounded"
                        >
                          <span className="font-semibold text-gray-700">
                            {log.accion}:
                          </span>{" "}
                          {log.detalle}{" "}
                          <span className="text-gray-400 block text-[0.65rem] mt-0.5">
                            Por {log.realizadoPor} •{" "}
                            {format(new Date(log.fecha), "dd/MM HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full btn-outline text-xs py-2.5 justify-center"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agendar Nueva Cita Manual */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Agendar Cita Manual
              </h3>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre de la clienta *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.nombre}
                  onChange={(e) =>
                    setNewForm({ ...newForm, nombre: e.target.value })
                  }
                  placeholder="Ej. Sofía Vargas"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newForm.celular}
                    onChange={(e) =>
                      setNewForm({ ...newForm, celular: e.target.value })
                    }
                    placeholder="Ej. 952 111 222"
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={newForm.serviceId}
                    onChange={(e) =>
                      setNewForm({ ...newForm, serviceId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
                  >
                    {servicesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} (S/ {s.precio})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Manicurista *
                  </label>
                  <select
                    value={newForm.staffId}
                    onChange={(e) =>
                      setNewForm({ ...newForm, staffId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newForm.startAt}
                    onChange={(e) =>
                      setNewForm({ ...newForm, startAt: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notas de la cita
                </label>
                <textarea
                  rows={2}
                  value={newForm.notasCliente}
                  onChange={(e) =>
                    setNewForm({ ...newForm, notasCliente: e.target.value })
                  }
                  placeholder="Detalles sobre diseño o atención"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs py-2 px-6"
                >
                  {creating ? "Guardando..." : "Guardar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bloquear Horario */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Bloquear Horario
              </h3>
              <button
                onClick={() => setBlockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Afecta a:
                </label>
                <select
                  value={blockForm.staffId}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, staffId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
                >
                  <option value="">Todo el local (Cerrado)</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      Solo {st.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={blockForm.startAt}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, startAt: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Fin *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={blockForm.endAt}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, endAt: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={blockForm.motivo}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, motivo: e.target.value })
                  }
                  placeholder="Ej. Almuerzo, Feriado, Capacitación"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-6"
                >
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

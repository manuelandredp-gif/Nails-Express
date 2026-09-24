"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import AgendaStaffFilter from "./agenda/AgendaStaffFilter";
import AppointmentDetailDrawer from "./agenda/AppointmentDetailDrawer";
import ManualBookingModal from "./agenda/ManualBookingModal";
import TimeBlockModal from "./agenda/TimeBlockModal";

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
  const [blocking, setBlocking] = useState(false);
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
        body: JSON.stringify(newForm),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear la cita.");
      } else {
        toast.success("Cita agendada exitosamente.");
        setNewModalOpen(false);
        setNewForm({
          nombre: "",
          celular: "",
          serviceId: servicesList[0]?.id || "",
          staffId: staffList[0]?.id || "",
          startAt: "",
          notasCliente: "",
        });
        loadCalendarData();
      }
    } catch (err) {
      toast.error("Error al registrar cita.");
    } finally {
      setCreating(false);
    }
  };

  // Create time block
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlocking(true);
    try {
      const res = await fetch("/api/admin/timeblocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockForm),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al bloquear horario.");
      } else {
        toast.success("Horario bloqueado con éxito.");
        setBlockModalOpen(false);
        loadCalendarData();
      }
    } catch (err) {
      toast.error("Error al guardar bloqueo.");
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls with Staff Filter & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[16px] border border-[#ECECEC]">
        <AgendaStaffFilter
          staffList={staffList}
          selectedStaff={selectedStaff}
          onSelectStaff={setSelectedStaff}
        />

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

      {/* Slide-over Drawer */}
      <AppointmentDetailDrawer
        isOpen={drawerOpen}
        appointment={selectedApp}
        onClose={() => setDrawerOpen(false)}
        internalNotes={internalNotes}
        onChangeInternalNotes={setInternalNotes}
        onSaveNotes={handleSaveNotes}
        onStatusChange={handleStatusChange}
        savingStatus={savingStatus}
      />

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        creating={creating}
        onSubmit={handleCreateAppointment}
        form={newForm}
        onChangeForm={setNewForm}
        servicesList={servicesList}
        staffList={staffList}
      />

      {/* Time Block Modal */}
      <TimeBlockModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        staffList={staffList}
        form={blockForm}
        onChangeForm={setBlockForm}
        onSubmit={handleCreateBlock}
        submitting={blocking}
      />
    </div>
  );
}

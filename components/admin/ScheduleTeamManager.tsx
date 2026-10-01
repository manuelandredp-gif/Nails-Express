"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Clock, Plus, Users, Save, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import ImageField from "@/components/admin/ImageField";

interface BusinessHourItem {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  cerrado: boolean;
}

interface StaffItemType {
  id: string;
  nombre: string;
  foto: string;
  color: string;
  bio: string | null;
  activo: boolean;
}

const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function ScheduleTeamManager({
  initialHours,
  initialStaff,
}: {
  initialHours: BusinessHourItem[];
  initialStaff: StaffItemType[];
}) {
  const [hours, setHours] = useState<BusinessHourItem[]>(initialHours);
  const [staffList, setStaffList] = useState<StaffItemType[]>(initialStaff);
  const [savingHours, setSavingHours] = useState(false);

  // New Staff Modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    nombre: "",
    color: "#5CC6BF",
    foto: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400",
    bio: "",
  });

  const handleHourChange = (
    index: number,
    field: keyof BusinessHourItem,
    value: any
  ) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const res = await fetch("/api/admin/business-hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      if (res.ok) {
        toast.success("Horario semanal del salón actualizado.");
      } else {
        toast.error("Error al guardar horarios.");
      }
    } catch (err) {
      toast.error("Error al guardar.");
    } finally {
      setSavingHours(false);
    }
  };

  const handleToggleStaff = async (member: StaffItemType) => {
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !member.activo }),
      });
      if (res.ok) {
        setStaffList(
          staffList.map((s) =>
            s.id === member.id ? { ...s, activo: !s.activo } : s
          )
        );
        toast.success(
          `Manicurista ${!member.activo ? "activada" : "desactivada"}`
        );
      }
    } catch (err) {
      toast.error("Error al actualizar.");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaffForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Manicurista registrada.");
        setStaffList([...staffList, data.staff]);
        setStaffModalOpen(false);
      } else {
        toast.error("Error al registrar.");
      }
    } catch (err) {
      toast.error("Error al registrar.");
    }
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: Horario Semanal del Local */}
      <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              Horario Semanal de Atención
            </h2>
            <p className="text-xs text-[#6B6B6B]">
              Define los días de apertura, horario de atención y días cerrados
            </p>
          </div>
          <button
            onClick={handleSaveHours}
            disabled={savingHours}
            className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingHours ? "Guardando..." : "Guardar Horarios"}</span>
          </button>
        </div>

        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div
              key={h.id}
              className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
                h.cerrado
                  ? "bg-gray-50/70 border-gray-100 opacity-60"
                  : "bg-white border-[#ECECEC]"
              }`}
            >
              <div className="w-28 font-bold text-sm text-[#1A1A1A]">
                {dayNames[h.diaSemana]}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.cerrado}
                    onChange={(e) =>
                      handleHourChange(idx, "cerrado", e.target.checked)
                    }
                    className="rounded text-primary"
                  />
                  <span className="font-semibold text-gray-700">
                    Cerrado este día
                  </span>
                </label>

                {!h.cerrado && (
                  <div className="flex items-center gap-2">
                    <span>Apertura:</span>
                    <input
                      type="time"
                      value={h.horaApertura}
                      onChange={(e) =>
                        handleHourChange(idx, "horaApertura", e.target.value)
                      }
                      className="px-2 py-1 border rounded outline-none focus:border-primary font-mono text-xs"
                    />
                    <span>Cierre:</span>
                    <input
                      type="time"
                      value={h.horaCierre}
                      onChange={(e) =>
                        handleHourChange(idx, "horaCierre", e.target.value)
                      }
                      className="px-2 py-1 border rounded outline-none focus:border-primary font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Equipo de Manicuristas */}
      <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              Equipo de Manicuristas
            </h2>
            <p className="text-xs text-[#6B6B6B]">
              Profesionales que atienden citas y sus colores en la agenda
            </p>
          </div>
          <button
            onClick={() => setStaffModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Manicurista</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {staffList.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-[16px] border ${
                member.activo ? "border-[#ECECEC]" : "border-red-100 opacity-60"
              } bg-white flex items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border-2"
                  style={{ borderColor: member.color }}
                >
                  <Image
                    src={member.foto}
                    alt={member.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A]">
                    {member.nombre}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: member.color }}
                      title="Color en la agenda"
                    />
                    <span className="text-[0.65rem] text-gray-500">
                      Color asignado
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleStaff(member)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  member.activo
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {member.activo ? "Activa" : "Inactiva"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nueva Manicurista */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Registrar Manicurista
              </h3>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffForm.nombre}
                  onChange={(e) =>
                    setNewStaffForm({ ...newStaffForm, nombre: e.target.value })
                  }
                  placeholder="Ej. Ariana Flores"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Color para la Agenda *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newStaffForm.color}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, color: e.target.value })
                    }
                    className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                  />
                  <span className="font-mono text-xs text-gray-600">
                    {newStaffForm.color}
                  </span>
                </div>
              </div>

              <ImageField
                label="Foto de perfil"
                required
                value={newStaffForm.foto}
                onChange={(url) => setNewStaffForm({ ...newStaffForm, foto: url })}
              />

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-6"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

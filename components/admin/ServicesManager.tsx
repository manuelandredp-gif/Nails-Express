"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Scissors,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import ImageField from "@/components/admin/ImageField";

interface ServiceItem {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioDesde: boolean;
  duracionMinutos: number;
  bufferMinutos: number;
  descripcionCorta: string;
  descripcionLarga: string;
  imagenPrincipal: string;
  activo: boolean;
  destacado: boolean;
  categoryId: string;
  category: { id: string; nombre: string };
  staff: { staff: { id: string; nombre: string } }[];
}

interface ServicesManagerProps {
  initialServices: ServiceItem[];
  categories: { id: string; nombre: string }[];
  allStaff: { id: string; nombre: string }[];
}

export default function ServicesManager({
  initialServices,
  categories,
  allStaff,
}: ServicesManagerProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    slug: "",
    categoryId: categories[0]?.id || "",
    precio: 30,
    precioDesde: false,
    duracionMinutos: 45,
    bufferMinutos: 15,
    descripcionCorta: "",
    descripcionLarga: "",
    imagenPrincipal:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
    activo: true,
    destacado: false,
    staffIds: allStaff.map((s) => s.id),
  });

  const openNewModal = () => {
    setEditingService(null);
    setForm({
      nombre: "",
      slug: "",
      categoryId: categories[0]?.id || "",
      precio: 35,
      precioDesde: false,
      duracionMinutos: 45,
      bufferMinutos: 15,
      descripcionCorta: "",
      descripcionLarga: "",
      imagenPrincipal:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
      activo: true,
      destacado: false,
      staffIds: allStaff.map((s) => s.id),
    });
    setModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setForm({
      nombre: service.nombre,
      slug: service.slug,
      categoryId: service.categoryId,
      precio: service.precio,
      precioDesde: service.precioDesde,
      duracionMinutos: service.duracionMinutos,
      bufferMinutos: service.bufferMinutos,
      descripcionCorta: service.descripcionCorta,
      descripcionLarga: service.descripcionLarga,
      imagenPrincipal: service.imagenPrincipal,
      activo: service.activo,
      destacado: service.destacado,
      staffIds: service.staff.map((s) => s.staff.id),
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !service.activo }),
      });

      if (res.ok) {
        setServices(
          services.map((s) =>
            s.id === service.id ? { ...s, activo: !s.activo } : s
          )
        );
        toast.success(`Servicio ${!service.activo ? "activado" : "desactivado"}`);
      }
    } catch (err) {
      toast.error("Error al actualizar estado.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services";
      const method = editingService ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al guardar servicio.");
      } else {
        toast.success(
          editingService ? "Servicio actualizado." : "Servicio creado con éxito."
        );
        setModalOpen(false);
        // Refresh list
        const refresh = await fetch("/api/admin/services");
        const refreshData = await refresh.json();
        setServices(refreshData.services || []);
      }
    } catch (err) {
      toast.error("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Catálogo de Servicios
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Configuración de precios, duraciones, buffers de limpieza y staff
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`bg-white rounded-[16px] border ${
              srv.activo ? "border-[#ECECEC]" : "border-red-100 opacity-60"
            } p-4 flex flex-col justify-between hover:shadow-hover transition-all space-y-4`}
          >
            <div>
              <div className="relative aspect-[16/10] rounded-[12px] overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={srv.imagenPrincipal}
                  alt={srv.nombre}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2.5 left-2.5 text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-xs">
                  {srv.category?.nombre}
                </span>
                {srv.destacado && (
                  <span className="absolute top-2.5 right-2.5 text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-primary text-white shadow-xs">
                    Destacado
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-[#1A1A1A]">
                  {srv.nombre}
                </h3>
                <span className="font-bold text-sm text-[#3EA59E]">
                  {srv.precioDesde ? "Desde " : ""}S/ {srv.precio}
                </span>
              </div>

              <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-2 leading-relaxed">
                {srv.descripcionCorta}
              </p>

              {/* Duration and Buffer pill */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-50">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{srv.duracionMinutos} min</span>
                </span>
                <span>•</span>
                <span>Buffer: +{srv.bufferMinutos} min</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleActive(srv)}
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  srv.activo
                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    : "text-red-700 bg-red-50 hover:bg-red-100"
                }`}
              >
                {srv.activo ? "Activo" : "Inactivo"}
              </button>

              <button
                onClick={() => openEditModal(srv)}
                className="btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Servicio */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Manicure Ruso con Nivelación"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.precio}
                    onChange={(e) =>
                      setForm({ ...form, precio: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duración (Minutos) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.duracionMinutos}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duracionMinutos: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Buffer de limpieza (Min) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.bufferMinutos}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        bufferMinutos: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción corta *
                </label>
                <input
                  type="text"
                  required
                  value={form.descripcionCorta}
                  onChange={(e) =>
                    setForm({ ...form, descripcionCorta: e.target.value })
                  }
                  placeholder="Resumen atractivo para la tarjeta"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción detallada
                </label>
                <textarea
                  rows={2}
                  value={form.descripcionLarga}
                  onChange={(e) =>
                    setForm({ ...form, descripcionLarga: e.target.value })
                  }
                  placeholder="Detalle completo de pasos y beneficios"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary resize-none"
                />
              </div>

              <ImageField
                label="Imagen principal"
                required
                value={form.imagenPrincipal}
                onChange={(url) => setForm({ ...form, imagenPrincipal: url })}
              />

              {/* Staff checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Manicuristas que realizan este servicio:
                </label>
                <div className="flex flex-wrap gap-3">
                  {allStaff.map((st) => (
                    <label
                      key={st.id}
                      className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.staffIds.includes(st.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              staffIds: [...form.staffIds, st.id],
                            });
                          } else {
                            setForm({
                              ...form,
                              staffIds: form.staffIds.filter((id) => id !== st.id),
                            });
                          }
                        }}
                        className="rounded text-primary"
                      />
                      <span>{st.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.destacado}
                    onChange={(e) =>
                      setForm({ ...form, destacado: e.target.checked })
                    }
                    className="rounded text-primary"
                  />
                  <span>Mostrar como Destacado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.precioDesde}
                    onChange={(e) =>
                      setForm({ ...form, precioDesde: e.target.checked })
                    }
                    className="rounded text-primary"
                  />
                  <span>Precio "Desde"</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-6"
                >
                  {saving ? "Guardando..." : "Guardar Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

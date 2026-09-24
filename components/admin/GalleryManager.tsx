"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, EyeOff, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface GalleryItemType {
  id: string;
  imagen: string;
  categoria: string;
  altText: string;
  visible: boolean;
}

export default function GalleryManager({
  initialItems,
}: {
  initialItems: GalleryItemType[];
}) {
  const [items, setItems] = useState<GalleryItemType[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    imagen: "",
    categoria: "Manicure",
    altText: "",
  });

  const categories = ["Manicure", "Pedicure", "Diseños", "Temporada"];

  const handleToggleVisible = async (item: GalleryItemType) => {
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !item.visible }),
      });
      if (res.ok) {
        setItems(
          items.map((i) =>
            i.id === item.id ? { ...i, visible: !item.visible } : i
          )
        );
        toast.success(
          `Imagen ${!item.visible ? "visible en web" : "ocultada"}`
        );
      }
    } catch (err) {
      toast.error("Error al actualizar visibilidad.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast.success("Foto eliminada.");
      }
    } catch (err) {
      toast.error("Error al eliminar.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error al agregar foto.");
      } else {
        toast.success("Foto agregada a la galería.");
        setItems([...items, data.item]);
        setModalOpen(false);
        setForm({ imagen: "", categoria: "Manicure", altText: "" });
      }
    } catch (err) {
      toast.error("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Galería de Inspiración
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Administra las fotos de trabajos realizados y diseños destacados
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Foto</span>
        </button>
      </div>

      {/* Grid of photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group relative aspect-square rounded-[14px] overflow-hidden bg-gray-100 border ${
              item.visible ? "border-[#ECECEC]" : "border-red-200 opacity-60"
            }`}
          >
            <Image
              src={item.imagen}
              alt={item.altText}
              fill
              className="object-cover"
            />
            <span className="absolute top-2 left-2 text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-xs">
              {item.categoria}
            </span>

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => handleToggleVisible(item)}
                className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-gray-100 shadow-md"
                title={item.visible ? "Ocultar" : "Mostrar"}
              >
                {item.visible ? (
                  <Eye className="w-4 h-4 text-emerald-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-50 shadow-md"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Agregar Foto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Agregar Foto a la Galería
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
                  URL de la imagen *
                </label>
                <input
                  type="url"
                  required
                  value={form.imagen}
                  onChange={(e) =>
                    setForm({ ...form, imagen: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Texto descriptivo / Alt *
                </label>
                <input
                  type="text"
                  required
                  value={form.altText}
                  onChange={(e) =>
                    setForm({ ...form, altText: e.target.value })
                  }
                  placeholder="Ej. Uñas acrílicas en tono rosa blush"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
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
                  {saving ? "Guardando..." : "Subir Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

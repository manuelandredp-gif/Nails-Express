"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, EyeOff, X, Instagram } from "lucide-react";
import { toast } from "sonner";
import ImageField from "@/components/admin/ImageField";

const INSTAGRAM_CATEGORIA = "Instagram";

interface InstaItem {
  id: string;
  imagen: string;
  categoria: string;
  altText: string;
  visible: boolean;
}

/**
 * Administra SOLO las fotos de la franja "Síguenos en Instagram".
 * Reutiliza el API de galería (/api/admin/gallery) pero con la categoría
 * fija "Instagram", para que no se mezclen con la galería de trabajos.
 */
export default function InstagramManager({
  initialItems,
}: {
  initialItems: InstaItem[];
}) {
  const [items, setItems] = useState<InstaItem[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ imagen: "", altText: "" });

  const handleToggleVisible = async (item: InstaItem) => {
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !item.visible }),
      });
      if (res.ok) {
        setItems(items.map((i) => (i.id === item.id ? { ...i, visible: !item.visible } : i)));
        toast.success(`Post ${!item.visible ? "visible en la web" : "ocultado"}`);
      }
    } catch {
      toast.error("Error al actualizar visibilidad.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Quitar este post de la franja de Instagram?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast.success("Post eliminado.");
      }
    } catch {
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
        body: JSON.stringify({ ...form, categoria: INSTAGRAM_CATEGORIA }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error al agregar el post.");
      } else {
        toast.success("Post agregado a la franja de Instagram.");
        setItems([...items, data.item]);
        setModalOpen(false);
        setForm({ imagen: "", altText: "" });
      }
    } catch {
      toast.error("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] flex items-center gap-2">
            <Instagram className="w-6 h-6 text-primary" />
            Posts de Instagram
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Fotos de la franja &ldquo;Síguenos en Instagram&rdquo; de la portada. Son
            independientes de la galería de trabajos, así no se repiten.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Post</span>
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-[#ECECEC] bg-gray-50 p-10 text-center text-sm text-[#6B6B6B]">
          Aún no hay posts de Instagram. Agrega fotos de tus publicaciones para que
          aparezcan en la portada sin repetir las de la galería.
        </div>
      )}

      {/* Grid de posts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group relative aspect-square rounded-[14px] overflow-hidden bg-gray-100 border ${
              item.visible ? "border-[#ECECEC]" : "border-red-200 opacity-60"
            }`}
          >
            <Image src={item.imagen} alt={item.altText} fill className="object-cover" />
            <span className="absolute top-2 left-2 text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-xs inline-flex items-center gap-1">
              <Instagram className="w-3 h-3" />
              Instagram
            </span>

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

      {/* Modal Agregar Post */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Agregar Post de Instagram</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageField
                label="Imagen del post"
                required
                value={form.imagen}
                onChange={(url) => setForm({ ...form, imagen: url })}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Texto descriptivo / Alt *
                </label>
                <input
                  type="text"
                  required
                  value={form.altText}
                  onChange={(e) => setForm({ ...form, altText: e.target.value })}
                  placeholder="Ej. Diseño de uñas celeste perlado"
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
                <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-6">
                  {saving ? "Guardando..." : "Subir Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

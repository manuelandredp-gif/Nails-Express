"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Star,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  X,
  Save,
  MessageSquareQuote,
} from "lucide-react";

interface Testimonial {
  id: string;
  nombre: string;
  texto: string;
  avatar: string | null;
  estrellas: number;
  servicio: string | null;
  orden: number;
  visible: boolean;
}

type Draft = Omit<Testimonial, "id" | "orden"> & { id?: string };

const EMPTY: Draft = {
  nombre: "",
  texto: "",
  avatar: "",
  estrellas: 5,
  servicio: "",
  visible: true,
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          tabIndex={onChange ? 0 : -1}
        >
          <Star
            className={`w-4 h-4 ${
              n <= value ? "text-amber-400 fill-amber-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsManager({
  initial,
}: {
  initial: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initial);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const openNew = () => setEditing({ ...EMPTY });
  const openEdit = (t: Testimonial) =>
    setEditing({
      id: t.id,
      nombre: t.nombre,
      texto: t.texto,
      avatar: t.avatar || "",
      estrellas: t.estrellas,
      servicio: t.servicio || "",
      visible: t.visible,
    });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.nombre.trim() || !editing.texto.trim()) {
      toast.error("Completa el nombre y el testimonio.");
      return;
    }
    setBusy(true);
    try {
      const isEdit = Boolean(editing.id);
      const res = await fetch(
        isEdit ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (isEdit) {
        setItems((prev) =>
          prev.map((x) => (x.id === data.testimonial.id ? data.testimonial : x))
        );
      } else {
        setItems((prev) => [...prev, data.testimonial]);
      }
      setEditing(null);
      toast.success(isEdit ? "Testimonio actualizado." : "Testimonio agregado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleVisible = async (t: Testimonial) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !t.visible }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setItems((prev) => prev.map((x) => (x.id === t.id ? data.testimonial : x)));
      toast.success(t.visible ? "Oculto en la web." : "Visible en la web.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!window.confirm(`¿Eliminar el testimonio de ${t.nombre}?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setItems((prev) => prev.filter((x) => x.id !== t.id));
      toast.success("Testimonio eliminado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Testimonios
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Reseñas que se muestran en la página principal.
          </p>
        </div>
        <button
          onClick={openNew}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ECECEC] p-10 text-center">
          <MessageSquareQuote className="w-8 h-8 text-[#3EA59E] mx-auto mb-2" />
          <p className="text-sm text-[#8E8E8E]">
            Aún no hay testimonios. Agrega el primero.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl border bg-white shadow-sm p-4 ${
                t.visible ? "border-[#ECECEC]" : "border-dashed border-gray-300 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-[#1A1A1A] truncate">{t.nombre}</p>
                  {t.servicio && (
                    <p className="text-[0.7rem] text-[#8E8E8E]">{t.servicio}</p>
                  )}
                </div>
                <Stars value={t.estrellas} />
              </div>
              <p className="text-sm text-[#555] mt-2 line-clamp-4">"{t.texto}"</p>

              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F3F3F3]">
                <button
                  onClick={() => toggleVisible(t)}
                  disabled={busy}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                    t.visible
                      ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {t.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Oculto
                    </>
                  )}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E1F4F1] text-[#6B6B6B] hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  disabled={busy}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-[#1A1A1A]">
                {editing.id ? "Editar testimonio" : "Nuevo testimonio"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">Nombre</span>
                <input
                  value={editing.nombre}
                  onChange={(e) =>
                    setEditing({ ...editing, nombre: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">
                  Servicio (opcional)
                </span>
                <input
                  value={editing.servicio || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, servicio: e.target.value })
                  }
                  placeholder="Ej. Manicure en gel"
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">
                  Testimonio
                </span>
                <textarea
                  value={editing.texto}
                  onChange={(e) =>
                    setEditing({ ...editing, texto: e.target.value })
                  }
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]"
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B6B6B]">
                  Calificación
                </span>
                <Stars
                  value={editing.estrellas}
                  onChange={(n) => setEditing({ ...editing, estrellas: n })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.visible}
                  onChange={(e) =>
                    setEditing({ ...editing, visible: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#3EA59E]"
                />
                <span className="text-sm text-[#1A1A1A]">Mostrar en la web</span>
              </label>
            </div>

            <div className="px-5 py-4 border-t border-[#ECECEC] flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setEditing(null)}
                className="text-sm py-2 px-4 rounded-lg border border-[#E1F4F1] text-[#6B6B6B] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={busy}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {busy ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

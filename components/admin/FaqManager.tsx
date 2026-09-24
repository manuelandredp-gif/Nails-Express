"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, HelpCircle, X, Save } from "lucide-react";
import { toast } from "sonner";

interface FaqItemType {
  id: string;
  pregunta: string;
  respuesta: string;
  visible: boolean;
}

export default function FaqManager({
  initialFaqs,
}: {
  initialFaqs: FaqItemType[];
}) {
  const [faqs, setFaqs] = useState<FaqItemType[]>(initialFaqs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItemType | null>(null);
  const [form, setForm] = useState({ pregunta: "", respuesta: "" });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingFaq(null);
    setForm({ pregunta: "", respuesta: "" });
    setModalOpen(true);
  };

  const openEdit = (item: FaqItemType) => {
    setEditingFaq(item);
    setForm({ pregunta: item.pregunta, respuesta: item.respuesta });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta pregunta frecuente?")) return;
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFaqs(faqs.filter((f) => f.id !== id));
        toast.success("Pregunta eliminada.");
      }
    } catch (err) {
      toast.error("Error al eliminar.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingFaq
        ? `/api/admin/faq/${editingFaq.id}`
        : "/api/admin/faq";
      const method = editingFaq ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Error al guardar.");
      } else {
        toast.success(editingFaq ? "Pregunta actualizada." : "Pregunta creada.");
        setModalOpen(false);
        const refresh = await fetch("/api/admin/faq");
        const refreshData = await refresh.json();
        setFaqs(refreshData.faqs || []);
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
            Preguntas Frecuentes
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Gestiona las dudas habituales de tus clientas
          </p>
        </div>

        <button
          onClick={openNew}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Pregunta</span>
        </button>
      </div>

      {/* Accordion style list in admin */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white border border-[#ECECEC] p-5 rounded-[16px] flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-2xs"
          >
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-[#1A1A1A]">
                {faq.pregunta}
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                {faq.respuesta}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => openEdit(faq)}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {editingFaq ? "Editar Pregunta" : "Nueva Pregunta Frecuente"}
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
                  Pregunta *
                </label>
                <input
                  type="text"
                  required
                  value={form.pregunta}
                  onChange={(e) =>
                    setForm({ ...form, pregunta: e.target.value })
                  }
                  placeholder="¿Cuánto dura el manicure en gel?"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Respuesta detallada *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.respuesta}
                  onChange={(e) =>
                    setForm({ ...form, respuesta: e.target.value })
                  }
                  placeholder="Explica de forma clara y amable..."
                  className="w-full p-3 text-xs border rounded-lg outline-none focus:border-primary resize-none"
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
                  {saving ? "Guardando..." : "Guardar Pregunta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

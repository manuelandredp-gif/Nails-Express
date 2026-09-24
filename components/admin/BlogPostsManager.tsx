"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface BlogPostItem {
  id: string;
  slug: string;
  titulo: string;
  extracto: string;
  contenidoHtml: string;
  imagenPortada: string;
  categoria: string;
  estado: string;
  fechaPublicacion: string;
  autor: string;
}

interface BlogPostsManagerProps {
  initialPosts: BlogPostItem[];
}

export default function BlogPostsManager({
  initialPosts,
}: BlogPostsManagerProps) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    slug: "",
    extracto: "",
    contenidoHtml: "",
    imagenPortada:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
    categoria: "Tendencias",
    estado: "PUBLICADO",
  });

  const openNew = () => {
    setEditingPost(null);
    setForm({
      titulo: "",
      slug: "",
      extracto: "",
      contenidoHtml:
        "<p>Escribe aquí el contenido enriquecido de tu publicación...</p>",
      imagenPortada:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
      categoria: "Tendencias",
      estado: "PUBLICADO",
    });
    setEditorOpen(true);
  };

  const openEdit = (p: BlogPostItem) => {
    setEditingPost(p);
    setForm({
      titulo: p.titulo,
      slug: p.slug,
      extracto: p.extracto,
      contenidoHtml: p.contenidoHtml,
      imagenPortada: p.imagenPortada,
      categoria: p.categoria,
      estado: p.estado,
    });
    setEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo definitivamente?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        toast.success("Artículo eliminado.");
      }
    } catch (err) {
      toast.error("Error al eliminar.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingPost
        ? `/api/admin/posts/${editingPost.id}`
        : "/api/admin/posts";
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar post.");
      } else {
        toast.success(
          editingPost ? "Post actualizado." : "Post publicado exitosamente."
        );
        setEditorOpen(false);
        const refresh = await fetch("/api/admin/posts");
        const refreshData = await refresh.json();
        setPosts(refreshData.posts || []);
      }
    } catch (err) {
      toast.error("Error al guardar post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Blog & Tendencias
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Publica consejos, guías de cuidado y novedades para tus clientas
          </p>
        </div>

        <button
          onClick={openNew}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Publicación</span>
        </button>
      </div>

      {/* Grid of Posts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-[16px] border border-[#ECECEC] p-4 flex flex-col justify-between hover:shadow-hover transition-all space-y-4"
          >
            <div>
              <div className="relative aspect-[16/10] rounded-[12px] overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={post.imagenPortada}
                  alt={post.titulo}
                  fill
                  className="object-cover"
                />
                <span
                  className={`absolute top-2.5 left-2.5 text-[0.65rem] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                    post.estado === "PUBLICADO"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {post.estado}
                </span>
              </div>

              <span className="text-[0.7rem] text-[#8E8E8E] font-medium">
                {format(new Date(post.fechaPublicacion), "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </span>

              <h3 className="font-bold text-base text-[#1A1A1A] line-clamp-2 mt-1">
                {post.titulo}
              </h3>

              <p className="text-xs text-[#6B6B6B] line-clamp-2 mt-1.5">
                {post.extracto}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver en web</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(post)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100"
                  title="Editar"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {editingPost ? "Editar Publicación" : "Crear Publicación"}
              </h3>
              <button
                onClick={() => setEditorOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Título del post *
                </label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej. 5 tendencias de uñas para esta primavera"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    placeholder="Tendencias, Cuidados, Diseños"
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
                  >
                    <option value="PUBLICADO">Publicado</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="PROGRAMADO">Programado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Extracto / Resumen *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.extracto}
                  onChange={(e) =>
                    setForm({ ...form, extracto: e.target.value })
                  }
                  placeholder="Breve resumen que aparece en las tarjetas"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL de Imagen de Portada
                </label>
                <input
                  type="url"
                  required
                  value={form.imagenPortada}
                  onChange={(e) =>
                    setForm({ ...form, imagenPortada: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contenido HTML / Editor de Artículo *
                </label>
                <textarea
                  rows={7}
                  required
                  value={form.contenidoHtml}
                  onChange={(e) =>
                    setForm({ ...form, contenidoHtml: e.target.value })
                  }
                  placeholder="<p>Texto del artículo...</p><h2>Subtítulo</h2><p>Más contenido...</p>"
                  className="w-full p-3 text-xs border rounded-lg outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-6"
                >
                  {saving ? "Guardando..." : "Guardar Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

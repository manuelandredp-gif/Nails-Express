"use client";

import React, { useRef, useState } from "react";
import { Upload, Link2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  hint?: string;
}

/**
 * Campo de imagen reutilizable: permite pegar una URL o subir un archivo
 * al servidor (se guarda en /public/uploads y devuelve la ruta pública).
 */
export default function ImageField({
  label,
  value,
  onChange,
  required = false,
  hint,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo subir la imagen.");
      } else {
        onChange(data.url);
        toast.success("Imagen subida. No olvides apretar “Guardar” para aplicarla.");
      }
    } catch {
      toast.error("Error al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
        {required && " *"}
      </label>
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Link2 className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required={required}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... o /uploads/..."
              className="w-full pl-8 pr-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? "Subiendo..." : "Subir imagen"}</span>
            </button>
            {hint && <span className="text-[0.65rem] text-gray-400">{hint}</span>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}

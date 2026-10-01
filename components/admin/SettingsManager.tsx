"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import SettingsLivePreview from "@/components/admin/SettingsLivePreview";
import { SettingsData, TABS, FormCtx } from "./settings/fields";
import SettingsPanels from "./settings/SettingsPanels";

export type { SettingsData };

export default function SettingsManager({
  initialSettings,
}: {
  initialSettings: SettingsData;
}) {
  const [form, setForm] = useState<SettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("general");
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialSettings));
  const contentRef = React.useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(form) !== baseline;

  const selectTab = React.useCallback((id: string) => {
    setTab(id);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }, []);

  const set = React.useCallback(
    (key: string, value: any) => setForm((f) => ({ ...f, [key]: value })),
    []
  );
  const ctxValue = React.useMemo(() => ({ form, set }), [form, set]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setBaseline(JSON.stringify(form));
        toast.success("Configuración guardada. La web ya muestra los cambios.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Error al actualizar configuración.");
      }
    } catch {
      toast.error("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const current = TABS.find((t) => t.id === tab);

  return (
    <FormCtx.Provider value={ctxValue}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Barra superior fija: el botón Guardar siempre a la vista */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-[#FAF7F7]/95 backdrop-blur border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#1A1A1A] truncate">
              Configuración del Sitio
            </h1>
            {dirty ? (
              <p className="text-[0.7rem] sm:text-xs font-semibold text-amber-600 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Tenés cambios sin guardar. Apretá “Guardar Cambios”.
              </p>
            ) : (
              <p className="text-[0.7rem] sm:text-xs text-emerald-600 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Todo guardado y publicado en la web.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !dirty}
            className={`text-xs sm:text-sm py-2.5 px-5 sm:px-7 rounded-full inline-flex items-center gap-1.5 font-semibold shadow-sm shrink-0 transition-all ${
              dirty
                ? "bg-primary text-white hover:bg-primary-hover animate-pulse"
                : "bg-gray-100 text-gray-400 cursor-default"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : dirty ? "Guardar Cambios" : "Guardado"}</span>
          </button>
        </div>
        <p className="text-xs text-[#6B6B6B] -mt-3">
          Todos los textos, imágenes y datos de la web pública se editan aquí.
          Recordá: después de subir una foto o cambiar algo, apretá “Guardar Cambios”.
        </p>

        {/* Tabs como tarjetas grandes y claras */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className={`text-left rounded-2xl border p-3.5 transition-all ${
                  active
                    ? "bg-primary/5 border-primary ring-1 ring-primary shadow-sm"
                    : "bg-white border-gray-200 hover:border-primary/60 hover:shadow-2xs"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                    active ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`text-xs font-bold leading-tight ${active ? "text-primary" : "text-[#1A1A1A]"}`}>
                  {t.label}
                </div>
                <div className="text-[0.65rem] text-gray-400 mt-0.5 leading-tight">{t.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Editor (izquierda) + Vista previa en vivo (derecha) */}
        <div
          ref={contentRef}
          className="scroll-mt-24 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start"
        >
          <div className="space-y-6 min-w-0 order-2 xl:order-1">
            {current && (
              <div className="flex items-center gap-2.5 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <current.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#1A1A1A]">Editando: {current.label}</h2>
                  <p className="text-[0.7rem] text-gray-500">{current.desc}</p>
                </div>
              </div>
            )}

            <SettingsPanels tab={tab} form={form} set={set} />
          </div>

          {/* Columna derecha: vista previa en vivo */}
          <div className="order-1 xl:order-2 xl:sticky xl:top-28">
            <SettingsLivePreview form={form} tab={tab} />
          </div>
        </div>
      </form>
    </FormCtx.Provider>
  );
}

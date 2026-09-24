"use client";

import React, { useState } from "react";
import { Settings, Save, Shield, Clock, Phone, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SettingsData {
  nombreNegocio: string;
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: string;
  horarioVisible: string;
  moneda: string;
  anticipacionMinimaHoras: number;
  maximoDiasAdelante: number;
  intervaloSlotsMinutos: number;
  horasLimiteCancelacion: number;
  heroKicker: string;
  heroTitulo: string;
  heroSubtitulo: string;
  heroBoton: string;
  nosotrosTitulo: string;
  nosotrosTexto: string;
  nosotrosBoton: string;
  metricasClientes: string;
  metricasCalificacion: string;
  metricasAnos: string;
}

export default function SettingsManager({
  initialSettings,
}: {
  initialSettings: SettingsData;
}) {
  const [form, setForm] = useState<SettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);

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
        toast.success("Configuración actualizada correctamente.");
      } else {
        toast.error("Error al actualizar configuración.");
      }
    } catch (err) {
      toast.error("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Configuración del Salón
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Ajustes generales, reglas del motor de reserva y textos de la web
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>

      {/* BLOCK 1: Reglas Críticas de Reserva */}
      <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b pb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span>Reglas del Motor de Agendamiento</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Anticipación mínima para reservar (horas)
            </label>
            <input
              type="number"
              min="0"
              max="72"
              value={form.anticipacionMinimaHoras}
              onChange={(e) =>
                setForm({
                  ...form,
                  anticipacionMinimaHoras: parseInt(e.target.value, 10),
                })
              }
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
            <span className="text-[0.65rem] text-gray-400 mt-1 block">
              Las clientas no podrán reservar con menos de estas horas de margen.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Horas límite para cancelar / reprogramar
            </label>
            <input
              type="number"
              min="0"
              max="72"
              value={form.horasLimiteCancelacion}
              onChange={(e) =>
                setForm({
                  ...form,
                  horasLimiteCancelacion: parseInt(e.target.value, 10),
                })
              }
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
            <span className="text-[0.65rem] text-gray-400 mt-1 block">
              Tiempo previo a la cita dentro del cual el cliente puede cancelar desde la web.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Máximo de días hacia adelante
            </label>
            <input
              type="number"
              min="7"
              max="90"
              value={form.maximoDiasAdelante}
              onChange={(e) =>
                setForm({
                  ...form,
                  maximoDiasAdelante: parseInt(e.target.value, 10),
                })
              }
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Intervalo de slots de horario (minutos)
            </label>
            <select
              value={form.intervaloSlotsMinutos}
              onChange={(e) =>
                setForm({
                  ...form,
                  intervaloSlotsMinutos: parseInt(e.target.value, 10),
                })
              }
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary bg-white"
            >
              <option value="15">Cada 15 minutos</option>
              <option value="30">Cada 30 minutos (Recomendado)</option>
              <option value="45">Cada 45 minutos</option>
              <option value="60">Cada 60 minutos</option>
            </select>
          </div>
        </div>
      </div>

      {/* BLOCK 2: Datos de Contacto y Estudio */}
      <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b pb-3">
          <Phone className="w-4 h-4 text-primary" />
          <span>Datos de Contacto y Ubicación</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              WhatsApp del Negocio
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Teléfono visible
            </label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Correo de contacto
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Dirección física
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* BLOCK 3: Textos del Hero y Métricas */}
      <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b pb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Contenido del Hero y Métricas</span>
        </h2>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kicker del Hero
              </label>
              <input
                type="text"
                value={form.heroKicker}
                onChange={(e) => setForm({ ...form, heroKicker: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Texto del botón Hero
              </label>
              <input
                type="text"
                value={form.heroBoton}
                onChange={(e) => setForm({ ...form, heroBoton: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Título H1 Hero
            </label>
            <input
              type="text"
              value={form.heroTitulo}
              onChange={(e) => setForm({ ...form, heroTitulo: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subtítulo Hero
            </label>
            <textarea
              rows={2}
              value={form.heroSubtitulo}
              onChange={(e) =>
                setForm({ ...form, heroSubtitulo: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary resize-none"
            />
          </div>

          {/* 3 Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Métrica 1 (Clientes)
              </label>
              <input
                type="text"
                value={form.metricasClientes}
                onChange={(e) =>
                  setForm({ ...form, metricasClientes: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Métrica 2 (Calificación)
              </label>
              <input
                type="text"
                value={form.metricasCalificacion}
                onChange={(e) =>
                  setForm({ ...form, metricasCalificacion: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Métrica 3 (Años)
              </label>
              <input
                type="text"
                value={form.metricasAnos}
                onChange={(e) =>
                  setForm({ ...form, metricasAnos: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

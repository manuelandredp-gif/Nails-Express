"use client";

import React from "react";
import {
  Clock,
  Phone,
  Sparkles,
  Layout,
  Users,
  Images,
  MessageCircle,
  Search,
  Globe,
  PanelBottom,
  LayoutDashboard,
  Gift,
} from "lucide-react";

export type SettingsData = Record<string, any>;

export type Tab = {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
};

export const TABS: Tab[] = [
  { id: "general", label: "Marca y logo", desc: "Nombre, logo y moneda", icon: Globe },
  { id: "contacto", label: "Contacto y redes", desc: "Teléfono, correo, redes sociales", icon: Phone },
  { id: "inicio", label: "Portada de inicio", desc: "Título, foto y botones del inicio", icon: Layout },
  { id: "secciones", label: "Secciones de la web", desc: "Galería, blog, preguntas, contacto", icon: Images },
  { id: "extras", label: "Secciones nuevas", desc: "Beneficios, testimonios, colores, Instagram", icon: Sparkles },
  { id: "nosotros", label: "Sobre nosotros", desc: "Texto, foto y números", icon: Users },
  { id: "footer", label: "Menú y pie de página", desc: "Enlaces de arriba y de abajo", icon: PanelBottom },
  { id: "whatsapp", label: "WhatsApp y mapa", desc: "Botón flotante y ubicación", icon: MessageCircle },
  { id: "sellos", label: "Sellos (fidelidad)", desc: "Tarjeta de sellos y premio", icon: Gift },
  { id: "dashboard", label: "Panel de inicio", desc: "Textos de las tarjetas del admin", icon: LayoutDashboard },
  { id: "seo", label: "Google (SEO)", desc: "Título y descripción en buscadores", icon: Search },
  { id: "reservas", label: "Reservas", desc: "Reglas de agenda y horarios", icon: Clock },
];

export const inputCls =
  "w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary";

/* Los campos leen el estado por contexto para no remontarse en cada tecleo
   (y así no perder el foco del input). */
export const FormCtx = React.createContext<{
  form: SettingsData;
  set: (key: string, value: any) => void;
}>({ form: {}, set: () => {} });

export function Text({
  k,
  label,
  hint,
  type = "text",
}: {
  k: string;
  label: string;
  hint?: string;
  type?: string;
}) {
  const { form, set } = React.useContext(FormCtx);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        className={inputCls}
      />
      {hint && <span className="text-[0.65rem] text-gray-400 mt-1 block">{hint}</span>}
    </div>
  );
}

export function Area({
  k,
  label,
  rows = 3,
  hint,
}: {
  k: string;
  label: string;
  rows?: number;
  hint?: string;
}) {
  const { form, set } = React.useContext(FormCtx);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={form[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        className={`${inputCls} resize-y`}
      />
      {hint && <span className="text-[0.65rem] text-gray-400 mt-1 block">{hint}</span>}
    </div>
  );
}

export function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-4">
      <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b pb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );
}

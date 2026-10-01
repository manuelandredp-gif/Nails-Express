"use client";

import React, { useState } from "react";
import {
  Save,
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
import { toast } from "sonner";
import ImageField from "@/components/admin/ImageField";
import SettingsLivePreview from "@/components/admin/SettingsLivePreview";

export type SettingsData = Record<string, any>;

type Tab = {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
};

const TABS: Tab[] = [
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

const inputCls =
  "w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-primary";

/* Los campos se definen fuera del componente principal (y leen el estado
   por contexto) para que no se remonten en cada tecleo y pierdan el foco. */
const FormCtx = React.createContext<{
  form: SettingsData;
  set: (key: string, value: any) => void;
}>({ form: {}, set: () => {} });

function Text({
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

function Area({
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

function Card({
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
    // Lleva la vista al contenido de la sección para que se note el cambio.
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
              <div
                className={`text-xs font-bold leading-tight ${
                  active ? "text-primary" : "text-[#1A1A1A]"
                }`}
              >
                {t.label}
              </div>
              <div className="text-[0.65rem] text-gray-400 mt-0.5 leading-tight">
                {t.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor (izquierda) + Vista previa en vivo (derecha) */}
      <div
        ref={contentRef}
        className="scroll-mt-24 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start"
      >
        {/* Columna izquierda: formulario */}
        <div className="space-y-6 min-w-0 order-2 xl:order-1">
          {/* Título de la sección activa */}
          {(() => {
            const current = TABS.find((t) => t.id === tab);
            if (!current) return null;
            const Icon = current.icon;
            return (
              <div className="flex items-center gap-2.5 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#1A1A1A]">
                    Editando: {current.label}
                  </h2>
                  <p className="text-[0.7rem] text-gray-500">{current.desc}</p>
                </div>
              </div>
            );
          })()}

      {/* ---------- GENERAL ---------- */}
      {tab === "general" && (
        <Card title="Identidad del negocio" icon={Globe}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Text k="nombreNegocio" label="Nombre del negocio" />
            <Text k="moneda" label="Símbolo de moneda" hint="Ej. S/ , $ , €" />
            <Text k="logoTextoPrincipal" label="Logo: texto principal" hint="Se usa si no hay imagen de logo" />
            <Text k="logoTextoSecundario" label="Logo: texto secundario" />
          </div>
          <ImageField
            label="Logo (imagen, opcional)"
            value={form.logo ?? ""}
            onChange={(v) => set("logo", v)}
            hint="Si subes un logo reemplaza el texto en cabecera y footer."
          />
          <Text k="headerBoton" label="Texto del botón de la cabecera" />
        </Card>
      )}

      {/* ---------- CONTACTO ---------- */}
      {tab === "contacto" && (
        <>
          <Card title="Datos de contacto" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="whatsapp" label="WhatsApp del negocio" hint="Con código de país, ej. +51 952 123 456" />
              <Text k="telefono" label="Teléfono visible" />
              <Text k="email" label="Correo de contacto" type="email" />
              <Text k="direccion" label="Dirección física" />
              <Text k="horarioVisible" label="Horario visible" hint="Texto libre, ej. Lun - Sáb 9:00 - 20:00" />
              <Text k="linkMapa" label="Enlace a Google Maps (al hacer clic en la dirección)" />
            </div>
          </Card>
          <Card title="Redes sociales" icon={Globe}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Text k="instagramUrl" label="Instagram" hint="Vacío = se oculta el icono" />
              <Text k="tiktokUrl" label="TikTok" />
              <Text k="facebookUrl" label="Facebook" />
            </div>
          </Card>
        </>
      )}

      {/* ---------- INICIO / HERO ---------- */}
      {tab === "inicio" && (
        <>
          <Card title="Portada (Hero)" icon={Sparkles}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="heroKicker" label="Texto pequeño superior (kicker)" />
              <Text k="heroBoton" label="Texto del botón" />
              <Text k="heroTitulo" label="Título (línea 1)" />
              <Text k="heroTituloItalico" label="Título (línea 2, en cursiva y color)" />
            </div>
            <Area k="heroSubtitulo" label="Subtítulo" rows={2} hint="Puedes usar saltos de línea." />
            <ImageField
              label="Imagen principal"
              value={form.heroImagen ?? ""}
              onChange={(v) => set("heroImagen", v)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="heroImagenAlt" label="Texto alternativo de la imagen (SEO)" />
              <Area k="heroCaligrafia" label="Frase caligráfica sobre la imagen" rows={2} hint="Vacío = se oculta." />
            </div>
            <Text
              k="heroNota"
              label="Nota de confianza bajo el botón"
              hint="Ej. Reserva online en 1 minuto · Confirmación al instante. Vacío = se oculta."
            />
          </Card>
          <Card title="Banner final «Reserva ahora»" icon={Sparkles}>
            <p className="text-xs text-[#6B6B6B] -mt-1">
              Es el llamado grande de color al final de la página, justo antes del contacto.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Text k="ctaFinalTitulo" label="Título" />
              <Text k="ctaFinalBoton" label="Texto del botón" />
            </div>
            <Area k="ctaFinalSubtitulo" label="Subtítulo" rows={2} />
          </Card>
          <Card title="Sellos de confianza (3 columnas)" icon={Sparkles}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-2">
                  <Text k={`heroBadge${n}Titulo`} label={`Sello ${n}: título`} />
                  <Text k={`heroBadge${n}Texto`} label={`Sello ${n}: texto`} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Bloque de servicios y reserva rápida" icon={Layout}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="serviciosTitulo" label="Título de servicios" />
              <Text k="serviciosSubtitulo" label="Subtítulo de servicios" />
              <Text k="serviciosBotonTodos" label="Botón 'ver todos'" />
              <Text k="reservaRapidaTitulo" label="Reserva rápida: título" />
              <Text k="reservaRapidaSubtitulo" label="Reserva rápida: subtítulo" />
              <Text k="reservaRapidaBoton" label="Reserva rápida: botón" />
            </div>
          </Card>
        </>
      )}

      {/* ---------- SECCIONES ---------- */}
      {tab === "secciones" && (
        <>
          <Card title="Galería" icon={Images}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="galeriaTitulo" label="Título" />
              <Text k="galeriaSubtitulo" label="Subtítulo" />
            </div>
            <p className="text-[0.65rem] text-gray-400">
              Las fotos y sus categorías se gestionan en el menú Galería.
            </p>
          </Card>
          <Card title="Blog" icon={Images}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="blogTitulo" label="Título" />
              <Text k="blogSubtitulo" label="Subtítulo" />
              <Text k="blogCtaTitulo" label="Llamado a reservar en artículos: título" />
              <Text k="blogCtaBoton" label="Llamado a reservar: botón" />
            </div>
            <Area k="blogCtaTexto" label="Llamado a reservar: texto" rows={2} />
          </Card>
          <Card title="Preguntas frecuentes" icon={Images}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="faqTitulo" label="Título" />
              <Text k="faqSubtitulo" label="Subtítulo" />
            </div>
          </Card>
          <Card title="Detalle de servicio" icon={Images}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="servicioRating" label="Calificación mostrada" hint="Ej. 4.9" />
              <Text k="servicioRatingTexto" label="Texto junto a la calificación" hint="Ej. (120 reseñas). Vacío = solo la nota." />
            </div>
          </Card>
          <Card title="Contacto" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="contactoTitulo" label="Título" />
              <Text k="contactoSubtitulo" label="Subtítulo" />
              <Text k="contactoBotonWhatsapp" label="Botón de WhatsApp" />
              <Text k="contactoImagenAlt" label="Texto alternativo de la imagen" />
            </div>
            <ImageField
              label="Imagen de la sección de contacto"
              value={form.contactoImagen ?? ""}
              onChange={(v) => set("contactoImagen", v)}
            />
          </Card>
        </>
      )}

      {/* ---------- NOSOTROS ---------- */}
      {tab === "nosotros" && (
        <>
          <Card title="Sobre nosotros" icon={Users}>
            <Text k="nosotrosTitulo" label="Título" />
            <Area k="nosotrosTexto" label="Texto" rows={5} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="nosotrosBoton" label="Texto del botón" hint="Vacío = se oculta." />
              <Text k="nosotrosImagenAlt" label="Texto alternativo de la imagen" />
            </div>
            <ImageField
              label="Imagen de la sección"
              value={form.nosotrosImagen ?? ""}
              onChange={(v) => set("nosotrosImagen", v)}
            />
          </Card>
          <Card title="Métricas destacadas" icon={Sparkles}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Text k="metricasClientes" label="Métrica 1: valor" />
                <Text k="metricasClientesLabel" label="Métrica 1: etiqueta" />
              </div>
              <div className="space-y-2">
                <Text k="metricasCalificacion" label="Métrica 2: valor" />
                <Text k="metricasCalificacionLabel" label="Métrica 2: etiqueta" />
              </div>
              <div className="space-y-2">
                <Text k="metricasAnos" label="Métrica 3: valor" />
                <Text k="metricasAnosLabel" label="Métrica 3: etiqueta" />
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ---------- MENÚ Y FOOTER ---------- */}
      {tab === "footer" && (
        <>
          <Card title="Menú de navegación" icon={PanelBottom}>
            <Area
              k="menuLinks"
              label="Enlaces del menú"
              rows={7}
              hint='Uno por línea con el formato: Texto|/ruta  (ej. "Servicios|/servicios")'
            />
          </Card>
          <Card title="Pie de página" icon={PanelBottom}>
            <Area k="footerDescripcion" label="Descripción corta" rows={2} />
            <Area
              k="footerLinks"
              label="Columna 'Enlaces'"
              rows={7}
              hint="Uno por línea: Texto|/ruta. La columna 'Servicios' se genera con las categorías."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="footerCopyright" label="Texto de derechos" hint="Se antepone © año y nombre del negocio." />
              <Text k="footerFrase" label="Frase final" hint="Vacío = se oculta." />
            </div>
          </Card>
        </>
      )}

      {/* ---------- WHATSAPP Y MAPA ---------- */}
      {tab === "whatsapp" && (
        <>
          <Card title="Botón flotante de WhatsApp" icon={MessageCircle}>
            <Area
              k="whatsappMensaje"
              label="Mensaje predeterminado"
              rows={2}
              hint="Se usa en el botón flotante y en la sección de contacto. Si el número de WhatsApp está vacío, el botón se oculta."
            />
            <Text k="whatsappBotonTexto" label="Etiqueta del botón flotante" />
          </Card>
          <Card title="Mapa en Contacto" icon={Globe}>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={!!form.mostrarMapa}
                onChange={(e) => set("mostrarMapa", e.target.checked)}
              />
              Mostrar mapa embebido
            </label>
            <Area
              k="mapaEmbedUrl"
              label="URL de Google Maps (embed)"
              rows={3}
              hint='En Google Maps: Compartir → Insertar un mapa → copia solo la URL del atributo src="...".'
            />
          </Card>
        </>
      )}

      {/* ---------- SECCIONES NUEVAS ---------- */}
      {tab === "extras" && (
        <>
          <Card title="Franja de beneficios" icon={Sparkles}>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" checked={!!form.beneficiosActivo} onChange={(e) => set("beneficiosActivo", e.target.checked)} />
              Mostrar la franja de beneficios bajo la portada
            </label>
            <Area k="beneficios" label="Beneficios" rows={5} hint="Uno por línea con el formato: Título|Descripción (se muestran los primeros 4)." />
          </Card>

          <Card title="Testimonios" icon={Users}>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" checked={!!form.testimoniosActivo} onChange={(e) => set("testimoniosActivo", e.target.checked)} />
              Mostrar la sección de testimonios
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="testimoniosTitulo" label="Título" />
              <Text k="testimoniosSubtitulo" label="Subtítulo" />
            </div>
            <p className="text-[0.65rem] text-gray-400">Los testimonios individuales se cargan desde la base (menú futuro). Por ahora vienen de ejemplo.</p>
          </Card>

          <Card title="Colores de temporada" icon={Sparkles}>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" checked={!!form.coloresActivo} onChange={(e) => set("coloresActivo", e.target.checked)} />
              Mostrar el muestrario de colores
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Text k="coloresTitulo" label="Título" />
              <Text k="coloresSubtitulo" label="Subtítulo" />
            </div>
            <Area k="coloresLista" label="Colores" rows={6} hint="Uno por línea con el formato: Nombre|#hexadecimal  (ej. Rosa Blush|#F3A6BC)." />
          </Card>

          <Card title="Franja de Instagram" icon={Images}>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" checked={!!form.instagramActivo} onChange={(e) => set("instagramActivo", e.target.checked)} />
              Mostrar la franja de Instagram (usa las fotos de la galería)
            </label>
            <Text k="instagramUsuario" label="Usuario de Instagram" hint="Ej. @nailsexpress. El enlace usa el de 'Contacto y redes'." />
          </Card>

          <Card title="Antes y después" icon={Images}>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" checked={!!form.antesDespuesActivo} onChange={(e) => set("antesDespuesActivo", e.target.checked)} />
              Mostrar el comparador antes/después
            </label>
            <Text k="antesDespuesTitulo" label="Título" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageField label="Imagen 'antes'" value={form.antesImagen ?? ""} onChange={(v) => set("antesImagen", v)} />
              <ImageField label="Imagen 'después'" value={form.despuesImagen ?? ""} onChange={(v) => set("despuesImagen", v)} />
            </div>
          </Card>
        </>
      )}

      {/* ---------- SELLOS (FIDELIDAD) ---------- */}
      {tab === "sellos" && (
        <Card title="Programa de tarjeta de sellos" icon={Gift}>
          <p className="text-xs text-[#6B6B6B] -mt-1">
            La clienta suma un sello cada vez que marcás su cita como <b>Completada</b>.
            Al llegar a la meta gana el premio (con un código que muestra en el salón) y
            la tarjeta reinicia. Lo ve en “Mis Citas” con su celular.
          </p>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 pt-1">
            <input
              type="checkbox"
              checked={!!form.sellosActivo}
              onChange={(e) => set("sellosActivo", e.target.checked)}
            />
            Activar el programa de sellos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Text k="sellosMeta" type="number" label="Sellos para ganar el premio" hint="Ej. 8 visitas." />
            <Text
              k="sellosExpiraDias"
              type="number"
              label="El premio expira a los (días)"
              hint="Ej. 180. Poné 0 para que no expire."
            />
          </div>
          <Text k="sellosPremio" label="El premio" hint="Ej. 50% de descuento en tu próximo servicio." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Text k="sellosTitulo" label="Título de la tarjeta" />
            <Text k="sellosSubtitulo" label="Subtítulo de la tarjeta" />
          </div>
          <p className="text-xs text-[#6B6B6B]">
            💡 Estos textos también aparecen en la sección «Programa de fidelidad»
            de la página principal, que promociona los sellos a tus clientas.
          </p>
        </Card>
      )}

      {/* ---------- PANEL DE INICIO (DASHBOARD) ---------- */}
      {tab === "dashboard" && (
        <Card title="Tarjetas del panel de inicio" icon={LayoutDashboard}>
          <p className="text-xs text-[#6B6B6B] -mt-1">
            Los números grandes (citas, ingresos, faltas) se calculan solos con los
            datos reales. Aquí editás los textos pequeños de color que los acompañan.
            Deja un campo vacío para ocultar esa etiqueta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Text k="dashBadgeCitasHoy" label="Etiqueta de 'Citas Hoy'" hint="Ej. +14% vs ayer" />
            <Text k="dashSubCitasHoy" label="Nota al pie de 'Citas Hoy'" hint="Ej. 100% libre de cruces" />
            <Text k="dashBadgeSemana" label="Etiqueta de 'Esta Semana'" hint="Ej. +8% semanal" />
            <Text k="dashBadgeIngresos" label="Etiqueta de 'Ingresos Hoy'" hint="Ej. Proyección activa" />
            <Text k="dashBadgeInasistencia" label="Etiqueta de 'Inasistencia'" hint="Ej. Bajo control" />
          </div>
        </Card>
      )}

      {/* ---------- SEO ---------- */}
      {tab === "seo" && (
        <>
          <Card title="Metadatos del sitio" icon={Search}>
            <Text k="seoTitulo" label="Título del sitio (pestaña del navegador y Google)" />
            <Area k="seoDescripcion" label="Descripción" rows={3} hint="Ideal: 150-160 caracteres." />
            <Text k="seoKeywords" label="Palabras clave" hint="Separadas por coma." />
          </Card>
          <Card title="Datos estructurados del negocio (Google)" icon={Globe}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Text k="ciudad" label="Ciudad" />
              <Text k="pais" label="País (código)" hint="Ej. PE" />
              <Text k="codigoPostal" label="Código postal" />
              <Text k="latitud" label="Latitud" />
              <Text k="longitud" label="Longitud" />
              <Text k="rangoPrecios" label="Rango de precios" />
            </div>
            <Text k="metodosPago" label="Métodos de pago aceptados" />
            <p className="text-[0.65rem] text-gray-400">
              Los horarios de apertura se toman del menú Horarios y Equipo.
            </p>
          </Card>
        </>
      )}

      {/* ---------- RESERVAS ---------- */}
      {tab === "reservas" && (
        <Card title="Reglas del motor de agendamiento" icon={Clock}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Text
              k="anticipacionMinimaHoras"
              type="number"
              label="Anticipación mínima para reservar (horas)"
              hint="Las clientas no podrán reservar con menos de estas horas de margen."
            />
            <Text
              k="horasLimiteCancelacion"
              type="number"
              label="Horas límite para cancelar / reprogramar"
              hint="Tiempo previo a la cita dentro del cual el cliente puede cancelar desde la web."
            />
            <Text k="maximoDiasAdelante" type="number" label="Máximo de días hacia adelante" />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Intervalo de slots de horario (minutos)
              </label>
              <select
                value={form.intervaloSlotsMinutos}
                onChange={(e) => set("intervaloSlotsMinutos", parseInt(e.target.value, 10))}
                className={`${inputCls} bg-white`}
              >
                <option value="15">Cada 15 minutos</option>
                <option value="30">Cada 30 minutos (Recomendado)</option>
                <option value="45">Cada 45 minutos</option>
                <option value="60">Cada 60 minutos</option>
              </select>
            </div>
          </div>
        </Card>
      )}
        </div>
        {/* Fin columna izquierda */}

        {/* Columna derecha: vista previa en vivo */}
        <div className="order-1 xl:order-2 xl:sticky xl:top-28">
          <SettingsLivePreview form={form} tab={tab} />
        </div>
      </div>
    </form>
    </FormCtx.Provider>
  );
}

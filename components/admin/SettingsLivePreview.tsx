"use client";

import React from "react";
import {
  Gem,
  Clock,
  Heart,
  Sparkles,
  Star,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Calendar,
  Search as SearchIcon,
} from "lucide-react";

type Data = Record<string, any>;

function lines(text: string) {
  return (text || "").split(/\r?\n/);
}

function parseLinks(raw: string): { name: string; href: string }[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, href] = l.split("|").map((s) => s.trim());
      return { name: name || href || "", href: href || "#" };
    })
    .filter((l) => l.name);
}

/** Marco tipo mini-navegador */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[0.6rem] text-gray-400 truncate">
          nailsexpress.com
        </span>
      </div>
      <div className="max-h-[70vh] overflow-auto">{children}</div>
    </div>
  );
}

function MiniHeader({ f }: { f: Data }) {
  const links = parseLinks(f.menuLinks).slice(0, 6);
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white">
      {f.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.logo} alt="" className="h-5 w-auto object-contain" />
      ) : (
        <div className="leading-none">
          <div className="text-[0.7rem] font-black tracking-[0.15em] text-[#1A1A1A]">
            {f.logoTextoPrincipal || "NAILS"}
          </div>
          <div className="text-[0.42rem] font-bold tracking-[0.2em] text-gray-400">
            {f.logoTextoSecundario || "EXPRESS"}
          </div>
        </div>
      )}
      <div className="hidden sm:flex items-center gap-2">
        {links.map((l) => (
          <span key={l.name} className="text-[0.55rem] text-gray-500">
            {l.name}
          </span>
        ))}
      </div>
      <span className="text-[0.55rem] font-bold text-white bg-primary rounded-full px-2 py-1">
        {f.headerBoton || "Reservar cita"}
      </span>
    </div>
  );
}

function HeroPreview({ f }: { f: Data }) {
  const badges = [
    { Icon: Gem, t: f.heroBadge1Titulo, s: f.heroBadge1Texto },
    { Icon: Clock, t: f.heroBadge2Titulo, s: f.heroBadge2Texto },
    { Icon: Heart, t: f.heroBadge3Titulo, s: f.heroBadge3Texto },
  ].filter((b) => b.t);
  return (
    <div className="p-4 bg-gradient-to-b from-[#FFFDFD] to-white">
      {f.heroKicker && (
        <div className="text-[0.5rem] uppercase tracking-[0.2em] text-gray-400 mb-1.5">
          {f.heroKicker}
        </div>
      )}
      <div className="font-serif text-lg leading-tight text-[#1A1A1A]">
        {f.heroTitulo}
        {f.heroTituloItalico && (
          <div className="italic text-primary">{f.heroTituloItalico}</div>
        )}
      </div>
      <p className="text-[0.6rem] text-[#6B6B6B] mt-2 leading-snug">
        {lines(f.heroSubtitulo).map((l, i) => (
          <React.Fragment key={i}>
            {l}
            {i < lines(f.heroSubtitulo).length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      <span className="inline-block mt-2.5 text-[0.6rem] font-semibold text-white bg-primary rounded-full px-3 py-1.5">
        {(f.heroBoton || "").replace(/\s*→\s*$/, "")} →
      </span>

      {f.heroImagen && (
        <div className="mt-3 relative rounded-xl overflow-hidden aspect-[1.3/1] bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.heroImagen} alt="" className="w-full h-full object-cover" />
          {f.heroCaligrafia && (
            <span className="absolute bottom-1.5 right-2 text-right font-script text-sm text-[#5F8E87]/90 leading-tight">
              {lines(f.heroCaligrafia).map((l, i) => (
                <React.Fragment key={i}>
                  {l}
                  {i < lines(f.heroCaligrafia).length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          )}
        </div>
      )}

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-2.5">
          {badges.map(({ Icon, t, s }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                <Icon className="w-2.5 h-2.5 text-[#1A1A1A]" />
              </span>
              <div className="leading-tight">
                <div className="text-[0.55rem] font-bold text-[#1A1A1A]">{t}</div>
                <div className="text-[0.5rem] text-gray-400">{s}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NosotrosPreview({ f }: { f: Data }) {
  const metrics = [
    { Icon: Sparkles, v: f.metricasClientes, l: f.metricasClientesLabel },
    { Icon: Star, v: f.metricasCalificacion, l: f.metricasCalificacionLabel },
    { Icon: Heart, v: f.metricasAnos, l: f.metricasAnosLabel },
  ].filter((m) => m.v);
  return (
    <div className="p-4 space-y-3">
      <div className="text-base font-bold text-[#1A1A1A] leading-tight">
        {f.nosotrosTitulo}
      </div>
      <p className="text-[0.6rem] text-[#6B6B6B] leading-snug whitespace-pre-line">
        {f.nosotrosTexto}
      </p>
      {f.nosotrosBoton && (
        <span className="inline-block text-[0.6rem] font-semibold text-white bg-primary rounded-full px-3 py-1.5">
          {f.nosotrosBoton}
        </span>
      )}
      {f.nosotrosImagen && (
        <div className="relative rounded-xl overflow-hidden aspect-[1.4/1] bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.nosotrosImagen} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {metrics.length > 0 && (
        <div className="bg-[#E6F6F4] rounded-xl p-3 grid grid-cols-3 gap-2 border border-[#CFEDEA]">
          {metrics.map(({ Icon, v, l }, i) => (
            <div key={i} className="text-center">
              <Icon className="w-4 h-4 text-[#3EA59E] mx-auto mb-1" />
              <div className="text-xs font-extrabold text-[#1A1A1A]">{v}</div>
              <div className="text-[0.5rem] text-[#6B6B6B]">{l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactoPreview({ f }: { f: Data }) {
  const rows = [
    { Icon: Phone, v: f.telefono },
    { Icon: Mail, v: f.email },
    { Icon: MapPin, v: f.direccion },
    { Icon: Clock, v: f.horarioVisible },
  ].filter((r) => r.v);
  return (
    <div className="p-4 space-y-3">
      <div className="text-base font-bold text-[#1A1A1A]">{f.contactoTitulo}</div>
      <p className="text-[0.6rem] text-[#6B6B6B]">{f.contactoSubtitulo}</p>
      <div className="space-y-1.5">
        {rows.map(({ Icon, v }, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
              <Icon className="w-3 h-3 text-[#1A1A1A]" />
            </span>
            <span className="text-[0.6rem] text-[#1A1A1A]">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {f.instagramUrl && (
          <span className="w-6 h-6 rounded-full bg-[#E6F6F4] flex items-center justify-center">
            <Instagram className="w-3 h-3 text-[#1A1A1A]" />
          </span>
        )}
        {f.facebookUrl && (
          <span className="w-6 h-6 rounded-full bg-[#E6F6F4] flex items-center justify-center">
            <Facebook className="w-3 h-3 text-[#1A1A1A]" />
          </span>
        )}
        {f.whatsapp && (
          <span className="inline-flex items-center gap-1 text-[0.55rem] font-semibold text-white bg-primary rounded-full px-2.5 py-1">
            <MessageCircle className="w-3 h-3" />
            {f.contactoBotonWhatsapp || "WhatsApp"}
          </span>
        )}
      </div>
      {f.contactoImagen && (
        <div className="relative rounded-xl overflow-hidden aspect-[1.4/1] bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.contactoImagen} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

function FooterPreview({ f }: { f: Data }) {
  const links = parseLinks(f.footerLinks);
  return (
    <div className="bg-[#0E0E0E] text-white p-4 space-y-3">
      <div>
        <div className="text-sm font-black tracking-[0.15em]">
          {f.logoTextoPrincipal || "NAILS"}
        </div>
        <div className="text-[0.5rem] tracking-[0.2em] text-gray-400">
          {f.logoTextoSecundario || "EXPRESS"}
        </div>
      </div>
      <p className="text-[0.6rem] text-gray-400">{f.footerDescripcion}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((l) => (
          <span key={l.name} className="text-[0.55rem] text-gray-400">
            {l.name}
          </span>
        ))}
      </div>
      <div className="border-t border-[#222] pt-2 text-[0.5rem] text-gray-500">
        © {new Date().getFullYear()} {f.nombreNegocio}. {f.footerCopyright}
      </div>
    </div>
  );
}

function SeoPreview({ f }: { f: Data }) {
  return (
    <div className="p-4 space-y-3">
      <div className="text-[0.6rem] text-gray-400">Así se vería en Google:</div>
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="text-[0.55rem] text-gray-500 flex items-center gap-1">
          <SearchIcon className="w-2.5 h-2.5" /> nailsexpress.com
        </div>
        <div className="text-[#1a0dab] text-sm leading-tight mt-0.5">
          {f.seoTitulo}
        </div>
        <div className="text-[0.6rem] text-[#4d5156] mt-1 leading-snug">
          {f.seoDescripcion}
        </div>
      </div>
    </div>
  );
}

function DashboardPreview({ f }: { f: Data }) {
  const cards = [
    { label: "Citas Hoy", value: "8", badge: f.dashBadgeCitasHoy, sub: f.dashSubCitasHoy },
    { label: "Esta Semana", value: "24", badge: f.dashBadgeSemana },
    { label: "Ingresos Hoy", value: `${f.moneda || "S/"} 320`, badge: f.dashBadgeIngresos },
    { label: "Inasistencia", value: "2.1%", badge: f.dashBadgeInasistencia },
  ];
  return (
    <div className="p-4 grid grid-cols-2 gap-2 bg-[#FAF7F7]">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-2.5">
          <div className="text-[0.5rem] uppercase tracking-wide text-gray-400">
            {c.label}
          </div>
          <div className="text-base font-black text-[#1A1A1A] mt-0.5">{c.value}</div>
          {c.badge && (
            <span className="inline-block text-[0.5rem] font-bold text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5 mt-1">
              {c.badge}
            </span>
          )}
          {c.sub && <div className="text-[0.45rem] text-gray-400 mt-0.5">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function StampsPreview({ f }: { f: Data }) {
  const meta = Math.max(1, Math.min(12, parseInt(f.sellosMeta, 10) || 8));
  const sellos = Math.min(meta, Math.round(meta * 0.6));
  return (
    <div className="p-4">
      <div className="relative overflow-hidden rounded-2xl border border-[#CFEDEA] bg-[radial-gradient(130%_100%_at_80%_-10%,#E6F6F4,transparent_55%),#fff] p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[0.5rem] text-[#8E8E8E]">Tarjeta de sellos</div>
            <div className="text-sm font-bold text-[#1A1A1A] leading-tight">
              {f.sellosTitulo || "Tu tarjeta de sellos"}
            </div>
          </div>
          <span className="text-[0.55rem] font-bold text-[#2AA79C] bg-[#E6F6F4] rounded-full px-2 py-0.5">
            {sellos} de {meta}
          </span>
        </div>
        <p className="text-[0.6rem] text-[#6B6B6B] mt-0.5">{f.sellosSubtitulo}</p>
        <div className={`grid ${meta > 8 ? "grid-cols-5" : "grid-cols-4"} gap-1.5 mt-3`}>
          {Array.from({ length: meta }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center ${
                i < sellos
                  ? "bg-gradient-to-br from-[#9FE0D9] to-[#E6F6F4] border border-[#3EA59E]/40"
                  : "border border-dashed border-[#CFEDEA] bg-[#F0FAF9]/60"
              }`}
            >
              {i < sellos ? (
                <span className="text-[#46B8B0] text-[0.7rem]">●</span>
              ) : (
                <span className="text-[0.5rem] text-[#BBBBBB] font-bold">{i + 1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-dashed border-[#CFEDEA] text-[0.6rem] text-[#6B6B6B]">
          Premio: <b className="text-[#1A1A1A]">{f.sellosPremio}</b>
        </div>
      </div>
    </div>
  );
}

function SectionTitles({ f }: { f: Data }) {
  const secs = [
    { t: f.serviciosTitulo, s: f.serviciosSubtitulo },
    { t: f.galeriaTitulo, s: f.galeriaSubtitulo },
    { t: f.blogTitulo, s: f.blogSubtitulo },
    { t: f.faqTitulo, s: f.faqSubtitulo },
  ].filter((x) => x.t);
  return (
    <div className="p-4 space-y-3">
      {secs.map((x, i) => (
        <div key={i} className="text-center border-b border-gray-50 pb-3 last:border-0">
          <div className="text-sm font-bold text-[#1A1A1A]">{x.t}</div>
          <div className="text-[0.6rem] text-[#6B6B6B] mt-0.5">{x.s}</div>
        </div>
      ))}
    </div>
  );
}

function WhatsappPreview({ f }: { f: Data }) {
  return (
    <div className="p-4 space-y-3">
      <div className="relative bg-[#F8FAF9] rounded-xl border border-gray-100 h-28 flex items-center justify-center">
        <span className="text-[0.6rem] text-gray-400">
          {f.mostrarMapa ? "Mapa de ubicación" : "Mapa oculto"}
        </span>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[0.55rem] font-semibold text-white bg-primary rounded-full px-2 py-1 shadow">
          <MessageCircle className="w-3 h-3" />
          {f.whatsappBotonTexto || "WhatsApp"}
        </span>
      </div>
      <div className="text-[0.6rem] text-[#6B6B6B] bg-gray-50 rounded-lg p-2.5">
        <span className="font-semibold text-[#1A1A1A]">Mensaje: </span>
        {f.whatsappMensaje}
      </div>
    </div>
  );
}

export default function SettingsLivePreview({
  form,
  tab,
}: {
  form: Data;
  tab: string;
}) {
  let body: React.ReactNode;
  switch (tab) {
    case "inicio":
    case "general":
      body = (
        <>
          <MiniHeader f={form} />
          <HeroPreview f={form} />
        </>
      );
      break;
    case "nosotros":
      body = (
        <>
          <MiniHeader f={form} />
          <NosotrosPreview f={form} />
        </>
      );
      break;
    case "contacto":
      body = (
        <>
          <MiniHeader f={form} />
          <ContactoPreview f={form} />
        </>
      );
      break;
    case "secciones":
      body = (
        <>
          <MiniHeader f={form} />
          <SectionTitles f={form} />
        </>
      );
      break;
    case "footer":
      body = <FooterPreview f={form} />;
      break;
    case "whatsapp":
      body = (
        <>
          <MiniHeader f={form} />
          <WhatsappPreview f={form} />
        </>
      );
      break;
    case "dashboard":
      body = <DashboardPreview f={form} />;
      break;
    case "sellos":
      body = (
        <>
          <MiniHeader f={form} />
          <StampsPreview f={form} />
        </>
      );
      break;
    case "seo":
      body = <SeoPreview f={form} />;
      break;
    case "reservas":
      body = (
        <div className="p-4 text-[0.6rem] text-[#6B6B6B] leading-relaxed">
          Estas reglas controlan el motor de reservas (anticipación, cancelación,
          días e intervalos). No cambian el aspecto visual de la web, por eso no hay
          vista previa. Los cambios se aplican al reservar.
        </div>
      );
      break;
    default:
      body = (
        <>
          <MiniHeader f={form} />
          <HeroPreview f={form} />
        </>
      );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-[0.7rem] font-bold text-gray-500 uppercase tracking-wide">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Vista previa en vivo
      </div>
      <Frame>{body}</Frame>
      <p className="text-[0.6rem] text-gray-400 mt-2 leading-snug">
        Se actualiza mientras escribís. Apretá “Guardar Cambios” para publicarlo en
        la web real.
      </p>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import type { SiteSettings, SiteLink } from "@/lib/site-content";
import { parseLinks } from "@/lib/site-content";

interface FooterProps {
  settings: SiteSettings;
  categorias: { nombre: string; slug: string }[];
}

export default function Footer({ settings: s, categorias }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const links: SiteLink[] = parseLinks(s.footerLinks);

  return (
    <footer className="bg-[#0E0E0E] text-white pt-16 pb-8 border-t border-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-14 border-b border-[#222222]">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex flex-col select-none">
              {s.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logo} alt={s.nombreNegocio} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <span className="text-2xl font-extrabold tracking-[0.22em] text-white uppercase">
                    {s.logoTextoPrincipal}
                  </span>
                  <span className="text-[0.62rem] font-bold tracking-[0.32em] text-[#9E9E9E] -mt-1 uppercase">
                    {s.logoTextoSecundario}
                  </span>
                </>
              )}
            </Link>
            <p className="text-[#9E9E9E] text-sm leading-relaxed max-w-xs">{s.footerDescripcion}</p>
            <div className="flex items-center space-x-3 pt-2">
              {s.instagramUrl && (
                <a
                  href={s.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-[#1C1C1C] hover:bg-primary hover:text-white text-[#BBBBBB] flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {s.tiktokUrl && (
                <a
                  href={s.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-full bg-[#1C1C1C] hover:bg-primary hover:text-white text-[#BBBBBB] flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold leading-none">Tk</span>
                </a>
              )}
              {s.facebookUrl && (
                <a
                  href={s.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-[#1C1C1C] hover:bg-primary hover:text-white text-[#BBBBBB] flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Enlaces */}
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-4">Enlaces</h3>
            <ul className="space-y-3 text-sm text-[#9E9E9E]">
              {links.map((l) => (
                <li key={l.href + l.name}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Servicios (categorías desde la base de datos) */}
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-4">Servicios</h3>
            <ul className="space-y-3 text-sm text-[#9E9E9E]">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/servicios?categoria=${c.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {c.nombre}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors">
                  Ver todos
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto */}
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-[#9E9E9E]">
              {(s.whatsapp || s.telefono) && (
                <li className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{[s.whatsapp, s.telefono].filter(Boolean).join(" / ")}</span>
                </li>
              )}
              {s.email && (
                <li className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${s.email}`} className="hover:text-white transition-colors">
                    {s.email}
                  </a>
                </li>
              )}
              {s.direccion && (
                <li className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{s.direccion}</span>
                </li>
              )}
              {s.horarioVisible && (
                <li className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{s.horarioVisible}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#707070] gap-4">
          <p>
            © {currentYear} {s.nombreNegocio}. {s.footerCopyright}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-gray-400">
              Acceso Admin
            </Link>
            {s.footerFrase && (
              <>
                <span>•</span>
                <p>{s.footerFrase}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

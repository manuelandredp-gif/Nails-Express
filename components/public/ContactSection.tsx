import React from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/site-content";
import { whatsappLink, buildMapEmbedUrl } from "@/lib/site-content";
import TikTokIcon from "@/components/public/TikTokIcon";
import OpenStatus, { type HoursDay } from "@/components/public/OpenStatus";

interface ContactSectionProps {
  settings: SiteSettings;
  showMap?: boolean;
  horarios?: HoursDay[];
}

export default function ContactSection({ settings: s, showMap, horarios }: ContactSectionProps) {
  const whatsappUrl = whatsappLink(s.whatsapp, s.whatsappMensaje);
  const mapEmbedUrl = buildMapEmbedUrl(s);
  const mapVisible = (showMap ?? true) && s.mostrarMapa && !!mapEmbedUrl;

  return (
    <section className="py-16 sm:py-20 sec-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Contact details */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] tracking-tight">
                {s.contactoTitulo}
              </h2>
              <p className="mt-3 text-base text-[#6B6B6B]">{s.contactoSubtitulo}</p>
            </div>

            <div className="space-y-4">
              {s.telefono && (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                    <Phone className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">{s.telefono}</span>
                </div>
              )}

              {s.email && (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                    <Mail className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                  </div>
                  <a
                    href={`mailto:${s.email}`}
                    className="text-sm font-medium text-[#1A1A1A] hover:text-primary transition-colors"
                  >
                    {s.email}
                  </a>
                </div>
              )}

              {s.direccion && (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                    <MapPin className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                  </div>
                  {s.linkMapa ? (
                    <a
                      href={s.linkMapa}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#1A1A1A] hover:text-primary transition-colors"
                    >
                      {s.direccion}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-[#1A1A1A]">{s.direccion}</span>
                  )}
                </div>
              )}

              {s.horarioVisible && (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                    <Clock className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[#1A1A1A]">{s.horarioVisible}</span>
                    {horarios && horarios.length > 0 && <OpenStatus hours={horarios} />}
                  </div>
                </div>
              )}
            </div>

            {/* Social Icons & WhatsApp Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-3">
                {s.instagramUrl && (
                  <a
                    href={s.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full bg-[#E6F6F4] hover:bg-primary text-[#1A1A1A] hover:text-white flex items-center justify-center transition-colors"
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
                    className="w-10 h-10 rounded-full bg-[#E6F6F4] hover:bg-primary text-[#1A1A1A] hover:text-white flex items-center justify-center transition-colors"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                )}
                {s.facebookUrl && (
                  <a
                    href={s.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full bg-[#E6F6F4] hover:bg-primary text-[#1A1A1A] hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>

              {s.whatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{s.contactoBotonWhatsapp}</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden shadow-sm border border-[#ECECEC]">
              <Image
                src={s.contactoImagen}
                alt={s.contactoImagenAlt}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Embedded Google Map */}
        {mapVisible && (
          <div className="mt-14 rounded-[18px] overflow-hidden border border-[#ECECEC] shadow-sm">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de ${s.nombreNegocio}`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

import React from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";

interface ContactSectionProps {
  telefono?: string;
  whatsapp?: string;
  email?: string;
  direccion?: string;
  horario?: string;
  showMap?: boolean;
}

export default function ContactSection({
  telefono = "+51 952 123 456",
  whatsapp = "+51 952 123 456",
  email = "hola@nailsexpress.com",
  direccion = "Av. San Martín 456, Tacna, Perú",
  horario = "Lun - Sáb 9:00 - 20:00",
  showMap = true,
}: ContactSectionProps) {
  const whatsappUrl = `https://wa.me/51952123456?text=${encodeURIComponent(
    "Hola Nails Express, tengo una consulta sobre sus servicios."
  )}`;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Contact details */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] tracking-tight">
                Contáctanos
              </h2>
              <p className="mt-3 text-base text-[#6B6B6B]">
                ¿Tienes dudas o quieres más información? ¡Escríbenos!
              </p>
            </div>

            {/* Contact list with thin icons */}
            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                  <Phone className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {telefono}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                  <Mail className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                </div>
                <div>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm font-medium text-[#1A1A1A] hover:text-primary transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                  <MapPin className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {direccion}
                  </span>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center text-[#1A1A1A]">
                  <Clock className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {horario}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Icons & WhatsApp Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-[#FBEDED] hover:bg-primary text-[#1A1A1A] hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full bg-[#FBEDED] hover:bg-primary text-[#1A1A1A] hover:text-white flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold leading-none">Tk</span>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-[#FBEDED] hover:bg-primary text-[#1A1A1A] hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escríbenos a WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Neon Sign Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden shadow-sm border border-[#ECECEC]">
              <Image
                src="/images/neon-sign.jpg"
                alt="Happy Girls Pretty Nails letrero neón Nails Express"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Embedded Google Map */}
        {showMap && (
          <div className="mt-14 rounded-[18px] overflow-hidden border border-[#ECECEC] shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15197.669614742874!2d-70.25413346473133!3d-18.01386762391697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915acf5dfeb6e60b%3A0xe5567b57b545f47!2sTacna%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Nails Express en Tacna"
            />
          </div>
        )}
      </div>
    </section>
  );
}

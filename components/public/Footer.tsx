import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0E0E0E] text-white pt-16 pb-8 border-t border-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-14 border-b border-[#222222]">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex flex-col select-none">
              <span className="text-2xl font-extrabold tracking-[0.22em] text-white uppercase">
                NAILS
              </span>
              <span className="text-[0.62rem] font-bold tracking-[0.32em] text-[#9E9E9E] -mt-1 uppercase">
                EXPRESS
              </span>
            </Link>
            <p className="text-[#9E9E9E] text-sm leading-relaxed max-w-xs">
              Belleza, bienestar y confianza en un solo lugar.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#1C1C1C] hover:bg-primary hover:text-white text-[#BBBBBB] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-[#1C1C1C] hover:bg-primary hover:text-white text-[#BBBBBB] flex items-center justify-center transition-colors"
              >
                <span className="text-xs font-bold leading-none">Tk</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#1C1C1C] hover:bg-primary hover:text-white text-[#BBBBBB] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Enlaces */}
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-4">
              Enlaces
            </h3>
            <ul className="space-y-3 text-sm text-[#9E9E9E]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="hover:text-white transition-colors"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  href="/galeria"
                  className="hover:text-white transition-colors"
                >
                  Galería
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros"
                  className="hover:text-white transition-colors"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="hover:text-white transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/mis-citas"
                  className="hover:text-primary transition-colors text-xs text-primary"
                >
                  Consultar cita
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Servicios */}
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-4">
              Servicios
            </h3>
            <ul className="space-y-3 text-sm text-[#9E9E9E]">
              <li>
                <Link
                  href="/servicios?categoria=manicure"
                  className="hover:text-white transition-colors"
                >
                  Manicure
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios?categoria=pedicure"
                  className="hover:text-white transition-colors"
                >
                  Pedicure
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios?categoria=disenos"
                  className="hover:text-white transition-colors"
                >
                  Diseños
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios?categoria=extras"
                  className="hover:text-white transition-colors"
                >
                  Extras
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="hover:text-white transition-colors"
                >
                  Promociones
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto */}
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-4">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-[#9E9E9E]">
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+51 952 123 456 / 55 1234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="mailto:hola@nailsexpress.com"
                  className="hover:text-white transition-colors"
                >
                  hola@nailsexpress.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Av. San Martín 456, Tacna, Perú</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Lun - Sáb 9:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#707070] gap-4">
          <p>© {currentYear} Nails Express. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-gray-400">
              Acceso Admin
            </Link>
            <span>•</span>
            <p>Hecho con ♡ para uñas increíbles.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

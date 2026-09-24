import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Gem, Clock, Heart } from "lucide-react";

interface HeroProps {
  kicker?: string;
  titulo?: string;
  subtitulo?: string;
  botonTexto?: string;
}

export default function Hero({
  kicker = "MANOS QUE HABLAN DE TI",
  titulo,
  subtitulo = "Manicure, pedicure y diseños personalizados. Rápido, fácil y cerca de ti.",
  botonTexto = "Reservar ahora",
}: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-[#FFFDFD] via-[#FAF6F6] to-white relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Headline & Value Props */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs uppercase font-medium tracking-[0.25em] text-[#8E8E8E]">
              {kicker}
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.2rem] text-[#1A1A1A] leading-[1.12] tracking-tight">
              Uñas increíbles,<br />
              <span className="italic font-normal text-primary font-serif">
                cuando tú quieras
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-lg">
              Manicure, pedicure y diseños personalizados.<br className="hidden sm:inline" />
              Rápido, fácil y cerca de ti.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/reservar"
                className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-3.5 px-8 rounded-full inline-flex items-center gap-2 shadow-xs transition-all hover:scale-102"
              >
                <span>{botonTexto}</span>
                <span>→</span>
              </Link>
            </div>

            {/* 3 Horizontal Trust Indicators */}
            <div className="pt-8 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                  <Gem className="w-4 h-4 text-[#1A1A1A] stroke-[1.5]" />
                </div>
                <div>
                  <span className="font-bold block text-xs text-[#1A1A1A]">Calidad</span>
                  <span className="text-[11px] text-gray-500">en cada servicio</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#1A1A1A] stroke-[1.5]" />
                </div>
                <div>
                  <span className="font-bold block text-xs text-[#1A1A1A]">En el horario</span>
                  <span className="text-[11px] text-gray-500">que prefieras</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-[#1A1A1A] stroke-[1.5]" />
                </div>
                <div>
                  <span className="font-bold block text-xs text-[#1A1A1A]">Resultados</span>
                  <span className="text-[11px] text-gray-500">que amarás</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image with Whimsical Calligraphy */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[1.15/1] rounded-[28px] overflow-hidden shadow-sm border border-white/60">
              <Image
                src="/images/hero-hands.jpg"
                alt="Uñas increíbles Nails Express"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
              />

              {/* Whimsical Calligraphic Overlay "Good Nails Good Mood ♡" */}
              <div className="absolute bottom-5 right-6 select-none pointer-events-none text-right">
                <span className="font-script text-3xl sm:text-4xl text-[#5F8E87]/90 block leading-tight rotate-[-3deg] drop-shadow-xs">
                  Good Nails<br />Good Mood ♡
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

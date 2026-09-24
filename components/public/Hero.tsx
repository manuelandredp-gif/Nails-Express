import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Calendar, Heart } from "lucide-react";

interface HeroProps {
  kicker?: string;
  titulo?: string;
  subtitulo?: string;
  botonTexto?: string;
}

export default function Hero({
  kicker = "MANOS QUE HABLAN DE TI",
  titulo = "Uñas increíbles, cuando tú quieras",
  subtitulo = "Manicure, pedicure y diseños personalizados. Rápido, fácil y cerca de ti.",
  botonTexto = "Reservar ahora",
}: HeroProps) {
  return (
    <section className="bg-[#FAF3F3] relative overflow-hidden pt-10 pb-16 sm:pb-20 lg:pt-14 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kicker */}
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-[0.25em] uppercase">
              <span className="text-[#E8707A]">MANOS QUE</span>
              <span className="text-[#1A1A1A]">HABLAN DE TI</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[#1A1A1A] leading-[1.15] tracking-tight">
              {titulo}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-xl">
              {subtitulo}
            </p>

            {/* Button */}
            <div className="pt-2">
              <Link
                href="/reservar"
                className="btn-primary text-base py-3.5 px-8 shadow-sm hover:shadow-md group inline-flex"
              >
                <span>{botonTexto}</span>
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square rounded-[22px] overflow-hidden shadow-sm">
              <Image
                src="/images/hero-hands.jpg"
                alt="Manicura editorial Nails Express"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* 3 Pillars / Benefits at the base */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 lg:pt-20 border-t border-[#F2E5E5] mt-12 sm:mt-16">
          {/* Benefit 1 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/80 border border-[#F0DADA] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Rápido y fácil</h3>
              <p className="text-xs text-[#6B6B6B]">Agenda en segundos desde tu celular</p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/80 border border-[#F0DADA] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">
                En el horario que prefieras
              </h3>
              <p className="text-xs text-[#6B6B6B]">Disponibilidad en tiempo real</p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/80 border border-[#F0DADA] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">
                Resultados que amarás
              </h3>
              <p className="text-xs text-[#6B6B6B]">Garantía de calidad y satisfacción</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

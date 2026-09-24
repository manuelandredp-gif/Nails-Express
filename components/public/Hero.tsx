import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Calendar, Heart, Star, Sparkles } from "lucide-react";

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
    <section className="bg-[#FAF3F3] relative overflow-hidden pt-8 pb-16 sm:pb-20 lg:pt-12 lg:pb-24">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blush/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-primary/30 shadow-2xs backdrop-blur-sm animate-in fade-in-50 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[0.72rem] font-bold text-gray-800 tracking-wide">
                Citas disponibles hoy en Tacna
              </span>
            </div>

            {/* Kicker */}
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-[0.25em] uppercase block">
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

            {/* Buttons & Trust line */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/reservar"
                className="btn-primary text-base py-3.5 px-8 shadow-sm hover:shadow-md group inline-flex"
              >
                <span>{botonTexto}</span>
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/servicios"
                className="btn-outline text-sm py-3 px-6 bg-white/60 hover:bg-white"
              >
                Ver servicios y precios
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Image with Floating Glassmorphism Badges */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square rounded-[24px] overflow-hidden shadow-sm border border-white/60 group">
              <Image
                src="/images/hero-hands.jpg"
                alt="Manicura editorial Nails Express"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
              />

              {/* Floating Glassmorphism Review Badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-white/80 p-3 rounded-[16px] shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-700">
                <div className="w-10 h-10 rounded-full bg-[#FAF3F3] flex items-center justify-center text-[#E8707A] shrink-0">
                  <Star className="w-5 h-5 fill-[#E8707A]" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-sm text-[#1A1A1A]">4.9</span>
                    <div className="flex text-[#FFB800]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#FFB800]" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[0.68rem] text-gray-600 font-medium block">
                    +5,000 clientas felices en Tacna
                  </span>
                </div>
              </div>

              {/* Floating Sparkles Badge */}
              <div className="absolute top-4 right-4 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/70 shadow-xs flex items-center gap-1.5 text-[0.7rem] font-bold text-gray-800">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Nail Bar Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars / Benefits at the base */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 lg:pt-20 border-t border-[#F2E5E5] mt-12 sm:mt-16">
          {/* Benefit 1 */}
          <div className="flex items-center space-x-4 bg-white/40 p-3 rounded-2xl border border-white/50">
            <div className="w-12 h-12 rounded-xl bg-white/90 border border-[#F0DADA] flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-5 h-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Rápido y fácil</h3>
              <p className="text-xs text-[#6B6B6B]">Agenda en 30 segundos sin llamadas</p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-center space-x-4 bg-white/40 p-3 rounded-2xl border border-white/50">
            <div className="w-12 h-12 rounded-xl bg-white/90 border border-[#F0DADA] flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">
                En el horario que prefieras
              </h3>
              <p className="text-xs text-[#6B6B6B]">Disponibilidad en tiempo real</p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-center space-x-4 bg-white/40 p-3 rounded-2xl border border-white/50">
            <div className="w-12 h-12 rounded-xl bg-white/90 border border-[#F0DADA] flex items-center justify-center shrink-0 shadow-2xs">
              <Heart className="w-5 h-5 text-primary" strokeWidth={1.75} />
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

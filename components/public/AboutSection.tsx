import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Star, Heart } from "lucide-react";

interface AboutSectionProps {
  titulo?: string;
  texto?: string;
  botonTexto?: string;
  metricasClientes?: string;
  metricasCalificacion?: string;
  metricasAnos?: string;
}

export default function AboutSection({
  titulo = "Más que uñas, es bienestar",
  texto = "En Nails Express creemos que el cuidado personal también es una forma de amor propio. Nuestro equipo está comprometido en brindarte una experiencia única, con un servicio de calidad, en un ambiente cómodo y moderno.",
  botonTexto = "Conoce más",
  metricasClientes = "+5,000",
  metricasCalificacion = "4.9",
  metricasAnos = "+3 años",
}: AboutSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
              {titulo}
            </h2>
            <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed">
              {texto}
            </p>
            <div className="pt-2">
              <Link
                href="/nosotros"
                className="btn-primary py-3 px-8 text-sm font-semibold inline-flex shadow-sm hover:shadow-md"
              >
                {botonTexto}
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden shadow-sm border border-[#ECECEC]">
              <Image
                src="/images/salon-interior.jpg"
                alt="Instalaciones de Nails Express"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* 3 Metrics Strip on Blush Pink Background */}
        <div className="bg-[#FBEDED] rounded-[18px] py-8 px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-center border border-[#F5D8D8]">
          {/* Metric 1 */}
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/90 text-[#E8707A] flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
                {metricasClientes}
              </div>
              <div className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                Clientes felices
              </div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="flex items-center justify-center space-x-4 border-y md:border-y-0 md:border-x border-[#F0CDCD] py-4 md:py-0">
            <div className="w-12 h-12 rounded-full bg-white/90 text-[#E8707A] flex items-center justify-center shadow-sm">
              <Star className="w-6 h-6 fill-[#E8707A]/20" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
                {metricasCalificacion}
              </div>
              <div className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                Calificación promedio
              </div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/90 text-[#E8707A] flex items-center justify-center shadow-sm">
              <Heart className="w-6 h-6 fill-[#E8707A]/20" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
                {metricasAnos}
              </div>
              <div className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                Cuidando de ti
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

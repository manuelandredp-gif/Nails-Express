import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Star, Heart } from "lucide-react";
import type { SiteSettings } from "@/lib/site-content";
import AnimatedStat from "@/components/public/AnimatedStat";

interface AboutSectionProps {
  settings: SiteSettings;
}

export default function AboutSection({ settings: s }: AboutSectionProps) {
  const metrics = [
    { Icon: Sparkles, valor: s.metricasClientes, label: s.metricasClientesLabel, fill: false },
    { Icon: Star, valor: s.metricasCalificacion, label: s.metricasCalificacionLabel, fill: true },
    { Icon: Heart, valor: s.metricasAnos, label: s.metricasAnosLabel, fill: true },
  ].filter((m) => m.valor);

  return (
    <section className="py-16 sm:py-20 sec-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
              {s.nosotrosTitulo}
            </h2>
            <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed whitespace-pre-line">
              {s.nosotrosTexto}
            </p>
            {s.nosotrosBoton && (
              <div className="pt-2">
                <Link
                  href="/nosotros"
                  className="btn-primary py-3 px-8 text-sm font-semibold inline-flex shadow-sm hover:shadow-md"
                >
                  {s.nosotrosBoton}
                </Link>
              </div>
            )}
          </div>

          {/* Right Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden shadow-sm border border-[#ECECEC]">
              <Image
                src={s.nosotrosImagen}
                alt={s.nosotrosImagenAlt}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        {metrics.length > 0 && (
          <div className="bg-[#FBEDED] rounded-[18px] py-8 px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-center border border-[#F5D8D8]">
            {metrics.map(({ Icon, valor, label, fill }, i) => (
              <div
                key={i}
                className={`flex items-center justify-center space-x-4 ${
                  i === 1
                    ? "border-y md:border-y-0 md:border-x border-[#F0CDCD] py-4 md:py-0"
                    : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white/90 text-[#E8707A] flex items-center justify-center shadow-sm">
                  <Icon
                    className={`w-6 h-6 ${fill ? "fill-[#E8707A]/20" : ""}`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-left">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]"><AnimatedStat value={valor} /></div>
                  <div className="text-xs sm:text-sm text-[#6B6B6B] font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

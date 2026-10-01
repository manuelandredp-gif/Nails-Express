import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Gem, Clock, Heart } from "lucide-react";
import type { SiteSettings } from "@/lib/site-content";

interface HeroProps {
  settings: SiteSettings;
}

function MultiLine({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

export default function Hero({ settings: s }: HeroProps) {
  const botonTexto = s.heroBoton.replace(/\s*→\s*$/, "");
  const badges = [
    { Icon: Gem, titulo: s.heroBadge1Titulo, texto: s.heroBadge1Texto },
    { Icon: Clock, titulo: s.heroBadge2Titulo, texto: s.heroBadge2Texto },
    { Icon: Heart, titulo: s.heroBadge3Titulo, texto: s.heroBadge3Texto },
  ].filter((b) => b.titulo);

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
      {/* Manchas de color de fondo */}
      <div className="blob blob-rose w-72 h-72 -top-16 -right-10 opacity-40" />
      <div className="blob blob-teal w-64 h-64 top-40 -left-16 opacity-30" />
      <div className="blob blob-peach w-56 h-56 bottom-0 right-1/3 opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Headline & Value Props */}
          <div className="lg:col-span-6 space-y-6">
            {s.heroKicker && (
              <p className="text-xs uppercase font-medium tracking-[0.25em] text-[#8E8E8E]">
                {s.heroKicker}
              </p>
            )}

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.2rem] text-[#1A1A1A] leading-[1.12] tracking-tight">
              {s.heroTitulo}
              {s.heroTituloItalico && (
                <>
                  <br />
                  <span className="italic font-normal text-gradient font-serif">
                    {s.heroTituloItalico}
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-lg">
              <MultiLine text={s.heroSubtitulo} />
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/reservar"
                className="btn-primary text-sm py-3.5 px-8"
              >
                <span>{botonTexto}</span>
                <span>→</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            {badges.length > 0 && (
              <div className="pt-8 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-gray-100">
                {badges.map(({ Icon, titulo, texto }, i) => {
                  const tints = [
                    "bg-[#FBE1E7] text-[#C8455F]",
                    "bg-[#E1F4F1] text-[#0E736A]",
                    "bg-[#F1E7FA] text-[#8E5BC0]",
                  ];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tints[i % 3]}`}>
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <span className="font-bold block text-xs text-[#1A1A1A]">{titulo}</span>
                        <span className="text-[11px] text-gray-500">{texto}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Hero Image with Calligraphy */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[1.15/1] rounded-[28px] overflow-hidden shadow-sm border border-white/60">
              <Image
                src={s.heroImagen}
                alt={s.heroImagenAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
              />

              {s.heroCaligrafia && (
                <div className="absolute bottom-5 right-6 select-none pointer-events-none text-right">
                  <span className="font-script text-3xl sm:text-4xl text-[#5F8E87]/90 block leading-tight rotate-[-3deg] drop-shadow-xs">
                    <MultiLine text={s.heroCaligrafia} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

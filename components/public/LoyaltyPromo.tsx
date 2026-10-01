import React from "react";
import Link from "next/link";
import { Gift, Sparkles, Check } from "lucide-react";

interface LoyaltyPromoProps {
  titulo: string;
  subtitulo: string;
  meta: number;
  premio: string;
  boton: string;
}

/**
 * Banner promocional del programa de sellos en la landing.
 * Muestra la tarjeta visual con la meta de sellos y el premio: es el gancho
 * de fidelización que invita a reservar.
 */
export default function LoyaltyPromo({
  titulo,
  subtitulo,
  meta,
  premio,
  boton,
}: LoyaltyPromoProps) {
  const stamps = Array.from({ length: Math.min(Math.max(meta, 4), 12) });
  // Para la demo visual mostramos algunos sellos "ganados"
  const demoGanados = Math.max(2, Math.floor(stamps.length / 3));

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDE7EE] via-[#FDF2F6] to-[#E9F7F5]" />
      <div className="blob blob-rose w-72 h-72 -top-20 -left-16 opacity-50" />
      <div className="blob blob-teal w-64 h-64 -bottom-16 -right-10 opacity-40" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Texto vendedor */}
          <div className="space-y-5 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-bold text-[#C8455F] bg-white/70 border border-[#F3A6BC]/40 rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Programa de fidelidad
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.8rem] text-[#1A1A1A] leading-tight">
              {titulo}
            </h2>

            <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-md mx-auto lg:mx-0">
              {subtitulo}
            </p>

            <ul className="space-y-2 text-sm text-[#444] max-w-md mx-auto lg:mx-0 text-left">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0E736A] mt-0.5 shrink-0" />
                <span>
                  Cada visita suma <strong>1 sello automáticamente</strong>, sin apps ni tarjetas de papel.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0E736A] mt-0.5 shrink-0" />
                <span>
                  Al juntar <strong>{meta} sellos</strong> ganas: <strong>{premio}</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0E736A] mt-0.5 shrink-0" />
                <span>
                  Consulta tus sellos cuando quieras en <strong>“Mis citas”</strong> con tu celular.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/reservar" className="btn-primary text-sm py-3.5 px-8">
                <span>{boton}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Tarjeta visual */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-white/90 backdrop-blur rounded-[24px] border border-[#F3A6BC]/30 shadow-lg p-6 rotate-[1.5deg] hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#9B8890] font-bold">
                    Nails Express
                  </p>
                  <p className="font-serif text-lg text-[#1A1A1A]">Tarjeta de sellos</p>
                </div>
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E26D9A] to-[#C64E7E] text-white flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {stamps.map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-full flex items-center justify-center text-base font-bold border-2 ${
                      i < demoGanados
                        ? "bg-gradient-to-br from-[#F3A6BC] to-[#E26D9A] border-transparent text-white shadow-sm"
                        : "border-dashed border-[#E6D3DA] text-[#D8C3CB]"
                    }`}
                  >
                    {i < demoGanados ? "💅" : i + 1}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[#FDF2F6] border border-[#F3A6BC]/30 text-center">
                <p className="text-[11px] text-[#9B8890] font-semibold uppercase tracking-wide">
                  Tu premio
                </p>
                <p className="text-sm font-bold text-[#C8455F]">{premio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

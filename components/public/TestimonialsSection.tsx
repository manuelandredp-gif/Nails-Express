import React from "react";
import { Star, Quote } from "lucide-react";

export interface TestimonialItem {
  id: string;
  nombre: string;
  texto: string;
  avatar?: string | null;
  estrellas: number;
  servicio?: string | null;
}

const AVATAR_TINTS = [
  "bg-[#9FE0D9] text-white",
  "bg-[#5CC6BF] text-white",
  "bg-[#9FE0D9] text-white",
  "bg-[#E8B96B] text-white",
];

export default function TestimonialsSection({
  testimonios,
  titulo,
  subtitulo,
}: {
  testimonios: TestimonialItem[];
  titulo: string;
  subtitulo: string;
}) {
  if (!testimonios.length) return null;
  return (
    <section className="py-16 sm:py-20 sec-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">{titulo}</h2>
          <p className="mt-3 text-base text-[#6B6B6B]">{subtitulo}</p>
          <div className="rule-gold mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonios.map((t, i) => (
            <div
              key={t.id}
              className="card-lift relative bg-white rounded-[20px] border border-[#CFEDEA] p-5 shadow-2xs flex flex-col"
            >
              <Quote className="w-7 h-7 text-[#9FE0D9] mb-2" />
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s < t.estrellas ? "fill-[#E8B96B] text-[#E8B96B]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-[#4A4A4A] leading-relaxed flex-1">“{t.texto}”</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E6F6F4]">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar} alt={t.nombre} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${AVATAR_TINTS[i % AVATAR_TINTS.length]}`}>
                    {t.nombre.charAt(0)}
                  </div>
                )}
                <div className="leading-tight">
                  <div className="text-sm font-bold text-[#1A1A1A]">{t.nombre}</div>
                  {t.servicio && <div className="text-[0.7rem] text-[#6B6B6B]">{t.servicio}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

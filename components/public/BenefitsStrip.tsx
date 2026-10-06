import React from "react";
import { Sparkles, Gem, Heart, Clock, Star, ShieldCheck } from "lucide-react";

const ICONS = [Sparkles, Gem, Heart, Clock, Star, ShieldCheck];
const TINTS = [
  "bg-[#E6F6F4] text-[#2AA79C]",
  "bg-[#E1F4F1] text-[#0E736A]",
  "bg-[#E6F6F4] text-[#3EA59E]",
  "bg-[#FBEFD9] text-[#B98F3E]",
  "bg-[#F8F5F0] text-[#C56A3A]",
  "bg-[#E7ECFB] text-[#4E63C4]",
];

export default function BenefitsStrip({
  items,
}: {
  items: { titulo: string; texto: string }[];
}) {
  if (!items.length) return null;
  return (
    <section className="py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {items.slice(0, 4).map((b, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className="card-lift bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-4 sm:p-5 shadow-2xs flex items-start gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TINTS[i % TINTS.length]}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1A1A1A] leading-tight">{b.titulo}</div>
                  <div className="text-xs text-[#6B6B6B] mt-0.5 leading-snug">{b.texto}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

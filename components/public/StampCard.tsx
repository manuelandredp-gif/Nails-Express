"use client";

import React from "react";
import { Gift, Sparkles } from "lucide-react";

export interface LoyaltyData {
  activo: boolean;
  sellos: number;
  meta: number;
  premio: string;
  titulo: string;
  subtitulo: string;
  sellosTotal?: number;
  nivel?: string;
  rewards: { codigo: string; premio: string; expiraEn: string | null }[];
}

function PolishStamp({ filled, index }: { filled: boolean; index: number }) {
  if (!filled) {
    return (
      <div className="aspect-square rounded-2xl border-[1.5px] border-dashed border-[#CFEDEA] bg-[#F0FAF9]/60 flex items-center justify-center">
        <span className="text-sm font-bold text-[#BBBBBB] tabular-nums">{index + 1}</span>
      </div>
    );
  }
  return (
    <div
      className="aspect-square rounded-2xl border-[1.5px] border-[#3EA59E]/40 bg-gradient-to-br from-[#9FE0D9] to-[#E6F6F4] flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.5)]"
      style={{ animation: `pop-in 0.45s cubic-bezier(0.2,1.4,0.4,1) ${index * 70}ms both` }}
    >
      <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none">
        <rect x="10" y="2.5" width="4" height="3.2" rx="1" fill="#2AA79C" />
        <path
          d="M8.4 7.2c0-.66.54-1.2 1.2-1.2h4.8c.66 0 1.2.54 1.2 1.2v12.4c0 .77-.63 1.4-1.4 1.4H9.8c-.77 0-1.4-.63-1.4-1.4V7.2z"
          fill="#46B8B0"
        />
        <path
          d="M8.4 10.4h7.2v6.2c0 .5-.4.9-.9.9H9.3c-.5 0-.9-.4-.9-.9v-6.2z"
          fill="#fff"
          opacity="0.28"
        />
        <circle cx="12" cy="9" r="1.15" fill="#fff" opacity="0.9" />
      </svg>
    </div>
  );
}

export default function StampCard({ loyalty }: { loyalty: LoyaltyData }) {
  if (!loyalty || !loyalty.activo) return null;

  const { sellos, meta, premio, titulo, subtitulo, rewards, nivel } = loyalty;
  const cols = meta > 8 ? "grid-cols-5" : "grid-cols-4";
  const faltan = Math.max(0, meta - sellos);
  const pct = Math.min(100, Math.round((sellos / meta) * 100));
  const NIVEL_STYLE: Record<string, string> = {
    Nueva: "bg-[#EDEFF2] text-[#6B7280]",
    Bronce: "bg-[#F8F5F0] text-[#A9723C]",
    Plata: "bg-[#E9ECF1] text-[#7A8699]",
    Oro: "bg-[#F8EFD9] text-[#B98F3E]",
  };

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="relative overflow-hidden rounded-[26px] border border-[#CFEDEA] bg-[radial-gradient(130%_100%_at_80%_-10%,#E6F6F4,transparent_55%),radial-gradient(120%_90%_at_10%_110%,#E6F6F4,transparent_60%),#FFFFFF] p-6 shadow-sm">
        <div className="absolute -bottom-16 -right-10 w-40 h-40 rounded-full bg-[#9FE0D9]/35 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] text-[#8E8E8E] tracking-wide">Tarjeta de sellos</span>
              {nivel && nivel !== "Nueva" && (
                <span className={`text-[0.6rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${NIVEL_STYLE[nivel] || NIVEL_STYLE.Nueva}`}>
                  ★ {nivel}
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] leading-tight">{titulo}</h3>
          </div>
          <span className="text-[0.66rem] font-bold uppercase tracking-wide text-[#2AA79C] bg-[#E6F6F4] border border-[#3EA59E]/30 px-2.5 py-1 rounded-full whitespace-nowrap">
            {sellos} de {meta}
          </span>
        </div>

        <p className="relative z-10 text-xs text-[#6B6B6B] mt-1">{subtitulo}</p>

        {/* Barra de progreso */}
        <div className="relative z-10 mt-3">
          <div className="h-2 rounded-full bg-[#E6F6F4] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9FE0D9] to-[#46B8B0] transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[0.7rem] text-[#6B6B6B] mt-1.5 font-medium">
            {faltan === 0
              ? "¡Completaste tu tarjeta! 🎉"
              : `Te ${faltan === 1 ? "falta" : "faltan"} ${faltan} para tu premio`}
          </p>
        </div>

        <div className={`relative z-10 grid ${cols} gap-3 mt-4`}>
          {Array.from({ length: meta }).map((_, i) => (
            <PolishStamp key={i} filled={i < sellos} index={i} />
          ))}
        </div>

        <div className="relative z-10 mt-4 pt-3 border-t border-dashed border-[#CFEDEA] flex items-center gap-2 text-sm text-[#6B6B6B]">
          <Gift className="w-4 h-4 text-[#C79A4E] shrink-0" />
          <span>
            Premio al completar: <b className="text-[#1A1A1A] font-semibold">{premio}</b>
          </span>
        </div>

        {rewards.length > 0 && (
          <div className="relative z-10 mt-4 space-y-2">
            {rewards.map((r) => (
              <div
                key={r.codigo}
                className="rounded-2xl bg-[#F8EFD9] border border-[#C79A4E] px-4 py-3 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-[#B98F3E] font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>¡Tienes un premio disponible!</span>
                </div>
                <div className="mt-1 text-xs text-[#6B6B6B]">{r.premio}</div>
                <div className="mt-2 inline-block font-mono font-bold tracking-[0.12em] text-[#1A1A1A] bg-white border border-dashed border-[#C79A4E] rounded-lg px-3 py-1.5">
                  {r.codigo}
                </div>
                <div className="mt-2 text-[0.7rem] text-[#8E8E8E]">
                  Muestra este código en el salón para canjearlo.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

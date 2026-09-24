"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

interface PopularColorsPickerProps {
  colors: string[];
  serviceSlug: string;
}

export default function PopularColorsPicker({
  colors,
  serviceSlug,
}: PopularColorsPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null);

  return (
    <div className="mt-14 pt-8 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              Colores populares & esmaltes en tendencia
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-[#E6F6F4] px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Colección 2026
            </span>
          </div>
          <p className="text-xs text-[#8E8E8E] mt-0.5">
            Selecciona un tono para inspirar tu diseño en salón o pre-seleccionarlo para tu cita.
          </p>
        </div>

        {selectedColor && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B6B6B]">
              Tono: <strong className="font-mono text-[#1A1A1A]">{selectedColor}</strong>
            </span>
            <Link
              href={`/reservar?service=${serviceSlug}&color=${encodeURIComponent(selectedColor)}`}
              className="text-xs font-bold text-primary hover:text-primary-dark underline"
            >
              Reservar con este tono →
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        {colors.map((colorHex, i) => {
          const isSelected = selectedColor === colorHex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedColor(colorHex)}
              className={`group relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                isSelected
                  ? "ring-4 ring-primary ring-offset-2 scale-110 shadow-md"
                  : "hover:scale-105 border border-black/10 shadow-2xs hover:shadow-sm"
              }`}
              style={{ backgroundColor: colorHex }}
              title={`Tono ${colorHex}`}
              aria-label={`Seleccionar tono ${colorHex}`}
            >
              {isSelected && (
                <Check
                  className="w-4 h-4 stroke-[3] drop-shadow-sm text-white"
                  style={{
                    filter:
                      colorHex.toLowerCase() === "#ffffff" ||
                      colorHex.toLowerCase() === "#fdfbf7" ||
                      colorHex.toLowerCase() === "#fff0f5"
                        ? "invert(1)"
                        : "none",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

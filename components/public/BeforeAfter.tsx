"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";

export default function BeforeAfter({
  antes,
  despues,
  titulo,
}: {
  antes: string;
  despues: string;
  titulo: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight text-center mb-8">
          {titulo}
        </h2>
        <div
          ref={ref}
          className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden shadow-sm border border-[#CFEDEA] select-none cursor-ew-resize"
          onMouseDown={(e) => {
            dragging.current = true;
            move(e.clientX);
          }}
          onMouseMove={(e) => dragging.current && move(e.clientX)}
          onMouseUp={() => (dragging.current = false)}
          onMouseLeave={() => (dragging.current = false)}
          onTouchStart={(e) => move(e.touches[0].clientX)}
          onTouchMove={(e) => move(e.touches[0].clientX)}
        >
          {/* Después (fondo) */}
          <Image src={despues} alt="Después" fill sizes="(max-width:768px) 100vw, 800px" className="object-cover" />
          <span className="absolute bottom-3 right-3 text-[0.7rem] font-bold text-white bg-[#46B8B0] px-2.5 py-1 rounded-full z-10">
            Después
          </span>
          {/* Antes (recortado) */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
            <div className="relative h-full" style={{ width: ref.current?.clientWidth || "100%" }}>
              <Image src={antes} alt="Antes" fill sizes="(max-width:768px) 100vw, 800px" className="object-cover" />
            </div>
            <span className="absolute bottom-3 left-3 text-[0.7rem] font-bold text-[#1A1A1A] bg-white/90 px-2.5 py-1 rounded-full z-10">
              Antes
            </span>
          </div>
          {/* Divisor */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-20" style={{ left: `${pos}%` }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-[#46B8B0] font-bold">
              ⇄
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-[#6B6B6B] mt-3">Deslizá para ver la transformación</p>
      </div>
    </section>
  );
}

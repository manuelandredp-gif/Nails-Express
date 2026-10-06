"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";

type Foto = { imagen: string; altText: string };

export default function InstagramStrip({
  fotos,
  usuario,
  url,
}: {
  fotos: Foto[];
  usuario: string;
  url: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Auto-scroll continuo y suave. Se pausa al pasar el mouse/tocar y
  // se desactiva si el usuario prefiere menos movimiento.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (fotos.length <= 3) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let pausado = false;
    const velocidad = 0.4; // px por frame

    const paso = () => {
      if (!pausado && track) {
        track.scrollLeft += velocidad;
        // La lista está duplicada: al pasar la mitad, volvemos al inicio sin salto.
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft -= track.scrollWidth / 2;
        }
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    const onEnter = () => (pausado = true);
    const onLeave = () => (pausado = false);
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);
    track.addEventListener("touchstart", onEnter, { passive: true });
    track.addEventListener("touchend", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      track.removeEventListener("touchstart", onEnter);
      track.removeEventListener("touchend", onLeave);
    };
  }, [fotos.length]);

  if (!fotos.length) return null;

  // Duplicamos para un bucle continuo cuando hay suficientes fotos.
  const loop = fotos.length > 3 ? [...fotos, ...fotos] : fotos;

  return (
    <section className="py-16 sm:py-20 sec-mint overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#2AA79C]">
            <Instagram className="w-5 h-5" />
            <span>Síguenos en Instagram</span>
          </div>
          <a
            href={url || "#"}
            target="_blank"
            rel="noreferrer"
            className="block text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] mt-1 hover:text-primary transition-colors"
          >
            {usuario}
          </a>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 no-scrollbar snap-x"
        style={{ scrollbarWidth: "none" }}
      >
        {loop.map((f, i) => (
          <a
            key={i}
            href={url || "#"}
            target="_blank"
            rel="noreferrer"
            aria-label="Ver en Instagram"
            className="group relative shrink-0 w-40 sm:w-48 aspect-square rounded-2xl overflow-hidden bg-gray-100 snap-start"
          >
            <Image
              src={f.imagen}
              alt={f.altText}
              fill
              sizes="200px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2AA79C]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
              <Instagram className="w-5 h-5 text-white" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

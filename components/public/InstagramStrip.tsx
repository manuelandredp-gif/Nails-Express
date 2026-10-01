import React from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";

export default function InstagramStrip({
  fotos,
  usuario,
  url,
}: {
  fotos: { imagen: string; altText: string }[];
  usuario: string;
  url: string;
}) {
  if (!fotos.length) return null;
  const items = fotos.slice(0, 6);
  return (
    <section className="py-16 sm:py-20 sec-mint">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#C8455F]">
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

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
          {items.map((f, i) => (
            <a
              key={i}
              href={url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
            >
              <Image
                src={f.imagen}
                alt={f.altText}
                fill
                sizes="(max-width: 768px) 33vw, 180px"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#E86B86]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                <Instagram className="w-5 h-5 text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

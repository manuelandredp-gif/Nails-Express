import React from "react";
import Link from "next/link";
import type { ColorTemporada, AcabadoColor } from "@/lib/site-content";

/**
 * Genera el estilo del círculo según el acabado del esmalte.
 * Todo es CSS (degradados y brillos), sin imágenes ni dependencias.
 */
function estiloAcabado(hex: string, acabado: AcabadoColor): React.CSSProperties {
  switch (acabado) {
    case "satinado":
      // Brillo suave y sedoso: luz difusa arriba-izquierda.
      return {
        background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%), ${hex}`,
        boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
      };
    case "ojo-de-gato":
      // Franja de luz diagonal tipo gel magnético "cat eye".
      return {
        background: `linear-gradient(115deg, rgba(0,0,0,0.28) 0%, ${hex} 38%, rgba(255,255,255,0.9) 50%, ${hex} 62%, rgba(0,0,0,0.28) 100%)`,
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.12)",
      };
    case "mate":
      // Sin brillo: superficie plana y aterciopelada.
      return {
        background: hex,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
        filter: "saturate(0.92) brightness(0.98)",
      };
    default:
      // Normal: un brillo puntual discreto (como el diseño original).
      return {
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%), ${hex}`,
      };
  }
}

const ETIQUETA_ACABADO: Record<AcabadoColor, string> = {
  normal: "",
  satinado: "Satinado",
  "ojo-de-gato": "Ojo de gato",
  mate: "Mate",
};

export default function SeasonColors({
  colores,
  titulo,
  subtitulo,
}: {
  colores: ColorTemporada[];
  titulo: string;
  subtitulo: string;
}) {
  if (!colores.length) return null;
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">{titulo}</h2>
          <p className="mt-3 text-base text-[#6B6B6B]">{subtitulo}</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-5">
          {colores.map((c, i) => {
            const etiqueta = ETIQUETA_ACABADO[c.acabado];
            const glossy = c.acabado === "satinado" || c.acabado === "ojo-de-gato";
            return (
              <div key={i} className="flex flex-col items-center gap-2 group">
                <div
                  className={`relative overflow-hidden w-full aspect-square rounded-full shadow-sm border border-black/5 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md ${
                    glossy ? "color-sheen" : ""
                  }`}
                  style={estiloAcabado(c.hex, c.acabado)}
                  title={etiqueta ? `${c.nombre} · ${etiqueta}` : c.nombre}
                />
                <span className="text-[0.7rem] font-medium text-[#6B6B6B] text-center leading-tight">
                  {c.nombre}
                  {etiqueta && (
                    <span className="block text-[0.6rem] uppercase tracking-wide text-[#2AA79C]/80">
                      {etiqueta}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/reservar" className="btn-rose text-sm py-3 px-7">
            Reservar mi color favorito →
          </Link>
        </div>
      </div>
    </section>
  );
}

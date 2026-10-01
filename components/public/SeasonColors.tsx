import React from "react";
import Link from "next/link";

export default function SeasonColors({
  colores,
  titulo,
  subtitulo,
}: {
  colores: { nombre: string; hex: string }[];
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
          {colores.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group">
              <div
                className="w-full aspect-square rounded-full shadow-sm border border-black/5 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
                style={{ backgroundColor: c.hex }}
                title={c.nombre}
              />
              <span className="text-[0.7rem] font-medium text-[#6B6B6B] text-center leading-tight">
                {c.nombre}
              </span>
            </div>
          ))}
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

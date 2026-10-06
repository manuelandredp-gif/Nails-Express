import React from "react";
import Link from "next/link";
import { MessageCircle, CalendarCheck } from "lucide-react";
import { whatsappLink } from "@/lib/site-content";

interface CtaBannerProps {
  titulo: string;
  subtitulo: string;
  boton: string;
  whatsapp?: string | null;
  whatsappMensaje?: string | null;
}

/** Llamado a la acción final de la landing: el último empujón para reservar. */
export default function CtaBanner({
  titulo,
  subtitulo,
  boton,
  whatsapp,
  whatsappMensaje,
}: CtaBannerProps) {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3EA59E] via-[#3EA59E] to-[#5CC6BF] px-6 py-12 sm:px-12 sm:py-14 text-center shadow-lg">
          {/* brillos decorativos */}
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-52 h-52 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
              {titulo}
            </h2>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto">
              {subtitulo}
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/reservar"
                className="inline-flex items-center gap-2 bg-white text-[#2AA79C] font-bold text-sm py-3.5 px-8 rounded-full shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                {boton}
              </Link>
              {whatsapp && (
                <a
                  href={whatsappLink(whatsapp, whatsappMensaje || "Hola! Quiero reservar una cita 💅")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold py-3.5 px-7 rounded-full border-2 border-white/60 text-white hover:bg-white/15 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escríbenos
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

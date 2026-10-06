import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Hand, Footprints, Palette, Gem, Sparkles, Flower2, Star } from "lucide-react";

export interface ServiceItem {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  precioDesde: boolean;
  categoria?: string;
  descripcionCorta?: string;
  duracionMinutos?: number;
  imagenPrincipal: string;
  destacado?: boolean;
  createdAt?: string | Date;
  category?: { nombre: string };
}

interface ServiceCardProps {
  service: ServiceItem;
  currency?: string;
}

/** Elige un icono ilustrativo según la categoría o el nombre del servicio (#17). */
function iconoServicio(nombre: string, categoria?: string) {
  const t = `${categoria || ""} ${nombre}`.toLowerCase();
  if (t.includes("pedicure") || t.includes("pies") || t.includes("pie")) return Footprints;
  if (t.includes("manicure") || t.includes("manos") || t.includes("mano")) return Hand;
  if (t.includes("diseñ") || t.includes("nail art") || t.includes("arte")) return Palette;
  if (t.includes("gel") || t.includes("acríl") || t.includes("acril")) return Gem;
  if (t.includes("spa") || t.includes("temporada") || t.includes("flor")) return Flower2;
  return Sparkles;
}

function esNuevo(createdAt?: string | Date) {
  if (!createdAt) return false;
  const d = new Date(createdAt).getTime();
  if (Number.isNaN(d)) return false;
  const dias = (Date.now() - d) / (1000 * 60 * 60 * 24);
  return dias >= 0 && dias <= 30;
}

export default function ServiceCard({ service, currency = "S/" }: ServiceCardProps) {
  const formattedPrice = `${currency} ${service.precio.toFixed(0)}`;
  const displayPrice = service.precioDesde ? `Desde ${formattedPrice}` : formattedPrice;

  const Icono = iconoServicio(service.nombre, service.categoria || service.category?.nombre);
  const nuevo = esNuevo(service.createdAt);

  return (
    <div className="bg-white rounded-[16px] border border-[#ECECEC] p-4 flex flex-col justify-between hover:shadow-hover transition-all duration-300 group">
      <div>
        {/* Service Image with zoom on hover */}
        <Link
          href={`/servicios/${service.slug}`}
          className="block relative w-full aspect-[16/10] rounded-[12px] overflow-hidden mb-4 bg-gray-100"
        >
          <Image
            src={service.imagenPrincipal}
            alt={service.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges "Más pedido" / "Nuevo" (#18) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {service.destacado && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white shadow-sm">
                <Star className="w-3 h-3 fill-current" />
                Más pedido
              </span>
            )}
            {nuevo && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-[#2AA79C] text-white shadow-sm">
                Nuevo
              </span>
            )}
          </div>
        </Link>

        {/* Title con icono de categoría (#17) */}
        <Link href={`/servicios/${service.slug}`} className="flex items-start gap-2">
          <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-[#E6F6F4] text-[#2AA79C] flex items-center justify-center group-hover:bg-[#2AA79C] group-hover:text-white transition-colors">
            <Icono className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] group-hover:text-primary transition-colors">
            {service.nombre}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-1 mb-4 pl-9">
          <span className="text-[#3EA59E] font-bold text-base sm:text-lg">{displayPrice}</span>
        </div>
      </div>

      {/* Action Button */}
      <div>
        <Link
          href={`/reservar?service=${service.slug}`}
          className="w-full btn-blush text-center justify-center text-sm font-semibold py-2.5 rounded-btn hover:bg-[#CFEDEA] transition-colors block"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}

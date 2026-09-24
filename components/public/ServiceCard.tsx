import React from "react";
import Link from "next/link";
import Image from "next/image";

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
}

interface ServiceCardProps {
  service: ServiceItem;
  currency?: string;
}

export default function ServiceCard({ service, currency = "S/" }: ServiceCardProps) {
  const formattedPrice = `${currency} ${service.precio.toFixed(0)}`;
  const displayPrice = service.precioDesde ? `Desde ${formattedPrice}` : formattedPrice;

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
        </Link>

        {/* Title */}
        <Link href={`/servicios/${service.slug}`}>
          <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] group-hover:text-primary transition-colors">
            {service.nombre}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-1 mb-4">
          <span className="text-[#E8707A] font-bold text-base sm:text-lg">
            {displayPrice}
          </span>
        </div>
      </div>

      {/* Action Button: Soft blush pill button */}
      <div>
        <Link
          href={`/reservar?service=${service.slug}`}
          className="w-full btn-blush text-center justify-center text-sm font-semibold py-2.5 rounded-btn hover:bg-[#F5D0D0] transition-colors block"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}

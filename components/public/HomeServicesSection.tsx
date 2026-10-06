"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Sparkles, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";

interface ServiceItem {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  precioDesde?: boolean;
  imagenPrincipal: string;
}

interface HomeServicesSectionProps {
  services: ServiceItem[];
  currency?: string;
  titulo?: string;
  subtitulo?: string;
  botonTodos?: string;
  reservaTitulo?: string;
  reservaSubtitulo?: string;
  reservaBoton?: string;
}

export default function HomeServicesSection({
  services,
  currency = "S/",
  titulo = "Nuestros servicios",
  subtitulo = "Belleza y cuidado en cada detalle.",
  botonTodos = "Ver todos",
  reservaTitulo = "Reserva tu cita",
  reservaSubtitulo = "Es rápido y sencillo",
  reservaBoton = "Continuar",
}: HomeServicesSectionProps) {
  const router = useRouter();

  // Floating Quick Booking Card state
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTime, setSelectedTime] = useState("10:00");

  const handleContinueBooking = () => {
    router.push(`/reservar?date=${selectedDate}&time=${selectedTime}`);
  };

  // Cupos disponibles para hoy (#24) — usa un servicio de referencia y la API real.
  const [cuposHoy, setCuposHoy] = useState<number | null>(null);
  useEffect(() => {
    const refId = services[0]?.id;
    if (!refId) return;
    const hoy = format(new Date(), "yyyy-MM-dd");
    let activo = true;
    fetch(`/api/availability?serviceId=${refId}&date=${hoy}`)
      .then((r) => r.json())
      .then((d) => {
        if (!activo) return;
        const libres = Array.isArray(d.slots)
          ? d.slots.filter((s: { available: boolean }) => s.available).length
          : 0;
        setCuposHoy(libres);
      })
      .catch(() => activo && setCuposHoy(null));
    return () => {
      activo = false;
    };
  }, [services]);

  // 5 services matching mockup
  const displayServices = services.slice(0, 5);

  return (
    <section className="py-12 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 pb-2">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              {titulo}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B6B6B]">
              {subtitulo}
            </p>
          </div>

          <Link
            href="/servicios"
            className="border border-gray-200 hover:border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>{botonTodos}</span>
            <span>→</span>
          </Link>
        </div>

        {/* Grid: 5 Services Cards (Cols 1-8) + Floating Booking Box (Cols 9-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 5 Service Cards Carousel / Row */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {displayServices.map((srv) => (
              <Link
                key={srv.id}
                href={`/servicios/${srv.slug}`}
                className="group card-lift bg-white rounded-[18px] border border-gray-100 p-2.5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden bg-gray-100 mb-2.5">
                    <Image
                      src={srv.imagenPrincipal}
                      alt={srv.nombre}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-[#1A1A1A] line-clamp-2 leading-tight">
                    {srv.nombre}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-3 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500">
                    Desde {currency} {srv.precio.toFixed(0)}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#E6F6F4] text-[#3EA59E] flex items-center justify-center shrink-0 group-hover:bg-[#3EA59E] group-hover:text-white transition-colors">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Floating Booking Box ("Reserva tu cita") */}
          <div className="lg:col-span-4 relative">
            <div className="bg-[#F8FAF9]/80 backdrop-blur-md rounded-[24px] border border-gray-100 p-6 shadow-sm relative overflow-hidden space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    {reservaTitulo}
                  </h3>
                  <p className="text-xs text-[#8E8E8E] mt-0.5">
                    {reservaSubtitulo}
                  </p>
                </div>
                <div className="w-6 h-6 text-primary">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Cupos disponibles hoy (#24) */}
              {cuposHoy !== null && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F6F4] px-3 py-1 text-[11px] font-semibold text-[#2AA79C]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#5CC6BF] opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2AA79C]" />
                  </span>
                  {cuposHoy > 0
                    ? `${cuposHoy} ${cuposHoy === 1 ? "cupo disponible" : "cupos disponibles"} hoy`
                    : "Agenda abierta para los próximos días"}
                </div>
              )}

              {/* Form Controls */}
              <div className="space-y-3 pt-1">
                {/* Date Dropdown */}
                <div className="relative">
                  <div className="w-full bg-white border border-gray-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-700 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                      />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Time Dropdown */}
                <div className="relative">
                  <div className="w-full bg-white border border-gray-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-700 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="bg-transparent outline-none text-xs font-semibold text-gray-700 cursor-pointer w-full pr-4"
                      >
                        <option value="09:00">09:00 hrs</option>
                        <option value="10:00">10:00 hrs</option>
                        <option value="11:30">11:30 hrs</option>
                        <option value="14:00">14:00 hrs</option>
                        <option value="15:30">15:30 hrs</option>
                        <option value="17:00">17:00 hrs</option>
                        <option value="18:30">18:30 hrs</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleContinueBooking}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl inline-flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-101"
                >
                  <span>{reservaBoton}</span>
                  <span>→</span>
                </button>
              </div>

              {/* Decorative soft petal in corner */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-[#E6F6F4]/60 blur-lg pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

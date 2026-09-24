import React from "react";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Scissors,
  MapPin,
  CalendarPlus,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmación de Cita",
  description: "Detalle y confirmación de tu cita en Nails Express.",
};

export default async function ConfirmacionPage({
  params,
}: {
  params: { code: string };
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { codigo: params.code.toUpperCase() },
    include: {
      customer: true,
      service: true,
      staff: true,
    },
  });

  if (!appointment) {
    notFound();
  }

  const start = new Date(appointment.startAt)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(appointment.endAt)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "");
  const gcalTitle = encodeURIComponent(
    `Cita Nails Express: ${appointment.service.nombre}`
  );
  const gcalDetails = encodeURIComponent(
    `Código de reserva: ${appointment.codigo}\nManicurista: ${appointment.staff.nombre}`
  );
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${start}/${end}&details=${gcalDetails}&location=${encodeURIComponent(
    "Av. San Martín 456, Tacna, Perú"
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center space-y-8">
      {/* Calendar Check Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E6F6F4] text-primary mx-auto mb-2 border border-[#C5EDE8]">
        <CalendarIcon className="w-10 h-10" strokeWidth={1.5} />
      </div>

      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
          ¡Cita confirmada!
        </h1>
        <p className="mt-2 text-base text-[#6B6B6B]">
          Tu cita ha sido reservada con éxito. Código:{" "}
          <strong className="text-primary font-bold">{appointment.codigo}</strong>
        </p>
      </div>

      {/* Blush Pink 3-Column Strip (Matching Image 06 exactly) */}
      <div className="bg-[#FBEDED] rounded-[18px] p-6 sm:p-8 border border-[#F5D8D8] grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-center">
        {/* Column 1: Date & Time */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs">
            <CalendarIcon className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A] capitalize">
              {format(new Date(appointment.startAt), "EEEE d 'de' MMMM", {
                locale: es,
              })}
            </p>
            <p className="text-xs text-[#6B6B6B]">
              {format(new Date(appointment.startAt), "HH:mm")} hrs
            </p>
          </div>
        </div>

        {/* Column 2: Service & Price */}
        <div className="flex items-center space-x-3.5 border-y md:border-y-0 md:border-x border-[#F0D0D0] py-4 md:py-0 md:px-4">
          <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs">
            <Scissors className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A]">
              {appointment.service.nombre}
            </p>
            <p className="text-xs text-[#E8707A] font-semibold">
              S/ {appointment.precio.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Column 3: Location */}
        <div className="flex items-center space-x-3.5 md:pl-2">
          <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A]">Nails Express</p>
            <p className="text-xs text-[#6B6B6B]">Av. San Martín 456, Tacna</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary py-3 px-8 text-sm font-semibold inline-flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Agregar a Google Calendar</span>
        </a>

        <Link
          href={`/mis-citas?code=${appointment.codigo}&phone=${appointment.customer.celular}`}
          className="btn-outline py-3 px-8 text-sm font-semibold inline-flex items-center gap-2"
        >
          <span>Ver mis citas</span>
        </Link>
      </div>

      <div className="pt-2">
        <a
          href={`https://wa.me/51952123456?text=${encodeURIComponent(
            `¡Hola Nails Express! Cita confirmada para ${appointment.service.nombre} (Código: ${appointment.codigo}).`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-xs text-[#6B6B6B] hover:text-primary transition-colors gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5 text-primary" />
          <span>Contactar al estudio por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

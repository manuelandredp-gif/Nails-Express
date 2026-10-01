import React, { Suspense } from "react";
import { prisma } from "@/lib/db";
import BookingWizard from "@/components/public/BookingWizard";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Cita en Línea",
  description:
    "Reserva tu cita en Nails Express Tacna en 4 sencillos pasos con disponibilidad en tiempo real.",
};

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  const [services, staffList, settings] = await Promise.all([
    prisma.service.findMany({
      where: { activo: true },
      select: {
        id: true,
        slug: true,
        nombre: true,
        descripcionCorta: true,
        imagenPrincipal: true,
        precio: true,
        duracionMinutos: true,
        category: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { orden: "asc" },
    }),
    prisma.staff.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        color: true,
        activo: true,
      },
      orderBy: { orden: "asc" },
    }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);

  return (
    <div className="min-h-[80vh] bg-white">
      <Suspense
        fallback={
          <div className="py-24 flex flex-col justify-center items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <span className="text-xs text-gray-500">Cargando reserva...</span>
          </div>
        }
      >
        <BookingWizard
          services={services}
          staffList={staffList}
          currency={settings?.moneda || "S/"}
          preselectedSlug={searchParams.service}
          nombreNegocio={settings?.nombreNegocio}
          direccion={settings?.direccion}
          whatsapp={settings?.whatsapp}
        />
      </Suspense>
    </div>
  );
}

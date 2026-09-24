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
  const services = await prisma.service.findMany({
    where: { activo: true },
    select: {
      id: true,
      slug: true,
      nombre: true,
      precio: true,
      precioDesde: true,
      duracionMinutos: true,
      category: {
        select: { nombre: true },
      },
    },
    orderBy: { orden: "asc" },
  });

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
          preselectedSlug={searchParams.service}
        />
      </Suspense>
    </div>
  );
}

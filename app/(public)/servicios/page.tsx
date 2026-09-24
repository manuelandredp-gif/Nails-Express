import React from "react";
import { prisma } from "@/lib/db";
import ServicesCatalog from "@/components/public/ServicesCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuestros Servicios",
  description:
    "Catálogo completo de manicura, pedicura, nail art y tratamientos spa en Nails Express Tacna.",
};

export const revalidate = 60;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { activo: true },
      include: { category: true },
      orderBy: { orden: "asc" },
    }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);

  return (
    <ServicesCatalog
      initialServices={services}
      currency={settings?.moneda || "S/"}
      defaultCategory={searchParams.categoria || "todos"}
    />
  );
}

import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-content";
import ServicesCatalog from "@/components/public/ServicesCatalog";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: s.serviciosTitulo, description: s.serviciosSubtitulo };
}

export const revalidate = 60;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const [services, settings, categorias] = await Promise.all([
    prisma.service.findMany({
      where: { activo: true },
      include: { category: true },
      orderBy: { orden: "asc" },
    }),
    getSiteSettings(),
    prisma.serviceCategory.findMany({
      orderBy: { orden: "asc" },
      select: { nombre: true, slug: true },
    }),
  ]);

  return (
    <ServicesCatalog
      initialServices={services}
      currency={settings.moneda}
      defaultCategory={searchParams.categoria || "todos"}
      categorias={categorias}
      titulo={settings.serviciosTitulo}
      subtitulo={settings.serviciosSubtitulo}
    />
  );
}

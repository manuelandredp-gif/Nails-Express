import React from "react";
import { prisma } from "@/lib/db";
import AboutSection from "@/components/public/AboutSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description:
    "Más que uñas, es bienestar. Conoce la historia, el equipo y la filosofía de cuidado de Nails Express Tacna.",
};

export const revalidate = 60;

export default async function NosotrosPage() {
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="py-6 sm:py-10 bg-white">
      <AboutSection
        titulo={settings?.nosotrosTitulo}
        texto={settings?.nosotrosTexto}
        botonTexto={settings?.nosotrosBoton}
        metricasClientes={settings?.metricasClientes}
        metricasCalificacion={settings?.metricasCalificacion}
        metricasAnos={settings?.metricasAnos}
      />
    </div>
  );
}

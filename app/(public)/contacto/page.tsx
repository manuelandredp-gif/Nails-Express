import React from "react";
import { prisma } from "@/lib/db";
import ContactSection from "@/components/public/ContactSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Comunícate con Nails Express en Tacna. Teléfono, WhatsApp, dirección y horarios de atención.",
};

export const revalidate = 60;

export default async function ContactoPage() {
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="py-6 sm:py-10 bg-white">
      <ContactSection
        telefono={settings?.telefono}
        whatsapp={settings?.whatsapp}
        email={settings?.email}
        direccion={settings?.direccion}
        horario={settings?.horarioVisible}
        showMap={true}
      />
    </div>
  );
}

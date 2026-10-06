import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-content";
import ContactSection from "@/components/public/ContactSection";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: s.contactoTitulo, description: s.contactoSubtitulo };
}

export const revalidate = 60;

export default async function ContactoPage() {
  const [settings, horarios] = await Promise.all([
    getSiteSettings(),
    prisma.businessHours.findMany({
      where: { staffId: null },
      select: { diaSemana: true, horaApertura: true, horaCierre: true, cerrado: true },
    }),
  ]);

  return (
    <div className="py-6 sm:py-10 bg-white">
      <ContactSection settings={settings} showMap={true} horarios={horarios} />
    </div>
  );
}

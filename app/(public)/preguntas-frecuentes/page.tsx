import React from "react";
import { prisma } from "@/lib/db";
import FaqAccordion from "@/components/public/FaqAccordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Resolvemos tus dudas sobre duración del manicure en gel, reservas, métodos de pago y políticas de Nails Express Tacna.",
};

export const revalidate = 60;

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { visible: true },
    orderBy: { orden: "asc" },
  });

  return (
    <div className="py-6 sm:py-10 bg-white">
      <FaqAccordion faqs={faqs} showTitle={true} />
    </div>
  );
}

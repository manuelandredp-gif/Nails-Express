import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-content";
import FaqAccordion from "@/components/public/FaqAccordion";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: s.faqTitulo, description: s.faqSubtitulo };
}

export const revalidate = 60;

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    prisma.faq.findMany({
      where: { visible: true },
      orderBy: { orden: "asc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="py-6 sm:py-10 bg-white">
      <FaqAccordion
        faqs={faqs}
        showTitle={true}
        titulo={settings.faqTitulo}
        subtitulo={settings.faqSubtitulo}
      />
    </div>
  );
}

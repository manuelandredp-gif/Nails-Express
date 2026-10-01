import React from "react";
import { getSiteSettings } from "@/lib/site-content";
import AboutSection from "@/components/public/AboutSection";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: s.nosotrosTitulo, description: s.nosotrosTexto.slice(0, 160) };
}

export const revalidate = 60;

export default async function NosotrosPage() {
  const settings = await getSiteSettings();

  return (
    <div className="py-6 sm:py-10 bg-white">
      <AboutSection settings={settings} />
    </div>
  );
}

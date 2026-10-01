import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-content";
import GalleryGrid from "@/components/public/GalleryGrid";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: s.galeriaTitulo, description: s.galeriaSubtitulo };
}

export const revalidate = 60;

export default async function GaleriaPage() {
  const [items, settings] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { visible: true },
      orderBy: { orden: "asc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="bg-white">
      <GalleryGrid
        items={items}
        showTitle={true}
        titulo={settings.galeriaTitulo}
        subtitulo={settings.galeriaSubtitulo}
      />
    </div>
  );
}

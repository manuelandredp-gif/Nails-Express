import React from "react";
import { prisma } from "@/lib/db";
import GalleryGrid from "@/components/public/GalleryGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galería de Inspiración",
  description:
    "Ideas reales, para uñas reales. Explora nuestros trabajos de manicura, pedicura y diseños personalizados en Nails Express Tacna.",
};

export const revalidate = 60;

export default async function GaleriaPage() {
  const items = await prisma.galleryItem.findMany({
    where: { visible: true },
    orderBy: { orden: "asc" },
  });

  return (
    <div className="bg-white">
      <GalleryGrid items={items} showTitle={true} />
    </div>
  );
}

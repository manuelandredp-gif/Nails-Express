import React from "react";
import { prisma } from "@/lib/db";
import GalleryManager from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGaleriaPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { orden: "asc" },
  });

  return <GalleryManager initialItems={items} />;
}

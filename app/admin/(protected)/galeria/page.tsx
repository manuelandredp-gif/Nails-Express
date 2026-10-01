import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import GalleryManager from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGaleriaPage() {
  await requireManager();
  const items = await prisma.galleryItem.findMany({
    orderBy: { orden: "asc" },
  });

  return <GalleryManager initialItems={items} />;
}

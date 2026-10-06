import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import { INSTAGRAM_CATEGORIA } from "@/lib/site-content";
import InstagramManager from "@/components/admin/InstagramManager";

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  await requireManager();
  const items = await prisma.galleryItem.findMany({
    where: { categoria: INSTAGRAM_CATEGORIA },
    orderBy: { orden: "asc" },
  });

  return <InstagramManager initialItems={items} />;
}

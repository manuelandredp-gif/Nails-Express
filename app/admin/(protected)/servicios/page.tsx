import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import ServicesManager from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export default async function AdminServiciosPage() {
  await requireManager();
  const [services, categories, allStaff] = await Promise.all([
    prisma.service.findMany({
      include: {
        category: { select: { id: true, nombre: true } },
        staff: {
          select: {
            staff: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: { orden: "asc" },
    }),
    prisma.serviceCategory.findMany({
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    }),
    prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    }),
  ]);

  return (
    <ServicesManager
      initialServices={services as any}
      categories={categories}
      allStaff={allStaff}
    />
  );
}

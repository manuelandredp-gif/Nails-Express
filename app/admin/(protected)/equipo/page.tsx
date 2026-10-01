import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import TeamAccessManager from "@/components/admin/TeamAccessManager";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  await requireManager();

  const [users, staff] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        staffId: true,
        createdAt: true,
      },
    }),
    prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    }),
  ]);

  const formatted = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <TeamAccessManager initialUsers={formatted} staff={staff} />;
}

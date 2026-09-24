import React from "react";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import AgendaCalendar from "@/components/admin/AgendaCalendar";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const session = await getAdminSession();

  const [staffList, servicesList] = await Promise.all([
    prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, color: true },
      orderBy: { orden: "asc" },
    }),
    prisma.service.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, precio: true },
      orderBy: { orden: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Agenda del Salón
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Vistas día, semana y mes con detección automática de conflictos
          </p>
        </div>
      </div>

      <AgendaCalendar
        staffList={staffList}
        servicesList={servicesList}
        currentRole={session?.rol || "ADMIN"}
      />
    </div>
  );
}

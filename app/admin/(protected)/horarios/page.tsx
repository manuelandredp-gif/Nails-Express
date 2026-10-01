import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import ScheduleTeamManager from "@/components/admin/ScheduleTeamManager";

export const dynamic = "force-dynamic";

export default async function AdminHorariosPage() {
  await requireManager();
  const [hours, staff] = await Promise.all([
    prisma.businessHours.findMany({
      orderBy: { diaSemana: "asc" },
    }),
    prisma.staff.findMany({
      orderBy: { orden: "asc" },
    }),
  ]);

  return <ScheduleTeamManager initialHours={hours} initialStaff={staff} />;
}

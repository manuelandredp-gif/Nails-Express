import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const hoursPatch = z.object({
  hours: z.array(
    z.object({
      id: z.string(),
      horaApertura: z.string(),
      horaCierre: z.string(),
      cerrado: z.boolean().optional(),
    })
  ),
});

export const GET = withManager(async () => {
  const hours = await prisma.businessHours.findMany({ orderBy: { diaSemana: "asc" } });
  return NextResponse.json({ hours });
});

export const PATCH = withManager(async (req) => {
  const { hours } = await readJson(req, hoursPatch);
  for (const h of hours) {
    await prisma.businessHours.update({
      where: { id: h.id },
      data: {
        horaApertura: h.horaApertura,
        horaCierre: h.horaCierre,
        cerrado: Boolean(h.cerrado),
      },
    });
  }
  revalidatePublicSite();
  return NextResponse.json({ success: true });
});

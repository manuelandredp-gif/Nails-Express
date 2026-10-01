import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withManager, readJson, HttpError } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const schema = z.object({ notasInternas: z.string().max(2000).nullable().optional() }).strict();

/** Exporta todos los datos de una clienta (derecho de acceso, Ley 29733). */
export const GET = withManager(async (_req, { params }) => {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      citas: { include: { service: true, staff: true }, orderBy: { startAt: "desc" } },
      rewards: true,
    },
  });
  if (!customer) throw new HttpError(404, "Clienta no encontrada.");
  return NextResponse.json({ customer });
});

export const PATCH = withManager(async (req, { params }) => {
  const { notasInternas } = await readJson(req, schema);
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: { notasInternas: notasInternas ?? null },
  });
  return NextResponse.json({ success: true, customer });
});

/**
 * Anonimiza a la clienta (derecho de supresión, Ley 29733). No se borra la fila
 * para no romper el historial de citas/caja, pero se eliminan los datos
 * personales (nombre, celular, correo, notas).
 */
export const DELETE = withManager(async (_req, { params }) => {
  const existe = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!existe) throw new HttpError(404, "Clienta no encontrada.");

  await prisma.customer.update({
    where: { id: params.id },
    data: {
      nombre: "Clienta eliminada",
      celular: `anon-${params.id.slice(0, 8)}-${Date.now()}`,
      email: null,
      notasInternas: null,
    },
  });
  return NextResponse.json({ success: true, anonimizada: true });
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withManager, readJson, HttpError } from "@/lib/http/api";
import { customerCreateSchema } from "@/lib/validation/schemas";
import { normalizarCelular } from "@/lib/domain/phone";

export const dynamic = "force-dynamic";

/** Registra una clienta nueva desde el panel (queda en la base de datos). */
export const POST = withManager(async (req) => {
  const b = await readJson(req, customerCreateSchema);
  const celular = normalizarCelular(b.celular);

  const existente = await prisma.customer.findUnique({ where: { celular } });
  if (existente) {
    throw new HttpError(409, `Ya existe una clienta con ese celular (${existente.nombre}).`);
  }

  const customer = await prisma.customer.create({
    data: {
      nombre: b.nombre,
      celular,
      email: b.email || null,
      notasInternas: b.notasInternas || null,
    },
  });

  return NextResponse.json({ success: true, customer }, { status: 201 });
});

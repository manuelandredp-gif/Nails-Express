import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Registra una clienta nueva desde el panel (queda en la base de datos). */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !isManager(session.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const celular = String(body.celular || "").trim();

    if (!nombre || !celular) {
      return NextResponse.json(
        { error: "El nombre y el celular son obligatorios." },
        { status: 400 }
      );
    }

    const existente = await prisma.customer.findUnique({ where: { celular } });
    if (existente) {
      return NextResponse.json(
        { error: `Ya existe una clienta con ese celular (${existente.nombre}).` },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        nombre,
        celular,
        email: body.email ? String(body.email).trim().toLowerCase() : null,
        notasInternas: body.notasInternas
          ? String(body.notasInternas).trim()
          : null,
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al registrar la clienta." },
      { status: 500 }
    );
  }
}

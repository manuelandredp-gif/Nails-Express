import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const timeBlocks = await prisma.timeBlock.findMany({
      include: { staff: true },
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ timeBlocks });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al obtener bloqueos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { staffId, startAt, endAt, motivo } = await request.json();

    if (!startAt || !endAt || !motivo) {
      return NextResponse.json(
        { error: "Fecha inicio, fin y motivo son requeridos." },
        { status: 400 }
      );
    }

    const timeBlock = await prisma.timeBlock.create({
      data: {
        staffId: staffId || null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        motivo,
      },
    });

    return NextResponse.json({ success: true, timeBlock }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al crear bloqueo de horario." },
      { status: 500 }
    );
  }
}

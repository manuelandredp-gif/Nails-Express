import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { notasInternas } = await request.json();

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: { notasInternas },
    });

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar notas del cliente." },
      { status: 500 }
    );
  }
}

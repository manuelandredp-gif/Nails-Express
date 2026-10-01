import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { orden: "asc" },
    });
    return NextResponse.json({ faqs });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar faqs." },
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

    const { pregunta, respuesta } = await request.json();
    const count = await prisma.faq.count();

    const faq = await prisma.faq.create({
      data: {
        pregunta,
        respuesta,
        orden: count + 1,
        visible: true,
      },
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, faq }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al crear pregunta frecuente." },
      { status: 500 }
    );
  }
}

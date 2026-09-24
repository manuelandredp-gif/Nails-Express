import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { orden: "asc" },
    });
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar galería." },
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

    const { imagen, categoria, altText } = await request.json();

    const count = await prisma.galleryItem.count();
    const item = await prisma.galleryItem.create({
      data: {
        imagen,
        categoria: categoria || "Manicure",
        altText: altText || "Diseño Nails Express",
        orden: count + 1,
        visible: true,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al agregar foto." },
      { status: 500 }
    );
  }
}

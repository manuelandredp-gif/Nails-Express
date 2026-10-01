import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { fechaPublicacion: "desc" },
    });
    return NextResponse.json({ posts });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar publicaciones." },
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

    const body = await request.json();
    const {
      titulo,
      slug,
      extracto,
      contenidoHtml,
      imagenPortada,
      categoria = "Tendencias",
      estado = "BORRADOR",
      destacado = false,
      metaTitle,
      metaDescription,
    } = body;

    const autoSlug =
      slug ||
      titulo
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    const post = await prisma.post.create({
      data: {
        titulo,
        slug: autoSlug,
        extracto,
        contenidoHtml,
        imagenPortada:
          imagenPortada ||
          "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800",
        categoria,
        estado,
        autor: session.nombre,
        destacado: Boolean(destacado),
        metaTitle,
        metaDescription,
      },
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error al crear post." },
      { status: 500 }
    );
  }
}

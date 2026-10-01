import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, HttpError } from "@/lib/http/api";

export const dynamic = "force-dynamic";

export const GET = withManager(async () => {
  const posts = await prisma.post.findMany({ orderBy: { fechaPublicacion: "desc" } });
  return NextResponse.json({ posts });
});

export const POST = withManager(async (req, _ctx, session) => {
  const body = await req.json().catch(() => ({}));
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

  if (!titulo || !String(titulo).trim()) {
    throw new HttpError(400, "El título es obligatorio.");
  }

  const autoSlug =
    slug ||
    String(titulo)
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
});

import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import BlogPostsManager from "@/components/admin/BlogPostsManager";

export const dynamic = "force-dynamic";

export default async function PublicacionesPage() {
  await requireManager();
  const posts = await prisma.post.findMany({
    orderBy: { fechaPublicacion: "desc" },
  });

  const formattedPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    extracto: p.extracto,
    contenidoHtml: p.contenidoHtml,
    imagenPortada: p.imagenPortada,
    categoria: p.categoria,
    estado: p.estado,
    fechaPublicacion: p.fechaPublicacion.toISOString(),
    autor: p.autor,
  }));

  return <BlogPostsManager initialPosts={formattedPosts} />;
}

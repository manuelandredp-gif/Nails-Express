import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: `${post.titulo} | Blog Nails Express`,
    description: post.extracto,
    openGraph: {
      title: post.titulo,
      description: post.extracto,
      images: [{ url: post.imagenPortada }],
    },
  };
}

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post || post.estado !== "PUBLICADO") {
    notFound();
  }

  // Related posts
  const relatedPosts = await prisma.post.findMany({
    where: {
      estado: "PUBLICADO",
      id: { not: post.id },
    },
    take: 2,
    orderBy: { fechaPublicacion: "desc" },
  });

  const formattedDate = new Date(post.fechaPublicacion).toLocaleDateString(
    "es-ES",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <article className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-semibold text-[#1A1A1A] hover:text-primary transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a consejos y tendencias</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="inline-block px-3 py-1 bg-[#FAF3F3] text-[#E8707A] text-xs font-bold rounded-full">
            {post.categoria}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
            {post.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#8E8E8E] pt-2 border-b border-gray-100 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formattedDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              <span>Por {post.autor}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>3 min de lectura</span>
            </span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full rounded-[18px] overflow-hidden mb-10 shadow-sm border border-[#ECECEC]">
          <Image
            src={post.imagenPortada}
            alt={post.titulo}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 850px"
            className="object-cover object-center"
          />
        </div>

        {/* Content Body */}
        <div
          className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed space-y-4 font-normal"
          dangerouslySetInnerHTML={{ __html: post.contenidoHtml }}
        />

        {/* CTA to Book */}
        <div className="my-14 bg-[#FBEDED] border border-[#F5D8D8] rounded-[18px] p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-[#1A1A1A]">
            ¿Te gustaría lucir un diseño como este?
          </h3>
          <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
            Nuestras manicuristas expertas en Tacna harán realidad tu idea con la mayor precisión y cuidado.
          </p>
          <div className="pt-2">
            <Link
              href="/reservar"
              className="btn-primary py-3 px-8 text-sm font-semibold shadow-sm inline-flex"
            >
              Reservar cita ahora
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 border-t border-gray-100">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-6">
              Otros artículos recomendados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group flex gap-4 items-center bg-gray-50/70 p-3 rounded-[14px] border border-gray-100 hover:border-primary/40 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={rel.imagenPortada}
                      alt={rel.titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A] group-hover:text-primary transition-colors line-clamp-2">
                      {rel.titulo}
                    </h4>
                    <span className="text-xs text-primary font-semibold mt-1 inline-block">
                      Leer artículo →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

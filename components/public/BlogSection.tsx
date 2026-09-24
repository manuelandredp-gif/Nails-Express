import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface BlogPostItem {
  id: string;
  slug: string;
  titulo: string;
  extracto: string;
  imagenPortada: string;
  fechaPublicacion: Date | string;
  autor?: string;
}

interface BlogSectionProps {
  posts: BlogPostItem[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and "Ver todos" button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Consejos y tendencias
            </h2>
            <p className="mt-2 text-base text-[#6B6B6B]">
              Todo sobre el mundo de las uñas, en un solo lugar.
            </p>
          </div>
          <div>
            <Link
              href="/blog"
              className="btn-primary text-sm py-2.5 px-6 inline-flex"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => {
            const dateStr =
              typeof post.fechaPublicacion === "string"
                ? new Date(post.fechaPublicacion).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : post.fechaPublicacion.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

            return (
              <article
                key={post.id}
                className="bg-white rounded-[16px] border border-[#ECECEC] p-4 flex flex-col justify-between hover:shadow-hover transition-all duration-300 group"
              >
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block relative w-full aspect-[16/10] rounded-[12px] overflow-hidden mb-4 bg-gray-100"
                  >
                    <Image
                      src={post.imagenPortada}
                      alt={post.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <p className="text-xs text-[#8E8E8E] font-medium mb-2">
                    {dateStr}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {post.titulo}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#6B6B6B] mt-2 line-clamp-2 leading-relaxed">
                    {post.extracto}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#F5F5F5]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors group/link"
                  >
                    <span>Leer más</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

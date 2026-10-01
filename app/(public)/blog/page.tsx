import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-content";
import BlogSection from "@/components/public/BlogSection";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: s.blogTitulo, description: s.blogSubtitulo };
}

export const revalidate = 60;

export default async function BlogListPage() {
  const [posts, settings] = await Promise.all([
    prisma.post.findMany({
      where: { estado: "PUBLICADO" },
      orderBy: { fechaPublicacion: "desc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="py-6 sm:py-10 bg-white">
      <BlogSection
        posts={posts}
        titulo={settings.blogTitulo}
        subtitulo={settings.blogSubtitulo}
      />
    </div>
  );
}

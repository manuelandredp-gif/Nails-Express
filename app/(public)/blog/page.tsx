import React from "react";
import { prisma } from "@/lib/db";
import BlogSection from "@/components/public/BlogSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consejos y Tendencias | Blog",
  description:
    "Todo sobre el mundo de las uñas, en un solo lugar. Artículos, tutoriales y últimas tendencias en Nails Express Tacna.",
};

export const revalidate = 60;

export default async function BlogListPage() {
  const posts = await prisma.post.findMany({
    where: { estado: "PUBLICADO" },
    orderBy: { fechaPublicacion: "desc" },
  });

  return (
    <div className="py-6 sm:py-10 bg-white">
      <BlogSection posts={posts} />
    </div>
  );
}

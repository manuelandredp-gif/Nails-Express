import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nailsexpress.com";

  // Dynamic services
  const services = await prisma.service.findMany({
    where: { activo: true },
    select: { slug: true, updatedAt: true },
  });

  // Dynamic posts
  const posts = await prisma.post.findMany({
    where: { estado: "PUBLICADO" },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/servicios`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/reservar`, lastModified: new Date(), priority: 0.95 },
    { url: `${baseUrl}/galeria`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/nosotros`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/preguntas-frecuentes`, lastModified: new Date(), priority: 0.7 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${baseUrl}/servicios/${s.slug}`,
    lastModified: s.updatedAt,
    priority: 0.85,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.75,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}

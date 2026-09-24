import React from "react";
import { prisma } from "@/lib/db";
import Hero from "@/components/public/Hero";
import ServiceCard from "@/components/public/ServiceCard";
import AboutSection from "@/components/public/AboutSection";
import GalleryGrid from "@/components/public/GalleryGrid";
import BlogSection from "@/components/public/BlogSection";
import FaqAccordion from "@/components/public/FaqAccordion";
import ContactSection from "@/components/public/ContactSection";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 60; // ISR revalidation

export default async function HomePage() {
  const [settings, services, galleryItems, posts, faqs] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "default" } }),
    prisma.service.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      take: 6,
    }),
    prisma.galleryItem.findMany({
      where: { visible: true },
      orderBy: { orden: "asc" },
      take: 8,
    }),
    prisma.post.findMany({
      where: { estado: "PUBLICADO" },
      orderBy: { fechaPublicacion: "desc" },
      take: 3,
    }),
    prisma.faq.findMany({
      where: { visible: true },
      orderBy: { orden: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-0">
      {/* 01: Hero */}
      <Hero
        kicker={settings?.heroKicker}
        titulo={settings?.heroTitulo}
        subtitulo={settings?.heroSubtitulo}
        botonTexto={settings?.heroBoton}
      />

      {/* 02: Servicios Destacados (Matching Image 02) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Nuestros servicios
            </h2>
            <p className="mt-3 text-base text-[#6B6B6B]">
              Belleza y cuidado en cada detalle.
            </p>
          </div>

          {/* Quick Filter preview */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            <Link href="/servicios" className="filter-chip active">
              Todos
            </Link>
            <Link href="/servicios?categoria=manicure" className="filter-chip">
              Manicure
            </Link>
            <Link href="/servicios?categoria=pedicure" className="filter-chip">
              Pedicure
            </Link>
            <Link href="/servicios?categoria=disenos" className="filter-chip">
              Diseños
            </Link>
            <Link href="/servicios?categoria=extras" className="filter-chip">
              Extras
            </Link>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                currency={settings?.moneda || "S/"}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/servicios"
              className="btn-outline text-sm py-2.5 px-7 inline-flex items-center gap-2"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 08: Sobre Nosotros (Matching Image 08) */}
      <AboutSection
        titulo={settings?.nosotrosTitulo}
        texto={settings?.nosotrosTexto}
        botonTexto={settings?.nosotrosBoton}
        metricasClientes={settings?.metricasClientes}
        metricasCalificacion={settings?.metricasCalificacion}
        metricasAnos={settings?.metricasAnos}
      />

      {/* 07: Galería de Inspiración (Matching Image 07) */}
      <GalleryGrid items={galleryItems} />

      {/* 09: Blog Consejos y Tendencias (Matching Image 09) */}
      <BlogSection posts={posts} />

      {/* 11: Preguntas Frecuentes (Matching Image 11) */}
      <FaqAccordion faqs={faqs} />

      {/* 10: Contacto (Matching Image 10) */}
      <ContactSection
        telefono={settings?.telefono}
        whatsapp={settings?.whatsapp}
        email={settings?.email}
        direccion={settings?.direccion}
        horario={settings?.horarioVisible}
      />
    </div>
  );
}

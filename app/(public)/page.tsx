import React from "react";
import { prisma } from "@/lib/db";
import Hero from "@/components/public/Hero";
import HomeServicesSection from "@/components/public/HomeServicesSection";
import AboutSection from "@/components/public/AboutSection";
import GalleryGrid from "@/components/public/GalleryGrid";
import BlogSection from "@/components/public/BlogSection";
import FaqAccordion from "@/components/public/FaqAccordion";
import ContactSection from "@/components/public/ContactSection";
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
      {/* 01: Hero (Matching Image 01 Top) */}
      <Hero
        kicker={settings?.heroKicker}
        titulo={settings?.heroTitulo}
        subtitulo={settings?.heroSubtitulo}
        botonTexto={settings?.heroBoton}
      />

      {/* 01B: Nuestros Servicios & Reserva Rápida (Matching Image 01 Bottom) */}
      <HomeServicesSection
        services={services}
        currency={settings?.moneda || "S/"}
      />


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

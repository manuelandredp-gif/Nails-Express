import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings, parsePairs, parseColores, INSTAGRAM_CATEGORIA } from "@/lib/site-content";
import Hero from "@/components/public/Hero";
import HomeServicesSection from "@/components/public/HomeServicesSection";
import AboutSection from "@/components/public/AboutSection";
import GalleryGrid from "@/components/public/GalleryGrid";
import BlogSection from "@/components/public/BlogSection";
import FaqAccordion from "@/components/public/FaqAccordion";
import ContactSection from "@/components/public/ContactSection";
import Reveal from "@/components/public/Reveal";
import BenefitsStrip from "@/components/public/BenefitsStrip";
import TestimonialsSection from "@/components/public/TestimonialsSection";
import SeasonColors from "@/components/public/SeasonColors";
import InstagramStrip from "@/components/public/InstagramStrip";
import BeforeAfter from "@/components/public/BeforeAfter";
import LoyaltyPromo from "@/components/public/LoyaltyPromo";
import CtaBanner from "@/components/public/CtaBanner";
export const revalidate = 60; // ISR revalidation

export default async function HomePage() {
  const [settings, services, galleryItems, instagramItems, posts, faqs, testimonios, horarios] = await Promise.all([
    getSiteSettings(),
    prisma.service.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      take: 6,
    }),
    prisma.galleryItem.findMany({
      where: { visible: true, categoria: { not: INSTAGRAM_CATEGORIA } },
      orderBy: { orden: "asc" },
      take: 8,
    }),
    prisma.galleryItem.findMany({
      where: { visible: true, categoria: INSTAGRAM_CATEGORIA },
      orderBy: { orden: "asc" },
      take: 6,
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
    prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: { orden: "asc" },
      take: 8,
    }),
    prisma.businessHours.findMany({
      where: { staffId: null },
      select: { diaSemana: true, horaApertura: true, horaCierre: true, cerrado: true },
    }),
  ]);

  const beneficios = parsePairs(settings.beneficios).map(([titulo, texto]) => ({ titulo, texto }));
  const colores = parseColores(settings.coloresLista);
  // La franja de Instagram usa sus propias fotos; si aún no hay, cae a la galería.
  const instagramFotos = instagramItems.length > 0 ? instagramItems : galleryItems;

  return (
    <div className="space-y-0">
      <Hero settings={settings} />

      {settings.beneficiosActivo && beneficios.length > 0 && (
        <Reveal>
          <BenefitsStrip items={beneficios} />
        </Reveal>
      )}

      <Reveal>
        <HomeServicesSection
          services={services}
          currency={settings.moneda}
          titulo={settings.serviciosTitulo}
          subtitulo={settings.serviciosSubtitulo}
          botonTodos={settings.serviciosBotonTodos}
          reservaTitulo={settings.reservaRapidaTitulo}
          reservaSubtitulo={settings.reservaRapidaSubtitulo}
          reservaBoton={settings.reservaRapidaBoton}
        />
      </Reveal>

      {settings.coloresActivo && colores.length > 0 && (
        <Reveal>
          <SeasonColors
            colores={colores}
            titulo={settings.coloresTitulo}
            subtitulo={settings.coloresSubtitulo}
          />
        </Reveal>
      )}

      <Reveal>
        <AboutSection settings={settings} />
      </Reveal>

      {settings.antesDespuesActivo && (
        <Reveal>
          <BeforeAfter
            antes={settings.antesImagen}
            despues={settings.despuesImagen}
            titulo={settings.antesDespuesTitulo}
          />
        </Reveal>
      )}

      <Reveal>
        <GalleryGrid
          items={galleryItems}
          titulo={settings.galeriaTitulo}
          subtitulo={settings.galeriaSubtitulo}
          marca={settings.nombreNegocio}
        />
      </Reveal>

      {settings.sellosActivo && (
        <Reveal>
          <LoyaltyPromo
            titulo={settings.sellosTitulo}
            subtitulo={settings.sellosSubtitulo}
            meta={settings.sellosMeta}
            premio={settings.sellosPremio}
            boton={settings.ctaFinalBoton}
          />
        </Reveal>
      )}

      {settings.testimoniosActivo && testimonios.length > 0 && (
        <Reveal>
          <TestimonialsSection
            testimonios={testimonios}
            titulo={settings.testimoniosTitulo}
            subtitulo={settings.testimoniosSubtitulo}
          />
        </Reveal>
      )}

      {settings.instagramActivo && instagramFotos.length > 0 && (
        <Reveal>
          <InstagramStrip
            fotos={instagramFotos}
            usuario={settings.instagramUsuario}
            url={settings.instagramUrl}
          />
        </Reveal>
      )}

      <Reveal>
        <BlogSection
          posts={posts}
          titulo={settings.blogTitulo}
          subtitulo={settings.blogSubtitulo}
        />
      </Reveal>

      <Reveal>
        <FaqAccordion
          faqs={faqs}
          titulo={settings.faqTitulo}
          subtitulo={settings.faqSubtitulo}
        />
      </Reveal>

      <Reveal>
        <CtaBanner
          titulo={settings.ctaFinalTitulo}
          subtitulo={settings.ctaFinalSubtitulo}
          boton={settings.ctaFinalBoton}
          whatsapp={settings.whatsapp}
          whatsappMensaje={settings.whatsappMensaje}
        />
      </Reveal>

      <Reveal>
        <ContactSection settings={settings} horarios={horarios} />
      </Reveal>
    </div>
  );
}

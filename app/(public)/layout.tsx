import React from "react";
import { prisma } from "@/lib/db";
import { getSiteSettings, parseLinks, whatsappLink } from "@/lib/site-content";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categorias, horarios] = await Promise.all([
    getSiteSettings(),
    prisma.serviceCategory.findMany({
      orderBy: { orden: "asc" },
      select: { nombre: true, slug: true },
    }),
    prisma.businessHours.findMany({ where: { staffId: null, cerrado: false } }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nailsexpress.com";
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    name: settings.nombreNegocio,
    image: settings.heroImagen.startsWith("http")
      ? settings.heroImagen
      : `${baseUrl}${settings.heroImagen}`,
    telephone: settings.whatsapp || settings.telefono,
    email: settings.email,
    url: baseUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.direccion,
      addressLocality: settings.ciudad,
      addressRegion: settings.ciudad,
      postalCode: settings.codigoPostal,
      addressCountry: settings.pais,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: parseFloat(settings.latitud) || undefined,
      longitude: parseFloat(settings.longitud) || undefined,
    },
    openingHoursSpecification: horarios.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayNames[h.diaSemana],
      opens: h.horaApertura,
      closes: h.horaCierre,
    })),
    priceRange: settings.rangoPrecios,
    currenciesAccepted: settings.moneda === "S/" ? "PEN" : settings.moneda,
    paymentAccepted: settings.metodosPago,
    sameAs: [settings.instagramUrl, settings.tiktokUrl, settings.facebookUrl].filter(Boolean),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header
        logo={settings.logo}
        logoTextoPrincipal={settings.logoTextoPrincipal}
        logoTextoSecundario={settings.logoTextoSecundario}
        nombreNegocio={settings.nombreNegocio}
        navLinks={parseLinks(settings.menuLinks)}
        botonTexto={settings.headerBoton}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} categorias={categorias} />
      {settings.whatsapp && (
        <FloatingWhatsApp
          href={whatsappLink(settings.whatsapp, settings.whatsappMensaje)}
          label={settings.whatsappBotonTexto}
        />
      )}
    </div>
  );
}

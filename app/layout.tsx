import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { getSiteSettings } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nailsexpress.com";
  const ogImage = s.heroImagen.startsWith("http") ? s.heroImagen : `${baseUrl}${s.heroImagen}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: s.seoTitulo,
      template: `%s | ${s.nombreNegocio}`,
    },
    description: s.seoDescripcion,
    keywords: s.seoKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    authors: [{ name: s.nombreNegocio }],
    creator: s.nombreNegocio,
    icons: s.logo ? { icon: s.logo } : undefined,
    openGraph: {
      title: s.seoTitulo,
      description: s.seoDescripcion,
      siteName: s.nombreNegocio,
      locale: "es_PE",
      type: "website",
      images: [{ url: ogImage }],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-[#1A1A1A] antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}

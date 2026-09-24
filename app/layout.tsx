import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Nails Express | Salón y Estudio de Uñas en Tacna",
    template: "%s | Nails Express Tacna",
  },
  description:
    "Estudio de uñas profesional en Tacna, Perú. Manicure clásico, manicure en gel, pedicure spa y diseños personalizados. Reserva tu cita en línea con disponibilidad en tiempo real.",
  keywords: [
    "uñas tacna",
    "manicure tacna",
    "pedicure tacna",
    "uñas en gel tacna",
    "nails express",
    "reserva de citas uñas",
  ],
  authors: [{ name: "Nails Express" }],
  creator: "Nails Express",
  openGraph: {
    title: "Nails Express | Uñas increíbles, cuando tú quieras",
    description:
      "Manicure, pedicure y diseños personalizados en Tacna. Rápido, fácil y cerca de ti.",
    locale: "es_PE",
    type: "website",
  },
};

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
      </body>
    </html>
  );
}

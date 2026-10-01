import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getSiteSettings } from "@/lib/site-content";
import MisCitasContent from "@/components/public/MisCitasContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Citas",
  description: "Consulta, reprograma o cancela tu cita con tu código de reserva.",
};

export const dynamic = "force-dynamic";

export default async function MisCitasPage() {
  const settings = await getSiteSettings();
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <MisCitasContent
        nombreNegocio={settings.nombreNegocio}
        direccion={settings.direccion}
      />
    </Suspense>
  );
}

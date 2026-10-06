import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, CheckCircle2 } from "lucide-react";
import PopularColorsPicker from "@/components/public/PopularColorsPicker";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
  });
  if (!service) return { title: "Servicio no encontrado" };
  return {
    title: service.metaTitle || service.nombre,
    description: service.metaDescription || service.descripcionCorta,
  };
}

export const revalidate = 60;

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!service) {
    notFound();
  }

  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  let features: string[] = [];
  try {
    features = JSON.parse(service.caracteristicas);
  } catch (e) {
    features = [
      `Duración: ${service.duracionMinutos} min`,
      "Cuidado profesional de cutículas",
      "Materiales esterilizados",
    ];
  }

  let popularColors: string[] = [];
  try {
    popularColors = JSON.parse(service.coloresPopulares);
  } catch (e) {
    popularColors = [
      "#F48FB1",
      "#F8BBD0",
      "#C2185B",
      "#B71C1C",
      "#80CBC4",
      "#B39DDB",
      "#90A4AE",
    ];
  }

  return (
    <div className="py-10 sm:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link (Matching Image 03) */}
        <div className="mb-8">
          <Link
            href="/servicios"
            className="inline-flex items-center text-sm font-semibold text-[#1A1A1A] hover:text-primary transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a servicios</span>
          </Link>
        </div>

        {/* Two Column Layout (Matching Image 03) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Big Photo */}
          <div className="md:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-[18px] overflow-hidden shadow-sm border border-[#ECECEC] bg-gray-50">
              <Image
                src={service.imagenPrincipal}
                alt={service.nombre}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column: Service Details */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                {service.nombre}
              </h1>
              <div className="mt-2 text-2xl font-bold text-[#3EA59E]">
                {settings?.moneda || "S/"} {service.precio.toFixed(0)}
              </div>
            </div>

            {/* Rating Stars (4.9 / 120 reseñas) */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-[#FFB800]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#FFB800]"
                    strokeWidth={1}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">
                {settings?.servicioRating || "4.9"}
              </span>
              <span className="text-xs text-[#8E8E8E]">
                {settings?.servicioRatingTexto || ""}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed">
              {service.descripcionLarga}
            </p>

            {/* Features with circular icons */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#E6F6F4] text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#1A1A1A] font-medium">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            {/* Reserve Button */}
            <div className="pt-4">
              <Link
                href={`/reservar?service=${service.slug}`}
                className="btn-primary w-full sm:w-auto py-3.5 px-10 text-sm font-semibold shadow-sm hover:shadow-md justify-center"
              >
                Reservar este servicio
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Colors Section (Interactive) */}
        <PopularColorsPicker
          colors={popularColors}
          serviceSlug={service.slug}
        />
      </div>
    </div>
  );
}

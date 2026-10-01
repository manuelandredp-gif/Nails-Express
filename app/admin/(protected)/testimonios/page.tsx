import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function TestimoniosPage() {
  await requireManager();
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { orden: "asc" },
  });

  const formatted = testimonials.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    texto: t.texto,
    avatar: t.avatar,
    estrellas: t.estrellas,
    servicio: t.servicio,
    orden: t.orden,
    visible: t.visible,
  }));

  return <TestimonialsManager initial={formatted} />;
}

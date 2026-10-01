"use client";

import React, { useState } from "react";
import ServiceCard, { ServiceItem } from "@/components/public/ServiceCard";

interface ServicesCatalogProps {
  initialServices: (ServiceItem & {
    category?: { slug: string; nombre: string };
  })[];
  currency?: string;
  defaultCategory?: string;
  categorias?: { nombre: string; slug: string }[];
  titulo?: string;
  subtitulo?: string;
}

export default function ServicesCatalog({
  initialServices,
  currency = "S/",
  defaultCategory = "todos",
  categorias = [],
  titulo = "Nuestros servicios",
  subtitulo = "Belleza y cuidado en cada detalle.",
}: ServicesCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const categories = [
    { label: "Todos", slug: "todos" },
    ...categorias.map((c) => ({ label: c.nombre, slug: c.slug })),
  ];

  const filteredServices =
    selectedCategory === "todos"
      ? initialServices
      : initialServices.filter((s) => {
          const catSlug = s.category?.slug?.toLowerCase() || "";
          return (
            catSlug === selectedCategory.toLowerCase() ||
            s.nombre.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        });

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (Matching image 02) */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            {titulo}
          </h1>
          <p className="mt-3 text-base text-[#6B6B6B]">
            {subtitulo}
          </p>
        </div>

        {/* Filter Chips (Matching image 02) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`filter-chip ${isActive ? "active" : ""}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3 Columns Grid (Matching image 02) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              currency={currency}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 text-[#6B6B6B]">
            No se encontraron servicios en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
}

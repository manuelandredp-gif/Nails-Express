"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

export interface GalleryPhoto {
  id: string;
  imagen: string;
  categoria: string;
  altText: string;
}

interface GalleryGridProps {
  items: GalleryPhoto[];
  showTitle?: boolean;
  titulo?: string;
  subtitulo?: string;
  marca?: string;
}

// Placeholder gris para el efecto "blur-up" mientras carga cada foto.
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRTdFMUQ2Ii8+PC9zdmc+";

export default function GalleryGrid({
  items,
  showTitle = true,
  titulo = "Galería de inspiración",
  subtitulo = "Ideas reales, para uñas reales.",
  marca,
}: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Categorías derivadas de las fotos cargadas en el admin
  const categories = [
    "Todos",
    ...Array.from(new Set(items.map((i) => i.categoria).filter(Boolean))),
  ];

  const filteredItems =
    selectedCategory === "Todos"
      ? items
      : items.filter(
          (item) =>
            item.categoria.toLowerCase() === selectedCategory.toLowerCase()
        );

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % filteredItems.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex(
        (activePhotoIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  return (
    <section className="py-16 sm:py-20 sec-mint">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              {titulo}
            </h2>
            <p className="mt-3 text-base text-[#6B6B6B]">
              {subtitulo}
            </p>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-chip ${isActive ? "active" : ""}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 4 Columns Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square rounded-[14px] overflow-hidden bg-gray-100 cursor-pointer border border-[#ECECEC] hover:shadow-hover transition-all duration-300"
            >
              <Image
                src={item.imagen}
                alt={item.altText}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
              />

              {/* Etiqueta de categoría (#12) */}
              {item.categoria && (
                <span className="absolute top-2 left-2 z-10 text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-[#1A1A1A] shadow-xs">
                  {item.categoria}
                </span>
              )}

              {/* Marca de agua discreta (#11) */}
              {marca && (
                <span className="absolute bottom-2 right-2.5 z-10 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none select-none">
                  {marca}
                </span>
              )}

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-md">
                  <Eye className="w-5 h-5 text-primary" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-[#6B6B6B]">
            No hay imágenes en esta categoría por el momento.
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhotoIndex !== null && filteredItems[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Cerrar vista previa"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          {filteredItems.length > 1 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 sm:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Image */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-[80vh] flex flex-col items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={filteredItems[activePhotoIndex].imagen}
                alt={filteredItems[activePhotoIndex].altText}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <p className="mt-3 text-white/80 text-sm text-center font-medium">
              {filteredItems[activePhotoIndex].altText}
            </p>
          </div>

          {/* Next Button */}
          {filteredItems.length > 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 sm:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
              aria-label="Siguiente foto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

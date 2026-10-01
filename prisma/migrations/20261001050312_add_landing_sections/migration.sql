-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "antesDespuesActivo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "antesDespuesTitulo" TEXT NOT NULL DEFAULT 'La transformación',
ADD COLUMN     "antesImagen" TEXT NOT NULL DEFAULT '/images/salon-interior.jpg',
ADD COLUMN     "beneficios" TEXT NOT NULL DEFAULT 'Reserva online|Agenda tu cita 24/7 en segundos
Productos premium|Marcas de primera calidad
Manicuristas expertas|Equipo profesional y cálido
Puntualidad|Respetamos tu tiempo',
ADD COLUMN     "beneficiosActivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "coloresActivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "coloresLista" TEXT NOT NULL DEFAULT 'Rosa Blush|#F3A6BC
Coral Dulce|#E8707A
Nude Elegante|#E8C5A8
Lila Suave|#C9A6E6
Menta Fresca|#9FE0D9
Rojo Pasión|#C8455F
Durazno|#FBCDA8
Perla|#F0E6E8',
ADD COLUMN     "coloresSubtitulo" TEXT NOT NULL DEFAULT 'Los tonos que están marcando tendencia',
ADD COLUMN     "coloresTitulo" TEXT NOT NULL DEFAULT 'Colores de temporada',
ADD COLUMN     "despuesImagen" TEXT NOT NULL DEFAULT '/images/hero-hands.jpg',
ADD COLUMN     "instagramActivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "instagramUsuario" TEXT NOT NULL DEFAULT '@nailsexpress',
ADD COLUMN     "testimoniosActivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "testimoniosSubtitulo" TEXT NOT NULL DEFAULT 'Miles de manos felices y uñas increíbles',
ADD COLUMN     "testimoniosTitulo" TEXT NOT NULL DEFAULT 'Lo que dicen nuestras clientas';

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "avatar" TEXT,
    "estrellas" INTEGER NOT NULL DEFAULT 5,
    "servicio" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Settings } from "@prisma/client";

export type SiteSettings = Settings;

/**
 * Devuelve la configuración del sitio. Si no existe el registro "default",
 * lo crea con los valores por defecto del schema.
 *
 * Envuelto en `cache()`: durante UNA misma petición (layout + página +
 * componentes), la consulta a la BD se hace una sola vez y se reutiliza.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const existing = await prisma.settings.findUnique({ where: { id: "default" } });
  if (existing) return existing;
  // upsert evita una carrera si dos peticiones lo crean a la vez en el primer arranque.
  return prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
});

export interface SiteLink {
  name: string;
  href: string;
}

/** Convierte "Texto|/ruta" (una por línea) en una lista de enlaces. */
export function parseLinks(raw: string | null | undefined): SiteLink[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, href] = line.split("|").map((s) => s.trim());
      return { name: name || href || "", href: href || "#" };
    })
    .filter((l) => l.name);
}

/**
 * Categoría reservada para las fotos que solo se muestran en la franja
 * "Síguenos en Instagram" (no aparecen en la galería normal).
 */
export const INSTAGRAM_CATEGORIA = "Instagram";

/** Acabados de esmalte disponibles para los círculos de la paleta. */
export type AcabadoColor = "normal" | "satinado" | "ojo-de-gato" | "mate";

export interface ColorTemporada {
  nombre: string;
  hex: string;
  acabado: AcabadoColor;
}

const ACABADOS_VALIDOS: AcabadoColor[] = ["normal", "satinado", "ojo-de-gato", "mate"];

function normalizarAcabado(raw: string | undefined): AcabadoColor {
  const v = (raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-"); // "ojo de gato" -> "ojo-de-gato"
  return (ACABADOS_VALIDOS as string[]).includes(v) ? (v as AcabadoColor) : "normal";
}

/**
 * Convierte "Nombre|#hex|acabado" (una por línea) en colores de temporada.
 * El acabado es opcional; valores: satinado, ojo-de-gato, mate (o vacío = normal).
 */
export function parseColores(raw: string | null | undefined): ColorTemporada[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nombre, hex, acabado] = line.split("|").map((s) => s.trim());
      return {
        nombre: nombre || "",
        hex: hex || "#E8C5A8",
        acabado: normalizarAcabado(acabado),
      };
    })
    .filter((c) => c.nombre);
}

/**
 * Devuelve una URL de Google Maps que SÍ se puede incrustar en un <iframe>.
 * - Si ya es una URL de tipo "embed", se usa tal cual.
 * - Si no (enlace de compartir, coordenadas, etc.), se arma una embebible
 *   a partir de la latitud/longitud guardadas. Así el mapa nunca "se rompe".
 */
export function buildMapEmbedUrl(
  settings: Pick<Settings, "mapaEmbedUrl" | "latitud" | "longitud" | "direccion">
): string {
  const raw = (settings.mapaEmbedUrl || "").trim();
  const esEmbed = /\/maps\/embed|output=embed/i.test(raw);
  if (esEmbed && raw) return raw;

  const lat = (settings.latitud || "").trim();
  const lng = (settings.longitud || "").trim();
  if (lat && lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`;
  }

  const dir = (settings.direccion || "").trim();
  if (dir) {
    return `https://www.google.com/maps?q=${encodeURIComponent(dir)}&z=16&output=embed`;
  }

  return "";
}

/** Convierte "A|B" (una por línea) en una lista de pares [A, B]. */
export function parsePairs(raw: string | null | undefined): [string, string][] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split("|").map((s) => s.trim());
      return [a || "", b || ""] as [string, string];
    })
    .filter((p) => p[0]);
}

/** Número de WhatsApp limpio para wa.me (solo dígitos). */
export function whatsappDigits(raw: string | null | undefined): string {
  return (raw || "").replace(/\D/g, "");
}

export function whatsappLink(number: string | null | undefined, message: string): string {
  return `https://wa.me/${whatsappDigits(number)}?text=${encodeURIComponent(message)}`;
}

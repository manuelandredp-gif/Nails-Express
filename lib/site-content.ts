import { prisma } from "@/lib/db";
import type { Settings } from "@prisma/client";

export type SiteSettings = Settings;

/**
 * Devuelve la configuración del sitio. Si no existe el registro "default",
 * lo crea con los valores por defecto del schema.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const existing = await prisma.settings.findUnique({ where: { id: "default" } });
  if (existing) return existing;
  // upsert evita una carrera si dos peticiones lo crean a la vez en el primer arranque.
  return prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

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

import { prisma } from "@/lib/db";
import { logError } from "@/lib/infrastructure/logger";

/**
 * Límite de tasa PERSISTENTE (respaldado en la base de datos), compartido entre
 * todas las instancias serverless de Vercel. El enfoque anterior guardaba los
 * contadores en memoria por proceso, así que en varias instancias el atacante
 * repartía los intentos y el límite casi no lo tocaba.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ ok: boolean; remaining: number; retryAfterMs: number }> {
  const now = Date.now();
  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    // Ventana nueva (no existe o ya expiró): reiniciar el contador.
    if (!existing || existing.resetAt.getTime() < now) {
      const resetAt = new Date(now + windowMs);
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { ok: true, remaining: max - 1, retryAfterMs: 0 };
    }

    const count = existing.count + 1;
    await prisma.rateLimit.update({ where: { key }, data: { count } });

    if (count > max) {
      return { ok: false, remaining: 0, retryAfterMs: existing.resetAt.getTime() - now };
    }
    return { ok: true, remaining: max - count, retryAfterMs: 0 };
  } catch (err) {
    // Si el contador falla, no bloqueamos el login legítimo; solo lo registramos.
    logError("rate_limit_error", err, { key });
    return { ok: true, remaining: max, retryAfterMs: 0 };
  }
}

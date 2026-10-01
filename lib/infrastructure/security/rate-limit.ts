/**
 * Límite de tasa en memoria (por instancia). Suficiente para proteger el login
 * de fuerza bruta básica. Para varias instancias, respaldar con Redis/Upstash.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterMs: 0 };
  }

  b.count += 1;
  if (b.count > max) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  }
  return { ok: true, remaining: max - b.count, retryAfterMs: 0 };
}

// Limpieza periódica para no crecer sin límite.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    buckets.forEach((v, k) => {
      if (now > v.resetAt) buckets.delete(k);
    });
  }, 10 * 60 * 1000).unref?.();
}

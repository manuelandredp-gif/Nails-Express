/**
 * Utilidades de dinero. El precio se guarda como número (soles con céntimos).
 * El riesgo real del punto flotante no está en un valor suelto (39.00 es exacto)
 * sino en ACUMULAR muchos: por eso toda suma de caja pasa por aquí y se redondea
 * a céntimos en cada paso, evitando desviaciones de centavos en los totales.
 */

/** Redondea a 2 decimales (céntimos) de forma estable. */
export function redondearDinero(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Suma una lista de importes redondeando a céntimos (evita acumulación de error). */
export function sumarDinero(importes: number[]): number {
  const totalCentimos = importes.reduce(
    (acc, n) => acc + Math.round((n + Number.EPSILON) * 100),
    0
  );
  return totalCentimos / 100;
}

/** Suma el campo `precio` de una lista de objetos. */
export function sumarPrecios<T extends { precio: number }>(items: T[]): number {
  return sumarDinero(items.map((i) => i.precio));
}

/** Formatea un importe con su símbolo de moneda. */
export function formatearDinero(n: number, moneda = "S/"): string {
  return `${moneda} ${redondearDinero(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

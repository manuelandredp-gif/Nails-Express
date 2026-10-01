/**
 * Logger estructurado mínimo. Reemplaza los `console.log("error")` sin contexto:
 * emite JSON de una línea con nivel, evento, timestamp y contexto, para que los
 * logs de Vercel sean filtrables y digan QUÉ falló y DE QUIÉN/QUÉ.
 */
type Contexto = Record<string, unknown>;

function emit(level: "info" | "warn" | "error", evento: string, ctx?: Contexto) {
  const linea = JSON.stringify({
    level,
    evento,
    ts: new Date().toISOString(),
    ...ctx,
  });
  if (level === "error") console.error(linea);
  else if (level === "warn") console.warn(linea);
  else console.log(linea);
}

export function logInfo(evento: string, ctx?: Contexto) {
  emit("info", evento, ctx);
}

export function logWarn(evento: string, ctx?: Contexto) {
  emit("warn", evento, ctx);
}

export function logError(evento: string, err: unknown, ctx?: Contexto) {
  emit("error", evento, {
    ...ctx,
    mensaje: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
}

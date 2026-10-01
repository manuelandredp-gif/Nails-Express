# ADR 002 — Permisos y validación centralizados en las rutas

**Estado:** Aceptado · 2026-10-01

## Contexto
La autorización vivía en tres lugares (middleware, páginas y 24 comprobaciones
`rol === "OWNER" || ...` escritas a mano en cada ruta). Esa triple contabilidad
ya causó un hueco real: el GET de una cita por id quedó sin verificación de rol.
La validación de entrada era artesanal (`String(body.x || "").trim()`) con 127
usos de `any` en las fronteras.

## Decisión
- **Permisos:** una sola fuente por ruta mediante `lib/http/api.ts`:
  `withManager` (dueña/admin), `withSession` (cualquier usuario), `withRole(roles)`.
  El `middleware.ts` se mantiene como **defensa en profundidad** (redirige páginas,
  responde 401/403 a la API), no como la única barrera.
- **Validación:** esquemas `zod` por recurso en `lib/validation/schemas.ts`,
  consumidos con `readJson(req, schema)`. zod infiere el tipo, así desaparecen los
  `any` de los cuerpos de petición y los datos inválidos se rechazan en la frontera.
- **Errores:** `HttpError(status, mensaje)` se traduce a la respuesta HTTP; cualquier
  error inesperado se registra con el logger y responde 500.

## Regla automatizada
`FF-01` en `scripts/fitness-check.mjs` falla el build si una ruta en
`app/api/admin/**` (salvo login/logout) vuelve a usar `getAdminSession` directo.
